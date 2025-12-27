import os
from typing import List, Tuple, Dict, Any
from beancount import loader
from beancount.core.data import Transaction, Open, Close, Balance, Price


def get_account_type(account_name: str) -> str:
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


def beancount_to_dict(entry, index=None):
    """Convert beancount entry to dictionary"""
    if isinstance(entry, Transaction):
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
                        "date": None,
                    } if posting.price else None,
                }
                for posting in entry.postings
            ],
            "metadata": {k: v for k, v in entry.meta.items() if k not in ["filename", "lineno"]}
        }
    elif isinstance(entry, Open):
        return {
            "name": entry.account,
            "type": get_account_type(entry.account),
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


def load_beancount_file(filepath: str) -> Tuple[List[Dict], List[Dict], List[Dict], List[Dict], List[str]]:
    """Load and parse beancount file
    
    Returns:
        Tuple of (transactions, accounts, balances, prices, errors)
    """
    try:
        # Expand ~ to home directory
        expanded_path = os.path.expanduser(filepath)
        
        if not os.path.exists(expanded_path):
            return [], [], [], [], [f"File not found: {expanded_path}"]
        
        if not os.path.isfile(expanded_path):
            return [], [], [], [], [f"Path is not a file: {expanded_path}"]
        
        file_size = os.path.getsize(expanded_path)
        if file_size > 10 * 1024 * 1024:
            print(f"Warning: Large file detected ({file_size / 1024 / 1024:.2f}MB): {expanded_path}")
        
        entries, errors, options_map = loader.load_file(expanded_path)
        
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
        
        for account in accounts:
            if account["name"] in account_close_dates:
                account["closeDate"] = account_close_dates[account["name"]]
        
        return transactions, accounts, balances, prices, errors
    except Exception as e:
        import traceback
        error_msg = f"Failed to load beancount file: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        return [], [], [], [], [error_msg]


def apply_filters(transactions: List[Dict], filters: Dict[str, Any]) -> List[Dict]:
    """Apply filters to transactions"""
    filtered = transactions
    
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
    
    tokens = filters.get("tokens", [])
    operation = filters.get("operation", "and")
    
    if tokens:
        def matches_token(transaction: Dict, token: Dict) -> bool:
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
        else:
            filtered = [t for t in filtered if all(matches_token(t, token) for token in tokens)]
    
    return filtered

