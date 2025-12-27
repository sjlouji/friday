import os
import io
import json
import pandas as pd
from typing import Dict
from beancount import loader
from beancount.core.data import Transaction


class ImportService:
    """Service for importing data"""
    
    @staticmethod
    def import_file(file_path: str, content: bytes) -> Dict:
        """Import beancount file"""
        # Expand ~ to home directory
        file_path = os.path.expanduser(file_path)
        
        content_str = content.decode("utf-8")
        
        directory = os.path.dirname(file_path)
        if directory and not os.path.exists(directory):
            os.makedirs(directory, exist_ok=True)
        
        with open(file_path, "w") as f:
            f.write(content_str)
        
        entries, errors, options_map = loader.load_file(file_path)
        
        return {
            "success": True,
            "errors": errors,
            "message": f"Imported {len(entries)} entries"
        }
    
    @staticmethod
    def preview_file(file: bytes, filename: str) -> Dict:
        """Preview and extract data from CSV/Excel file"""
        if len(file) == 0:
            raise ValueError("File is empty")
        
        try:
            if filename.endswith(('.csv', '.CSV')):
                try:
                    df = pd.read_csv(io.BytesIO(file), encoding='utf-8')
                except UnicodeDecodeError:
                    try:
                        df = pd.read_csv(io.BytesIO(file), encoding='latin-1')
                    except:
                        df = pd.read_csv(io.BytesIO(file), encoding='iso-8859-1')
            elif filename.endswith(('.xlsx', '.xls', '.XLSX', '.XLS')):
                df = pd.read_excel(io.BytesIO(file))
            else:
                raise ValueError("Unsupported file type. Please upload CSV or Excel file")
        except Exception as parse_error:
            raise ValueError(f"Failed to parse file: {str(parse_error)}")
        
        if df.empty:
            raise ValueError("File contains no data")
        
        df = df.fillna('')
        data = df.to_dict('records')
        columns = [str(col) for col in df.columns]
        preview_rows = data[:10] if len(data) > 10 else data
        
        serializable_preview = []
        for row in preview_rows:
            serializable_row = {}
            for key, value in row.items():
                if pd.isna(value):
                    serializable_row[str(key)] = ""
                elif isinstance(value, (int, float)):
                    serializable_row[str(key)] = value
                else:
                    serializable_row[str(key)] = str(value)
            serializable_preview.append(serializable_row)
        
        return {
            "success": True,
            "columns": columns,
            "preview": serializable_preview,
            "totalRows": len(data),
            "fileName": filename
        }
    
    @staticmethod
    def import_mapped_transactions(
        file_path: str,
        file: bytes,
        filename: str,
        mapping: Dict
    ) -> Dict:
        """Import transactions using column mapping"""
        # Expand ~ to home directory
        file_path = os.path.expanduser(file_path)
        
        if filename.endswith(('.csv', '.CSV')):
            df = pd.read_csv(io.BytesIO(file))
        elif filename.endswith(('.xlsx', '.xls', '.XLSX', '.XLS')):
            df = pd.read_excel(io.BytesIO(file))
        else:
            raise ValueError("Unsupported file type")
        
        directory = os.path.dirname(file_path)
        if directory and not os.path.exists(directory):
            os.makedirs(directory, exist_ok=True)
        
        if not os.path.exists(file_path):
            with open(file_path, "w") as f:
                f.write('option "operating_currency" "INR"\n\n')
        
        entries, _, _ = loader.load_file(file_path) if os.path.exists(file_path) else ([], [], {})
        existing_transactions = set()
        for entry in entries:
            if isinstance(entry, Transaction):
                existing_transactions.add(
                    (entry.date.isoformat(), entry.narration, str(entry.postings))
                )
        
        transaction_entries = []
        errors = []
        imported_count = 0
        
        default_currency = mapping.get('defaultCurrency', 'INR')
        default_flag = mapping.get('defaultFlag', '*')
        
        for index, row in df.iterrows():
            try:
                date_str = str(row[mapping['date']]).strip() if mapping.get('date') else None
                narration = str(row[mapping['narration']]).strip() if mapping.get('narration') else ''
                account = str(row[mapping['account']]).strip() if mapping.get('account') else None
                amount_str = str(row[mapping['amount']]).strip() if mapping.get('amount') else None
                
                payee = str(row[mapping['payee']]).strip() if mapping.get('payee') and mapping['payee'] in df.columns else ''
                currency = str(row[mapping['currency']]).strip() if mapping.get('currency') and mapping['currency'] in df.columns else default_currency
                category = str(row[mapping['category']]).strip() if mapping.get('category') and mapping['category'] in df.columns else ''
                flag = str(row[mapping['flag']]).strip() if mapping.get('flag') and mapping['flag'] in df.columns else default_flag
                
                if not date_str or not narration or not account or not amount_str:
                    errors.append(f"Row {index + 2}: Missing required fields")
                    continue
                
                try:
                    if '/' in date_str:
                        parts = date_str.split('/')
                        if len(parts) == 3:
                            date_str = f"{parts[2]}-{parts[1]}-{parts[0]}"
                    elif '-' not in date_str:
                        date_str = pd.to_datetime(date_str).strftime('%Y-%m-%d')
                except Exception as e:
                    errors.append(f"Row {index + 2}: Invalid date format")
                    continue
                
                try:
                    amount_value = float(str(amount_str).replace(',', '').replace('₹', '').replace('$', '').replace('€', '').strip())
                except ValueError:
                    errors.append(f"Row {index + 2}: Invalid amount")
                    continue
                
                if flag not in ['*', '!', '?']:
                    flag = default_flag
                
                account_parts = account.split(":")
                capitalized_account_parts = []
                for part in account_parts:
                    part = part.strip()
                    if not part:
                        errors.append(f"Row {index + 2}: Account name parts cannot be empty")
                        break
                    capitalized_account_parts.append(part[0].upper() + part[1:].lower() if len(part) > 1 else part.upper())
                else:
                    account = ":".join(capitalized_account_parts)
                
                if amount_value >= 0:
                    if category:
                        category_parts = category.split(":")
                        capitalized_category_parts = []
                        for part in category_parts:
                            part = part.strip()
                            if part:
                                capitalized_category_parts.append(part[0].upper() + part[1:].lower() if len(part) > 1 else part.upper())
                        if capitalized_category_parts:
                            category = ":".join(capitalized_category_parts)
                            postings = [
                                {"account": account, "amount": {"number": str(abs(amount_value)), "currency": currency}},
                                {"account": category, "amount": {"number": f"-{abs(amount_value)}", "currency": currency}}
                            ]
                        else:
                            postings = [
                                {"account": account, "amount": {"number": str(abs(amount_value)), "currency": currency}},
                                {"account": "Income:Uncategorized", "amount": {"number": f"-{abs(amount_value)}", "currency": currency}}
                            ]
                    else:
                        postings = [
                            {"account": account, "amount": {"number": str(abs(amount_value)), "currency": currency}},
                            {"account": "Income:Uncategorized", "amount": {"number": f"-{abs(amount_value)}", "currency": currency}}
                        ]
                else:
                    if category:
                        category_parts = category.split(":")
                        capitalized_category_parts = []
                        for part in category_parts:
                            part = part.strip()
                            if part:
                                capitalized_category_parts.append(part[0].upper() + part[1:].lower() if len(part) > 1 else part.upper())
                        if capitalized_category_parts:
                            category = ":".join(capitalized_category_parts)
                            postings = [
                                {"account": category, "amount": {"number": str(abs(amount_value)), "currency": currency}},
                                {"account": account, "amount": {"number": f"-{abs(amount_value)}", "currency": currency}}
                            ]
                        else:
                            postings = [
                                {"account": "Expenses:Uncategorized", "amount": {"number": str(abs(amount_value)), "currency": currency}},
                                {"account": account, "amount": {"number": f"-{abs(amount_value)}", "currency": currency}}
                            ]
                    else:
                        postings = [
                            {"account": "Expenses:Uncategorized", "amount": {"number": str(abs(amount_value)), "currency": currency}},
                            {"account": account, "amount": {"number": f"-{abs(amount_value)}", "currency": currency}}
                        ]
                
                postings_str = "\n".join([
                    f"  {p['account']}  {p['amount']['number']} {p['amount']['currency']}"
                    for p in postings
                ])
                
                payee_str = f' "{payee}"' if payee else ""
                narration_str = f' "{narration}"' if narration else ""
                
                transaction_entry = f"{date_str} {flag}{payee_str}{narration_str}\n{postings_str}\n\n"
                
                transaction_key = (date_str, narration, str(postings))
                if transaction_key in existing_transactions:
                    errors.append(f"Row {index + 2}: Duplicate transaction")
                    continue
                
                transaction_entries.append(transaction_entry)
                existing_transactions.add(transaction_key)
                imported_count += 1
                
            except Exception as e:
                errors.append(f"Row {index + 2}: Error processing row - {str(e)}")
                continue
        
        if transaction_entries:
            with open(file_path, "a") as f:
                f.write("\n; Transactions imported with mapping\n")
                for entry in transaction_entries:
                    f.write(entry)
                f.write("\n")
        
        entries, file_errors, options_map = loader.load_file(file_path)
        all_errors = errors + [f"Beancount file error: {e}" for e in file_errors]
        
        return {
            "success": True,
            "message": f"Successfully imported {imported_count} transaction(s). {len(all_errors)} error(s)/warning(s).",
            "imported": imported_count,
            "errors": all_errors
        }

