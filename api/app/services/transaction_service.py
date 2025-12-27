import os
import json
from typing import List, Dict, Optional
from beancount import loader
from beancount.core.data import Transaction
from beancount.parser import printer
from app.utils.beancount_utils import apply_filters, load_beancount_file


class TransactionService:
    """Service for managing transactions"""
    
    @staticmethod
    def get_transactions(
        file_path: str,
        page: int = 1,
        page_size: int = 25,
        free_text: Optional[str] = None,
        filter_tokens: Optional[str] = None,
        filter_operation: str = "and",
        sort_field: Optional[str] = None,
        sort_descending: bool = False
    ) -> Dict:
        """Get transactions with pagination and filtering"""
        transactions, _, _, _, errors = load_beancount_file(file_path)
        
        filters = {}
        if free_text:
            filters["freeText"] = free_text
        if filter_tokens:
            try:
                filters["tokens"] = json.loads(filter_tokens)
            except:
                filters["tokens"] = []
        filters["operation"] = filter_operation or "and"
        
        if filters.get("freeText") or filters.get("tokens"):
            transactions = apply_filters(transactions, filters)
        
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
        
        total_count = len(transactions)
        total_pages = (total_count + page_size - 1) // page_size if total_count > 0 else 1
        start_index = (page - 1) * page_size
        end_index = start_index + page_size
        paginated_transactions = transactions[start_index:end_index]
        
        return {
            "transactions": paginated_transactions,
            "pagination": {
                "currentPage": page,
                "pageSize": page_size,
                "totalPages": total_pages,
                "totalCount": total_count,
            },
            "errors": errors if errors else None
        }
    
    @staticmethod
    def create_transaction(file_path: str, transaction_data: Dict) -> Dict:
        """Create a new transaction"""
        postings_str = "\n".join([
            f"  {p['account']}  {p['amount']['number']} {p['amount']['currency']}" 
            if p.get('amount') and p['amount'].get('number')
            else f"  {p['account']}"
            for p in transaction_data.get("postings", [])
        ])
        
        payee_str = f' "{transaction_data.get("payee")}"' if transaction_data.get("payee") else ""
        narration_str = f' "{transaction_data.get("narration")}"' if transaction_data.get("narration") else ""
        
        new_transaction = f"{transaction_data['date']} {transaction_data['flag']}{payee_str}{narration_str}\n{postings_str}\n\n"
        
        if not os.path.exists(file_path):
            with open(file_path, "w") as f:
                f.write("")
        
        with open(file_path, "a") as f:
            f.write(new_transaction)
        
        transactions, _, _, _, errors = load_beancount_file(file_path)
        new_txn = transactions[-1] if transactions else None
        
        return {"transaction": new_txn, "errors": errors}
    
    @staticmethod
    def update_transaction(file_path: str, transaction_id: str, transaction_data: Dict) -> Dict:
        """Update a transaction"""
        if not os.path.exists(file_path):
            raise FileNotFoundError("File not found")
        
        entries, errors, options_map = loader.load_file(file_path)
        
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
        
        postings_str = "\n".join([
            f"  {p['account']}  {p['amount']['number']} {p['amount']['currency']}" 
            if p.get('amount') and p['amount'].get('number')
            else f"  {p['account']}"
            for p in transaction_data.get("postings", [])
        ])
        
        payee_str = f' "{transaction_data.get("payee")}"' if transaction_data.get("payee") else ""
        narration_str = f' "{transaction_data.get("narration")}"' if transaction_data.get("narration") else ""
        
        new_transaction = f"{transaction_data['date']} {transaction_data['flag']}{payee_str}{narration_str}\n{postings_str}\n\n"
        
        with open(file_path, "w") as f:
            for entry in filtered_entries:
                f.write(printer.print_entry(entry) + "\n")
            f.write(new_transaction)
        
        transactions, _, _, _, reload_errors = load_beancount_file(file_path)
        new_txn = transactions[-1] if transactions else None
        
        return {"transaction": new_txn, "errors": errors + reload_errors if reload_errors else errors}
    
    @staticmethod
    def delete_transaction(file_path: str, transaction_id: str) -> Dict:
        """Delete a transaction"""
        if not os.path.exists(file_path):
            raise FileNotFoundError("File not found")
        
        entries, errors, options_map = loader.load_file(file_path)
        
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
        
        with open(file_path, "w") as f:
            for entry in filtered_entries:
                f.write(printer.print_entry(entry) + "\n")
        
        return {"success": True, "errors": errors}

