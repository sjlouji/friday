import os
from typing import List, Dict
from beancount import loader
from beancount.core.data import Open
from app.utils.beancount_utils import load_beancount_file
from app.core.exceptions import (
    AccountAlreadyExistsError,
    InvalidAccountNameError,
)


class AccountService:
    """Service for managing accounts"""
    
    @staticmethod
    def get_accounts(file_path: str) -> Dict:
        """Get all accounts"""
        _, accounts, _, _, errors = load_beancount_file(file_path)
        return {"accounts": accounts, "errors": errors if errors else None}
    
    @staticmethod
    def create_account(file_path: str, account_data: Dict) -> Dict:
        """Create a new account"""
        # Expand ~ to home directory
        file_path = os.path.expanduser(file_path)
        
        currency = account_data.get("metadata", {}).get("currency", "INR") if account_data.get("metadata") else "INR"
        
        account_name = account_data["name"]
        if ":" not in account_name:
            raise InvalidAccountNameError(
                account_name,
                "Account names must use colon separators (e.g., Assets:Bank:Checking)"
            )
        
        account_parts = account_name.split(":")
        capitalized_parts = []
        for part in account_parts:
            part = part.strip()
            if not part:
                raise InvalidAccountNameError(account_name, "Account name parts cannot be empty")
            capitalized_parts.append(part[0].upper() + part[1:].lower() if len(part) > 1 else part.upper())
        
        account_name = ":".join(capitalized_parts)
        
        if os.path.exists(file_path):
            entries, _, _ = loader.load_file(file_path)
            for entry in entries:
                if isinstance(entry, Open) and entry.account == account_name:
                    raise AccountAlreadyExistsError(account_name)
        
        directory = os.path.dirname(file_path)
        if directory and not os.path.exists(directory):
            os.makedirs(directory, exist_ok=True)
        
        account_entry = f"{account_data['openDate']} open {account_name} {currency}\n"
        
        if os.path.exists(file_path):
            with open(file_path, "a") as f:
                f.write(account_entry)
        else:
            with open(file_path, "w") as f:
                f.write('option "operating_currency" "INR"\n\n')
                f.write(account_entry)
        
        _, accounts, _, _, errors = load_beancount_file(file_path)
        
        if errors:
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

