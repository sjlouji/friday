from typing import Dict, List
from datetime import datetime
from app.utils.beancount_utils import load_beancount_file


class ReportService:
    """Service for generating reports"""
    
    @staticmethod
    def get_dashboard(file_path: str) -> Dict:
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
            "errors": errors if errors else None
        }
    
    @staticmethod
    def get_balance_sheet(file_path: str) -> Dict:
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
            "errors": errors if errors else None
        }
    
    @staticmethod
    def get_income_statement(file_path: str, start_date: str, end_date: str) -> Dict:
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
            "errors": errors if errors else None
        }

