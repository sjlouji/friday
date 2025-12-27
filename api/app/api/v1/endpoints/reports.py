from fastapi import APIRouter, HTTPException, Query
from app.models.schemas import BalanceSheet, IncomeStatement
from app.services.report_service import ReportService

router = APIRouter()


@router.get("/balance-sheet", response_model=BalanceSheet)
async def get_balance_sheet(
    file_path: str = Query(..., description="Path to Beancount file"),
):
    """Get balance sheet report"""
    try:
        result = ReportService.get_balance_sheet(file_path)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/income-statement", response_model=IncomeStatement)
async def get_income_statement(
    start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date (YYYY-MM-DD)"),
    file_path: str = Query(..., description="Path to Beancount file"),
):
    """Get income statement"""
    try:
        result = ReportService.get_income_statement(file_path, start_date, end_date)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

