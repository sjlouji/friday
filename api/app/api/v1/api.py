from fastapi import APIRouter
from app.api.v1.endpoints import (
    transactions,
    accounts,
    files,
    reports,
    dashboard,
    import_export,
    balances,
    prices,
)

api_router = APIRouter()

api_router.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
api_router.include_router(accounts.router, prefix="/accounts", tags=["accounts"])
api_router.include_router(files.router, prefix="/files", tags=["files"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(import_export.router, tags=["import-export"])
api_router.include_router(balances.router, prefix="/balances", tags=["balances"])
api_router.include_router(prices.router, prefix="/prices", tags=["prices"])

