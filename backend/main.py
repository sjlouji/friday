from fastapi import FastAPI, HTTPException, UploadFile, File
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

app = FastAPI(title="Beancount API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
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
                        "date": posting.price.date.isoformat() if posting.price and posting.price.date else None,
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
    if not os.path.exists(filepath):
        return [], [], [], [], []
    
    entries, errors, options_map = loader.load_file(filepath)
    
    transactions = []
    accounts = []
    balances = []
    prices = []
    account_close_dates = {}
    
    for index, entry in enumerate(entries):
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
    
    # Update accounts with close dates
    for account in accounts:
        if account["name"] in account_close_dates:
            account["closeDate"] = account_close_dates[account["name"]]
    
    return transactions, accounts, balances, prices, errors

@app.get("/")
async def root():
    return {"message": "Beancount API", "version": "1.0.0"}

@app.get("/api/transactions")
async def get_transactions():
    """Get all transactions"""
    transactions, _, _, _, errors = load_beancount_file()
    if errors:
        return {"transactions": transactions, "errors": errors}
    return {"transactions": transactions}

@app.get("/api/accounts")
async def get_accounts():
    """Get all accounts"""
    _, accounts, _, _, errors = load_beancount_file()
    if errors:
        return {"accounts": accounts, "errors": errors}
    return {"accounts": accounts}

@app.get("/api/balances")
async def get_balances():
    """Get all balances"""
    _, _, balances, _, errors = load_beancount_file()
    if errors:
        return {"balances": balances, "errors": errors}
    return {"balances": balances}

@app.get("/api/prices")
async def get_prices():
    """Get all prices"""
    _, _, _, prices, errors = load_beancount_file()
    if errors:
        return {"prices": prices, "errors": errors}
    return {"prices": prices}

@app.get("/api/dashboard")
async def get_dashboard():
    """Get dashboard data"""
    transactions, accounts, balances, prices, errors = load_beancount_file()
    
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
async def create_transaction(transaction: TransactionModel):
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
        if not os.path.exists(BEANCOUNT_FILE):
            with open(BEANCOUNT_FILE, "w") as f:
                f.write("")
        
        with open(BEANCOUNT_FILE, "a") as f:
            f.write(new_transaction)
        
        # Reload and return
        transactions, _, _, _, errors = load_beancount_file()
        new_txn = transactions[-1] if transactions else None
        
        return {"transaction": new_txn, "errors": errors}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/transactions/{transaction_id}")
async def update_transaction(transaction_id: str, transaction: TransactionModel):
    """Update a transaction"""
    try:
        # This is simplified - in production, you'd want to properly update the file
        # For now, we'll delete and recreate
        await delete_transaction(transaction_id)
        return await create_transaction(transaction)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/transactions/{transaction_id}")
async def delete_transaction(transaction_id: str):
    """Delete a transaction"""
    try:
        if not os.path.exists(BEANCOUNT_FILE):
            raise HTTPException(status_code=404, detail="File not found")
        
        # Read and parse file
        entries, errors, options_map = loader.load_file(BEANCOUNT_FILE)
        
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
        with open(BEANCOUNT_FILE, "w") as f:
            for entry in filtered_entries:
                f.write(printer.print_entry(entry) + "\n")
        
        return {"success": True, "errors": errors}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/accounts")
async def create_account(account: AccountModel):
    """Create a new account"""
    try:
        if os.path.exists(BEANCOUNT_FILE):
            with open(BEANCOUNT_FILE, "a") as f:
                f.write(f"{account.openDate} open {account.name}\n")
        else:
            with open(BEANCOUNT_FILE, "w") as f:
                f.write(f"{account.openDate} open {account.name}\n")
        
        _, accounts, _, _, errors = load_beancount_file()
        return {"accounts": accounts, "errors": errors}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/import")
async def import_file(file: UploadFile = File(...)):
    """Import beancount file"""
    try:
        content = await file.read()
        content_str = content.decode("utf-8")
        
        # Save to file
        with open(BEANCOUNT_FILE, "w") as f:
            f.write(content_str)
        
        # Validate
        entries, errors, options_map = loader.load_file(BEANCOUNT_FILE)
        
        return {
            "success": True,
            "errors": errors,
            "message": f"Imported {len(entries)} entries"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/export")
async def export_file():
    """Export beancount file"""
    if not os.path.exists(BEANCOUNT_FILE):
        raise HTTPException(status_code=404, detail="No file to export")
    
    return FileResponse(
        BEANCOUNT_FILE,
        media_type="text/plain",
        filename="ledger.beancount"
    )

@app.get("/api/reports/balance-sheet")
async def get_balance_sheet():
    """Get balance sheet report"""
    transactions, accounts, balances, prices, errors = load_beancount_file()
    
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
async def get_income_statement(start_date: str, end_date: str):
    """Get income statement"""
    transactions, accounts, balances, prices, errors = load_beancount_file()
    
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

