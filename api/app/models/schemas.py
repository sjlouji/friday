from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import date


class Posting(BaseModel):
    account: str
    amount: Optional[Dict[str, Any]] = None
    cost: Optional[Dict[str, Any]] = None
    price: Optional[Dict[str, Any]] = None


class TransactionBase(BaseModel):
    date: str
    flag: str
    payee: Optional[str] = None
    narration: str
    postings: List[Posting]
    metadata: Optional[Dict[str, str]] = None


class Transaction(TransactionBase):
    id: str

    class Config:
        from_attributes = True


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(TransactionBase):
    pass


class AccountBase(BaseModel):
    name: str
    type: str
    openDate: str
    closeDate: Optional[str] = None
    metadata: Optional[Dict[str, str]] = None


class Account(AccountBase):
    class Config:
        from_attributes = True


class AccountCreate(AccountBase):
    pass


class Balance(BaseModel):
    account: str
    date: str
    amount: Dict[str, str]


class PriceEntry(BaseModel):
    date: str
    currency: str
    amount: Dict[str, str]


class Dashboard(BaseModel):
    netWorth: float
    totalAssets: float
    totalLiabilities: float
    transactions: List[Transaction]
    accounts: List[Account]
    errors: Optional[List[str]] = None


class BalanceSheetAccount(BaseModel):
    account: str
    balance: float


class BalanceSheet(BaseModel):
    assets: List[BalanceSheetAccount]
    liabilities: List[BalanceSheetAccount]
    equity: List[BalanceSheetAccount]
    errors: Optional[List[str]] = None


class IncomeStatementAccount(BaseModel):
    account: str
    total: float


class IncomeStatement(BaseModel):
    income: List[IncomeStatementAccount]
    expenses: List[IncomeStatementAccount]
    errors: Optional[List[str]] = None


class FileBrowseItem(BaseModel):
    name: str
    path: str
    is_directory: bool
    is_file: bool


class FileBrowse(BaseModel):
    path: str
    parent: Optional[str] = None
    items: List[FileBrowseItem]


class CommonPath(BaseModel):
    name: str
    path: str


class CommonPaths(BaseModel):
    paths: List[CommonPath]


class ImportResult(BaseModel):
    success: bool
    message: str
    imported: Optional[int] = None
    errors: Optional[List[str]] = None


class ExportResult(BaseModel):
    success: bool
    message: Optional[str] = None


class FileCreateResult(BaseModel):
    success: bool
    file_path: str
    message: str
    errors: Optional[List[str]] = None


class TransactionPreview(BaseModel):
    success: bool
    columns: List[str]
    preview: List[Dict[str, Any]]
    totalRows: int
    fileName: str


class Pagination(BaseModel):
    currentPage: int
    pageSize: int
    totalPages: int
    totalCount: int


class TransactionList(BaseModel):
    transactions: List[Transaction]
    pagination: Pagination
    errors: Optional[List[str]] = None

