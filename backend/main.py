from fastapi import FastAPI, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import date, datetime
import beancount
from beancount import loader
from beancount.core import data
from beancount.core.data import Transaction, Open, Close, Balance, Price
from beancount.core.number import D
from beancount.parser import parser
from beancount.parser import printer
import os
import tempfile
import json
import pandas as pd
import io

app = FastAPI(title="Beancount API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BEANCOUNT_FILE = os.getenv("BEANCOUNT_FILE", "ledger.beancount")

class PostingModel(BaseModel):
    account: str
    amount: Optional[Dict[str, Any]] = None
    cost: Optional[Dict[str, Any]] = None
    price: Optional[Dict[str, Any]] = None

class TransactionModel(BaseModel):
    date: str
    flag: str
    payee: Optional[str] = None
    narration: str
    postings: List[PostingModel]
    metadata: Optional[Dict[str, str]] = None

class AccountModel(BaseModel):
    name: str
    type: str
    openDate: str
    closeDate: Optional[str] = None
    metadata: Optional[Dict[str, str]] = None

def beancount_to_dict(entry, index=None):
    """Convert beancount entry to dictionary"""
    if isinstance(entry, Transaction):
        # Generate stable ID from transaction content
        entry_id = entry.meta.get("id")
        if not entry_id:
            entry_id = f"{entry.date.isoformat()}-{hash((entry.payee or '') + entry.narration + str(entry.postings))}"
        return {
            "id": str(entry_id),
            "date": entry.date.isoformat(),
            "flag": entry.flag,
            "payee": entry.payee,
            "narration": entry.narration,
            "postings": [
                {
                    "account": posting.account,
                    "amount": {
                        "number": str(posting.units.number),
                        "currency": str(posting.units.currency)
                    } if posting.units else None,
                    "cost": {
                        "number": str(posting.cost.number),
                        "currency": str(posting.cost.currency),
                        "date": posting.cost.date.isoformat() if posting.cost and posting.cost.date else None,
                    } if posting.cost else None,
                    "price": {
                        "number": str(posting.price.number),
                        "currency": str(posting.price.currency),
                        "date": None,  # Amount objects don't have dates
                    } if posting.price else None,
                }
                for posting in entry.postings
            ],
            "metadata": {k: v for k, v in entry.meta.items() if k not in ["filename", "lineno"]}
        }
    elif isinstance(entry, Open):
        return {
            "name": entry.account,
            "type": _get_account_type(entry.account),
            "openDate": entry.date.isoformat(),
            "closeDate": None,
            "metadata": {k: v for k, v in entry.meta.items() if k not in ["filename", "lineno"]}
        }
    elif isinstance(entry, Close):
        return {
            "name": entry.account,
            "closeDate": entry.date.isoformat(),
        }
    elif isinstance(entry, Balance):
        return {
            "account": entry.account,
            "date": entry.date.isoformat(),
            "amount": {
                "number": str(entry.amount.number),
                "currency": str(entry.amount.currency)
            }
        }
    elif isinstance(entry, Price):
        return {
            "date": entry.date.isoformat(),
            "currency": str(entry.currency),
            "amount": {
                "number": str(entry.amount.number),
                "currency": str(entry.amount.currency)
            }
        }
    return None

def _get_account_type(account_name: str) -> str:
    """Determine account type from account name"""
    if account_name.startswith("Assets"):
        return "Assets"
    elif account_name.startswith("Liabilities"):
        return "Liabilities"
    elif account_name.startswith("Equity"):
        return "Equity"
    elif account_name.startswith("Income"):
        return "Income"
    elif account_name.startswith("Expenses"):
        return "Expenses"
    return "Assets"

def load_beancount_file(filepath: str = BEANCOUNT_FILE):
    """Load and parse beancount file"""
    try:
        if not os.path.exists(filepath):
            return [], [], [], [], [f"File not found: {filepath}"]
        
        if not os.path.isfile(filepath):
            return [], [], [], [], [f"Path is not a file: {filepath}"]
        
        # Check file size - warn if very large
        file_size = os.path.getsize(filepath)
        if file_size > 10 * 1024 * 1024:  # 10MB
            print(f"Warning: Large file detected ({file_size / 1024 / 1024:.2f}MB): {filepath}")
        
        entries, errors, options_map = loader.load_file(filepath)
        
        transactions = []
        accounts = []
        balances = []
        prices = []
        account_close_dates = {}
        
        for index, entry in enumerate(entries):
            try:
                entry_dict = beancount_to_dict(entry, index)
                if entry_dict:
                    if isinstance(entry, Transaction):
                        transactions.append(entry_dict)
                    elif isinstance(entry, Open):
                        accounts.append(entry_dict)
                    elif isinstance(entry, Close):
                        account_close_dates[entry.account] = entry.date.isoformat()
                    elif isinstance(entry, Balance):
                        balances.append(entry_dict)
                    elif isinstance(entry, Price):
                        prices.append(entry_dict)
            except Exception as e:
                errors.append(f"Error processing entry {index}: {str(e)}")
                continue
        
        # Update accounts with close dates
        for account in accounts:
            if account["name"] in account_close_dates:
                account["closeDate"] = account_close_dates[account["name"]]
        
        return transactions, accounts, balances, prices, errors
    except Exception as e:
        import traceback
        error_msg = f"Failed to load beancount file: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        return [], [], [], [], [error_msg]

@app.get("/")
async def root():
    return {"message": "Beancount API", "version": "1.0.0"}

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/files/browse")
async def browse_files(path: Optional[str] = Query(default=None, description="Directory path to browse")):
    """Browse files and directories in the file system"""
    try:
        import pathlib
        
        # Default to home directory if no path provided
        if path is None or not path or path.strip() == "":
            home_path = pathlib.Path.home()
            if not home_path.exists():
                raise HTTPException(status_code=404, detail="Home directory does not exist")
            requested_path = home_path
        else:
            # Security: Only allow browsing within user's home directory or common safe paths
            home_path = pathlib.Path.home()
            requested_path = pathlib.Path(path)
            
            # Resolve the path (handles relative paths and symlinks)
            try:
                requested_path = requested_path.resolve()
            except (OSError, ValueError) as e:
                raise HTTPException(status_code=400, detail=f"Invalid path: {str(e)}")
            
            # Check if path is within home directory or is a common safe path
            safe_paths = [
                home_path,
                pathlib.Path("/tmp"),
                pathlib.Path("/var/tmp"),
            ]
            
            is_safe = any(
                str(requested_path).startswith(str(safe_path)) for safe_path in safe_paths
            ) or str(requested_path).startswith(str(home_path))
            
            if not is_safe:
                raise HTTPException(status_code=403, detail="Access denied to this path")
        
        if not requested_path.exists():
            raise HTTPException(status_code=404, detail=f"Path does not exist: {requested_path}")
        
        if not requested_path.is_dir():
            raise HTTPException(status_code=400, detail=f"Path is not a directory: {requested_path}")
        
        items = []
        try:
            for item in requested_path.iterdir():
                try:
                    item_info = {
                        "name": item.name,
                        "path": str(item),
                        "is_directory": item.is_dir(),
                        "is_file": item.is_file(),
                    }
                    
                    # Only include .beancount files or directories
                    if item.is_dir() or (item.is_file() and (item.suffix == ".beancount" or item.suffix == ".bean")):
                        items.append(item_info)
                except (PermissionError, OSError) as e:
                    # Skip items we can't access
                    continue
        except PermissionError as e:
            raise HTTPException(status_code=403, detail=f"Permission denied: {str(e)}")
        
        # Sort: directories first, then files, both alphabetically
        items.sort(key=lambda x: (not x["is_directory"], x["name"].lower()))
        
        # Determine parent path
        parent_path = None
        if requested_path.parent != requested_path:
            parent_path = str(requested_path.parent)
        
        return {
            "path": str(requested_path),
            "parent": parent_path,
            "items": items
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"Failed to browse directory: {str(e)}\n{traceback.format_exc()}"
        raise HTTPException(status_code=500, detail=error_detail)

@app.get("/api/files/common-paths")
async def get_common_paths():
    """Get common file system paths"""
    import pathlib
    home = pathlib.Path.home()
    
    common_paths = [
        {"name": "Home", "path": str(home)},
        {"name": "Documents", "path": str(home / "Documents")},
        {"name": "Desktop", "path": str(home / "Desktop")},
        {"name": "Downloads", "path": str(home / "Downloads")},
    ]
    
    # Filter to only include paths that exist
    existing_paths = [p for p in common_paths if pathlib.Path(p["path"]).exists()]
    
    return {"paths": existing_paths}

@app.post("/api/files/create")
async def create_beancount_file(file_path: str = Query(..., description="Path where to create the Beancount file")):
    """Create a new Beancount file at the specified path"""
    try:
        # Check if file already exists
        if os.path.exists(file_path):
            raise HTTPException(status_code=400, detail=f"File already exists at {file_path}")
        
        # Create directory if it doesn't exist
        directory = os.path.dirname(file_path)
        if directory and not os.path.exists(directory):
            os.makedirs(directory, exist_ok=True)
        
        # Create a basic Beancount file with default structure
        today = date.today().isoformat()
        
        default_content = f"""option "title" "Beancount Ledger - Indian Accounting"
option "operating_currency" "INR"

; Assets
{today} open Assets:Bank:Checking
{today} open Assets:Bank:Savings
{today} open Assets:Cash
{today} open Assets:Investments:FD
{today} open Assets:Investments:Equity
{today} open Assets:Investments:MF
{today} open Assets:Property

; Liabilities
{today} open Liabilities:CreditCard
{today} open Liabilities:Loan:Home
{today} open Liabilities:Loan:Personal
{today} open Liabilities:Loan:Education

; Income
{today} open Income:Salary
{today} open Income:Salary:Allowances
{today} open Income:Interest:FD
{today} open Income:Interest:Savings
{today} open Income:Dividends
{today} open Income:CapitalGains:STCG
{today} open Income:CapitalGains:LTCG
{today} open Income:Business:Profession
{today} open Income:Other:HouseProperty

; Expenses
{today} open Expenses:Food
{today} open Expenses:Transport
{today} open Expenses:Utilities
{today} open Expenses:Entertainment
{today} open Expenses:Medical
{today} open Expenses:Education
{today} open Expenses:Home:Maintenance
{today} open Expenses:Home:PropertyTax

; Tax Deductions (Income Tax Act Sections)
{today} open Expenses:Tax:80C
{today} open Expenses:Tax:80D
{today} open Expenses:Tax:80G
{today} open Expenses:Tax:24B
{today} open Expenses:Tax:80E
{today} open Expenses:Tax:80TTA
{today} open Expenses:Tax:80CCD
{today} open Expenses:Tax:80DDB
{today} open Expenses:Tax:80U

; GST Accounts
{today} open Expenses:GST:Input:CGST
{today} open Expenses:GST:Input:SGST
{today} open Expenses:GST:Input:IGST
{today} open Income:GST:Output:CGST
{today} open Income:GST:Output:SGST
{today} open Income:GST:Output:IGST

; Equity
{today} open Equity:Opening-Balances

; Opening balance example (uncomment and adjust as needed)
; {today} * "Opening Balance"
;   Assets:Bank:Checking    100000.00 INR
;   Equity:Opening-Balances

"""
        
        # Write the file
        with open(file_path, "w") as f:
            f.write(default_content)
        
        # Validate the created file
        entries, errors, options_map = loader.load_file(file_path)
        
        return {
            "success": True,
            "file_path": file_path,
            "message": f"Beancount file created successfully at {file_path}",
            "errors": errors if errors else []
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create file: {str(e)}")

def apply_filters(transactions: list, filters: dict) -> list:
    """Apply filters to transactions"""
    filtered = transactions
    
    # Apply free text filter
    free_text = filters.get("freeText", "").strip().lower()
    if free_text:
        filtered = [
            t for t in filtered
            if (t.get("payee", "") or "").lower().find(free_text) != -1
            or (t.get("narration", "") or "").lower().find(free_text) != -1
            or any(
                p.get("account", "").lower().find(free_text) != -1
                for p in t.get("postings", [])
            )
        ]
    
    # Apply property filters
    tokens = filters.get("tokens", [])
    operation = filters.get("operation", "and")
    
    if tokens:
        def matches_token(transaction: dict, token: dict) -> bool:
            property_key = token.get("propertyKey")
            operator = token.get("operator")
            value = token.get("value", "").lower()
            
            if property_key == "payee":
                transaction_value = (transaction.get("payee") or "").lower()
            elif property_key == "narration":
                transaction_value = (transaction.get("narration") or "").lower()
            elif property_key in ["account", "accounts"]:
                transaction_value = " ".join(
                    p.get("account", "") for p in transaction.get("postings", [])
                ).lower()
            elif property_key == "type":
                postings = transaction.get("postings", [])
                is_income = any(p.get("account", "").startswith("Income") for p in postings)
                is_expense = any(p.get("account", "").startswith("Expenses") for p in postings)
                transaction_value = "income" if is_income else ("expense" if is_expense else "other")
            else:
                return True
            
            if operator == ":":
                return value in transaction_value
            elif operator == "!:":
                return value not in transaction_value
            elif operator == "=":
                return transaction_value == value
            elif operator == "!=":
                return transaction_value != value
            return True
        
        if operation == "or":
            filtered = [t for t in filtered if any(matches_token(t, token) for token in tokens)]
        else:  # and
            filtered = [t for t in filtered if all(matches_token(t, token) for token in tokens)]
    
    return filtered

@app.get("/api/transactions")
async def get_transactions(
    file_path: str = Query(..., description="Path to Beancount file"),
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(25, ge=1, le=100, description="Number of items per page"),
    free_text: Optional[str] = Query(None, description="Free text search"),
    filter_tokens: Optional[str] = Query(None, description="JSON string of filter tokens"),
    filter_operation: Optional[str] = Query("and", description="Filter operation: and or or"),
    sort_field: Optional[str] = Query(None, description="Field to sort by"),
    sort_descending: Optional[bool] = Query(False, description="Sort in descending order")
):
    """Get transactions with pagination and filtering"""
    try:
        if not file_path or not file_path.strip():
            raise HTTPException(status_code=400, detail="File path is required")
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail=f"File not found: {file_path}")
        
        transactions, _, _, _, errors = load_beancount_file(file_path)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"Failed to load transactions: {str(e)}\n{traceback.format_exc()}"
        raise HTTPException(status_code=500, detail=error_detail)
    
    # Apply filters
    filters = {}
    if free_text:
        filters["freeText"] = free_text
    if filter_tokens:
        try:
            import json
            filters["tokens"] = json.loads(filter_tokens)
        except:
            filters["tokens"] = []
    filters["operation"] = filter_operation or "and"
    
    if filters.get("freeText") or filters.get("tokens"):
        transactions = apply_filters(transactions, filters)
    
    # Apply sorting
    if sort_field:
        reverse = sort_descending if sort_descending else False
        
        def get_sort_value(transaction: dict):
            field = sort_field.lower()
            if field == "date":
                return transaction.get("date", "")
            elif field == "payee":
                return (transaction.get("payee") or "").lower()
            elif field == "narration":
                return (transaction.get("narration") or "").lower()
            elif field == "accounts":
                return " ".join(
                    p.get("account", "") for p in transaction.get("postings", [])
                ).lower()
            else:
                return ""
        
        transactions = sorted(transactions, key=get_sort_value, reverse=reverse)
    
    # Calculate pagination
    total_count = len(transactions)
    total_pages = (total_count + page_size - 1) // page_size if total_count > 0 else 1
    start_index = (page - 1) * page_size
    end_index = start_index + page_size
    paginated_transactions = transactions[start_index:end_index]
    
    if errors:
        return {
            "transactions": paginated_transactions,
            "pagination": {
                "currentPage": page,
                "pageSize": page_size,
                "totalPages": total_pages,
                "totalCount": total_count,
            },
            "errors": errors
        }
    return {
        "transactions": paginated_transactions,
        "pagination": {
            "currentPage": page,
            "pageSize": page_size,
            "totalPages": total_pages,
            "totalCount": total_count,
        }
    }

@app.get("/api/accounts")
async def get_accounts(file_path: str = Query(..., description="Path to Beancount file")):
    """Get all accounts"""
    try:
        if not file_path or not file_path.strip():
            raise HTTPException(status_code=400, detail="File path is required")
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail=f"File not found: {file_path}")
        
        _, accounts, _, _, errors = load_beancount_file(file_path)
        if errors:
            return {"accounts": accounts, "errors": errors}
        return {"accounts": accounts}
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"Failed to load accounts: {str(e)}\n{traceback.format_exc()}"
        raise HTTPException(status_code=500, detail=error_detail)

@app.get("/api/balances")
async def get_balances(file_path: str = Query(..., description="Path to Beancount file")):
    """Get all balances"""
    _, _, balances, _, errors = load_beancount_file(file_path)
    if errors:
        return {"balances": balances, "errors": errors}
    return {"balances": balances}

@app.get("/api/accounts/{account_name}/balance")
async def get_account_balance(
    account_name: str,
    file_path: str = Query(..., description="Path to Beancount file"),
    date: Optional[str] = Query(None, description="Date to calculate balance (YYYY-MM-DD)")
):
    """Get current balance for a specific account"""
    try:
        from beancount.core import realization
        from beancount.core import prices
        from beancount.core import convert
        
        entries, errors, options_map = loader.load_file(file_path)
        if errors:
            return {"balance": None, "errors": errors}
        
        # Build realization tree
        real_root = realization.realize(entries)
        
        # Get account node
        account_parts = account_name.split(":")
        account_node = real_root
        for part in account_parts:
            if part in account_node:
                account_node = account_node[part]
            else:
                return {"balance": None, "error": "Account not found"}
        
        # Calculate balance
        balance = realization.compute_balance(account_node)
        
        # Convert to single currency if multiple
        if len(balance) == 1:
            pos = list(balance)[0]
            return {
                "account": account_name,
                "balance": {
                    "number": str(pos.units.number),
                    "currency": str(pos.units.currency)
                },
                "date": date or datetime.now().isoformat()
            }
        else:
            # Multiple currencies - return all
            return {
                "account": account_name,
                "balances": [
                    {
                        "number": str(pos.units.number),
                        "currency": str(pos.units.currency)
                    }
                    for pos in balance
                ],
                "date": date or datetime.now().isoformat()
            }
    except Exception as e:
        import traceback
        error_detail = f"Failed to get account balance: {str(e)}\n{traceback.format_exc()}"
        raise HTTPException(status_code=500, detail=error_detail)

@app.get("/api/prices")
async def get_prices(file_path: str = Query(..., description="Path to Beancount file")):
    """Get all prices"""
    _, _, _, prices, errors = load_beancount_file(file_path)
    if errors:
        return {"prices": prices, "errors": errors}
    return {"prices": prices}

@app.get("/api/dashboard")
async def get_dashboard(file_path: str = Query(..., description="Path to Beancount file")):
    """Get dashboard data"""
    transactions, accounts, balances, prices, errors = load_beancount_file(file_path)
    
    total_assets = sum(
        float(b["amount"]["number"])
        for b in balances
        if any(a["name"] == b["account"] and a["type"] == "Assets" for a in accounts)
    )
    
    total_liabilities = sum(
        float(b["amount"]["number"])
        for b in balances
        if any(a["name"] == b["account"] and a["type"] == "Liabilities" for a in accounts)
    )
    
    net_worth = total_assets - total_liabilities
    
    return {
        "netWorth": net_worth,
        "totalAssets": total_assets,
        "totalLiabilities": total_liabilities,
        "transactions": transactions[:5],
        "accounts": accounts,
        "errors": errors
    }

@app.post("/api/transactions")
async def create_transaction(transaction: TransactionModel, file_path: str = Query(..., description="Path to Beancount file")):
    """Create a new transaction"""
    try:
        # Generate beancount transaction string
        postings_str = "\n".join([
            f"  {p.account}  {p.amount['number']} {p.amount['currency']}" if p.amount and p.amount.get('number')
            else f"  {p.account}"
            for p in transaction.postings
        ])
        
        payee_str = f' "{transaction.payee}"' if transaction.payee else ""
        narration_str = f' "{transaction.narration}"' if transaction.narration else ""
        
        new_transaction = f"{transaction.date} {transaction.flag}{payee_str}{narration_str}\n{postings_str}\n\n"
        
        # Append to file
        if not os.path.exists(file_path):
            with open(file_path, "w") as f:
                f.write("")
        
        with open(file_path, "a") as f:
            f.write(new_transaction)
        
        # Reload and return
        transactions, _, _, _, errors = load_beancount_file(file_path)
        new_txn = transactions[-1] if transactions else None
        
        return {"transaction": new_txn, "errors": errors}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/transactions/{transaction_id}")
async def update_transaction(transaction_id: str, transaction: TransactionModel, file_path: str = Query(..., description="Path to Beancount file")):
    """Update a transaction"""
    try:
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        # Read and parse file
        entries, errors, options_map = loader.load_file(file_path)
        
        # Find and filter out the transaction to delete
        filtered_entries = []
        for entry in entries:
            if isinstance(entry, Transaction):
                entry_id = entry.meta.get("id")
                if not entry_id:
                    entry_id = f"{entry.date.isoformat()}-{hash((entry.payee or '') + entry.narration + str(entry.postings))}"
                if str(entry_id) != transaction_id:
                    filtered_entries.append(entry)
            else:
                filtered_entries.append(entry)
        
        # Generate beancount transaction string for new transaction
        postings_str = "\n".join([
            f"  {p.account}  {p.amount['number']} {p.amount['currency']}" if p.amount and p.amount.get('number')
            else f"  {p.account}"
            for p in transaction.postings
        ])
        
        payee_str = f' "{transaction.payee}"' if transaction.payee else ""
        narration_str = f' "{transaction.narration}"' if transaction.narration else ""
        
        new_transaction = f"{transaction.date} {transaction.flag}{payee_str}{narration_str}\n{postings_str}\n\n"
        
        # Write back to file with updated transaction
        with open(file_path, "w") as f:
            for entry in filtered_entries:
                f.write(printer.print_entry(entry) + "\n")
            f.write(new_transaction)
        
        # Reload and return
        transactions, _, _, _, reload_errors = load_beancount_file(file_path)
        new_txn = transactions[-1] if transactions else None
        
        return {"transaction": new_txn, "errors": errors + reload_errors if reload_errors else errors}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/transactions/{transaction_id}")
async def delete_transaction(transaction_id: str, file_path: str = Query(..., description="Path to Beancount file")):
    """Delete a transaction"""
    try:
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        # Read and parse file
        entries, errors, options_map = loader.load_file(file_path)
        
        # Find and filter out the transaction
        filtered_entries = []
        for entry in entries:
            if isinstance(entry, Transaction):
                entry_id = entry.meta.get("id")
                if not entry_id:
                    entry_id = f"{entry.date.isoformat()}-{hash((entry.payee or '') + entry.narration + str(entry.postings))}"
                if str(entry_id) != transaction_id:
                    filtered_entries.append(entry)
            else:
                filtered_entries.append(entry)
        
        # Write back to file
        with open(file_path, "w") as f:
            for entry in filtered_entries:
                f.write(printer.print_entry(entry) + "\n")
        
        return {"success": True, "errors": errors}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/accounts")
async def create_account(account: AccountModel, file_path: str = Query(..., description="Path to Beancount file")):
    """Create a new account"""
    try:
        if not file_path or not file_path.strip():
            raise HTTPException(status_code=400, detail="File path is required")
        
        # Get currency from metadata or default to INR
        currency = account.metadata.get("currency", "INR") if account.metadata else "INR"
        
        # Validate account name format (should be like Assets:Bank:Checking)
        if not account.name or ":" not in account.name:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid account name: '{account.name}'. Account names must use colon separators (e.g., Assets:Bank:Checking)"
            )
        
        # Check if account already exists
        if os.path.exists(file_path):
            entries, _, _ = loader.load_file(file_path)
            for entry in entries:
                if isinstance(entry, Open) and entry.account == account.name:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Account '{account.name}' already exists"
                    )
        
        # Create directory if it doesn't exist
        directory = os.path.dirname(file_path)
        if directory and not os.path.exists(directory):
            os.makedirs(directory, exist_ok=True)
        
        # Write account with proper Beancount syntax: date open Account:Name Currency
        account_entry = f"{account.openDate} open {account.name} {currency}\n"
        
        if os.path.exists(file_path):
            with open(file_path, "a") as f:
                f.write(account_entry)
        else:
            # Create new file with header
            with open(file_path, "w") as f:
                f.write('option "operating_currency" "INR"\n\n')
                f.write(account_entry)
        
        # Validate the file after adding account
        _, accounts, _, _, errors = load_beancount_file(file_path)
        
        if errors:
            # Format errors for better display
            formatted_errors = []
            for error in errors:
                if isinstance(error, (list, tuple)) and len(error) >= 2:
                    error_info = error[1] if len(error) > 1 else str(error)
                    formatted_errors.append(error_info)
                else:
                    formatted_errors.append(str(error))
            
            return {
                "accounts": accounts,
                "errors": formatted_errors,
                "message": f"Account created but there were {len(formatted_errors)} error(s)"
            }
        
        return {"accounts": accounts, "errors": []}
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"Failed to create account: {str(e)}\n{traceback.format_exc()}"
        raise HTTPException(status_code=500, detail=error_detail)

@app.post("/api/import")
async def import_file(file: UploadFile = File(...), file_path: str = Query(..., description="Path to Beancount file")):
    """Import beancount file"""
    try:
        content = await file.read()
        content_str = content.decode("utf-8")
        
        # Save to file
        with open(file_path, "w") as f:
            f.write(content_str)
        
        # Validate
        entries, errors, options_map = loader.load_file(file_path)
        
        return {
            "success": True,
            "errors": errors,
            "message": f"Imported {len(entries)} entries"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/export")
async def export_file(file_path: str = Query(..., description="Path to Beancount file")):
    """Export beancount file"""
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="No file to export")
    
    return FileResponse(
        file_path,
        media_type="text/plain",
        filename=os.path.basename(file_path)
    )

@app.post("/api/accounts/import-excel")
async def import_accounts_excel(
    file: UploadFile = File(...),
    file_path: str = Query(..., description="Path to Beancount file")
):
    """Import accounts from Excel file
    
    Expected Excel format:
    - Column A: Account Name (e.g., Assets:Bank:Checking)
    - Column B: Type (Assets, Liabilities, Equity, Income, Expenses)
    - Column C: Open Date (YYYY-MM-DD)
    - Column D: Currency (optional, defaults to INR)
    - Column E: Notes/Description (optional)
    """
    try:
        if not file.filename.endswith(('.xlsx', '.xls')):
            raise HTTPException(status_code=400, detail="Please upload an Excel file (.xlsx or .xls)")
        
        content = await file.read()
        df = pd.read_excel(io.BytesIO(content))
        
        # Validate required columns
        required_columns = ['Account Name', 'Type', 'Open Date']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required columns: {', '.join(missing_columns)}. Please ensure your Excel file has columns: Account Name, Type, Open Date, Currency (optional), Notes (optional)"
            )
        
        # Read or create beancount file
        if not os.path.exists(file_path):
            with open(file_path, "w") as f:
                f.write('option "operating_currency" "INR"\n\n')
        
        # Read existing content
        with open(file_path, "r") as f:
            existing_content = f.read()
        
        # Generate account entries
        account_entries = []
        errors = []
        valid_types = ["Assets", "Liabilities", "Equity", "Income", "Expenses"]
        
        for index, row in df.iterrows():
            try:
                account_name = str(row['Account Name']).strip()
                account_type = str(row['Type']).strip()
                open_date = str(row['Open Date']).strip()
                currency = str(row.get('Currency', 'INR')).strip() if 'Currency' in df.columns else 'INR'
                
                # Validate account name
                if not account_name:
                    errors.append(f"Row {index + 2}: Account Name is required")
                    continue
                
                # Validate type
                if account_type not in valid_types:
                    errors.append(f"Row {index + 2}: Invalid Type '{account_type}'. Must be one of: {', '.join(valid_types)}")
                    continue
                
                # Validate date
                try:
                    if isinstance(open_date, str):
                        # Try parsing different date formats
                        if '/' in open_date:
                            parts = open_date.split('/')
                            if len(parts) == 3:
                                open_date = f"{parts[2]}-{parts[1]}-{parts[0]}"
                        elif '-' in open_date:
                            # Already in YYYY-MM-DD format or similar
                            pass
                        else:
                            # Try pandas date parsing
                            open_date = pd.to_datetime(open_date).strftime('%Y-%m-%d')
                    else:
                        open_date = pd.to_datetime(open_date).strftime('%Y-%m-%d')
                except Exception as e:
                    errors.append(f"Row {index + 2}: Invalid date format '{row['Open Date']}'. Use YYYY-MM-DD format")
                    continue
                
                # Check if account already exists
                if f'open {account_name}' in existing_content:
                    errors.append(f"Row {index + 2}: Account '{account_name}' already exists")
                    continue
                
                # Generate beancount account entry
                account_entry = f"{open_date} open {account_name} {currency}\n"
                account_entries.append(account_entry)
                
            except Exception as e:
                errors.append(f"Row {index + 2}: Error processing row - {str(e)}")
                continue
        
        # Append new accounts to file
        if account_entries:
            with open(file_path, "a") as f:
                f.write("\n; Accounts imported from Excel\n")
                for entry in account_entries:
                    f.write(entry)
                f.write("\n")
        
        # Validate the updated file
        entries, file_errors, options_map = loader.load_file(file_path)
        
        return {
            "success": True,
            "imported": len(account_entries),
            "errors": errors + file_errors if file_errors else errors,
            "message": f"Successfully imported {len(account_entries)} account(s)"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        raise HTTPException(
            status_code=500,
            detail=f"Failed to import accounts: {str(e)}\n{traceback.format_exc()}"
        )

@app.get("/api/reports/balance-sheet")
async def get_balance_sheet(file_path: str = Query(..., description="Path to Beancount file")):
    """Get balance sheet report"""
    transactions, accounts, balances, prices, errors = load_beancount_file(file_path)
    
    assets = []
    liabilities = []
    equity = []
    
    for account in accounts:
        account_balances = [b for b in balances if b["account"] == account["name"]]
        balance = sum(float(b["amount"]["number"]) for b in account_balances)
        
        account_data = {
            "account": account["name"],
            "balance": balance
        }
        
        if account["type"] == "Assets":
            assets.append(account_data)
        elif account["type"] == "Liabilities":
            liabilities.append(account_data)
        elif account["type"] == "Equity":
            equity.append(account_data)
    
    return {
        "assets": assets,
        "liabilities": liabilities,
        "equity": equity,
        "errors": errors
    }

@app.get("/api/reports/income-statement")
async def get_income_statement(start_date: str, end_date: str, file_path: str = Query(..., description="Path to Beancount file")):
    """Get income statement"""
    transactions, accounts, balances, prices, errors = load_beancount_file(file_path)
    
    start = datetime.fromisoformat(start_date).date()
    end = datetime.fromisoformat(end_date).date()
    
    income = []
    expenses = []
    
    for account in accounts:
        if account["type"] in ["Income", "Expenses"]:
            account_transactions = [
                t for t in transactions
                if start <= datetime.fromisoformat(t["date"]).date() <= end
                and any(p["account"] == account["name"] for p in t["postings"])
            ]
            
            total = sum(
                float(p["amount"]["number"])
                for t in account_transactions
                for p in t["postings"]
                if p["account"] == account["name"] and p["amount"]
            )
            
            account_data = {
                "account": account["name"],
                "total": total
            }
            
            if account["type"] == "Income":
                income.append(account_data)
            else:
                expenses.append(account_data)
    
    return {
        "income": income,
        "expenses": expenses,
        "errors": errors
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

