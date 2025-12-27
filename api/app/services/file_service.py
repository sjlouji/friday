import os
import pathlib
from typing import List, Dict
from datetime import date
from beancount import loader


class FileService:
    """Service for managing beancount files"""
    
    @staticmethod
    def browse_files(path: str = None) -> Dict:
        """Browse files and directories"""
        if path is None or not path or path.strip() == "":
            home_path = pathlib.Path.home()
            if not home_path.exists():
                raise FileNotFoundError("Home directory does not exist")
            requested_path = home_path
        else:
            home_path = pathlib.Path.home()
            requested_path = pathlib.Path(path)
            
            try:
                requested_path = requested_path.resolve()
            except (OSError, ValueError) as e:
                raise ValueError(f"Invalid path: {str(e)}")
            
            safe_paths = [
                home_path,
                pathlib.Path("/tmp"),
                pathlib.Path("/var/tmp"),
            ]
            
            is_safe = any(
                str(requested_path).startswith(str(safe_path)) for safe_path in safe_paths
            ) or str(requested_path).startswith(str(home_path))
            
            if not is_safe:
                raise PermissionError("Access denied to this path")
        
        if not requested_path.exists():
            raise FileNotFoundError(f"Path does not exist: {requested_path}")
        
        if not requested_path.is_dir():
            raise ValueError(f"Path is not a directory: {requested_path}")
        
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
                    
                    if item.is_dir() or (item.is_file() and (item.suffix == ".beancount" or item.suffix == ".bean")):
                        items.append(item_info)
                except (PermissionError, OSError):
                    continue
        except PermissionError as e:
            raise PermissionError(f"Permission denied: {str(e)}")
        
        items.sort(key=lambda x: (not x["is_directory"], x["name"].lower()))
        
        parent_path = None
        if requested_path.parent != requested_path:
            parent_path = str(requested_path.parent)
        
        return {
            "path": str(requested_path),
            "parent": parent_path,
            "items": items
        }
    
    @staticmethod
    def get_common_paths() -> Dict:
        """Get common file system paths"""
        home = pathlib.Path.home()
        
        common_paths = [
            {"name": "Home", "path": str(home)},
            {"name": "Documents", "path": str(home / "Documents")},
            {"name": "Desktop", "path": str(home / "Desktop")},
            {"name": "Downloads", "path": str(home / "Downloads")},
        ]
        
        existing_paths = [p for p in common_paths if pathlib.Path(p["path"]).exists()]
        
        return {"paths": existing_paths}
    
    @staticmethod
    def create_file(file_path: str) -> Dict:
        """Create a new beancount file"""
        if os.path.exists(file_path):
            raise FileExistsError(f"File already exists at {file_path}")
        
        directory = os.path.dirname(file_path)
        if directory and not os.path.exists(directory):
            os.makedirs(directory, exist_ok=True)
        
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
        
        with open(file_path, "w") as f:
            f.write(default_content)
        
        entries, errors, options_map = loader.load_file(file_path)
        
        return {
            "success": True,
            "file_path": file_path,
            "message": f"Beancount file created successfully at {file_path}",
            "errors": errors if errors else []
        }

