from fastapi import APIRouter, HTTPException, Query
from app.models.schemas import Dashboard
from app.services.report_service import ReportService

router = APIRouter()


@router.get("", response_model=Dashboard)
async def get_dashboard(
    file_path: str = Query(..., description="Path to Beancount file"),
):
    """Get dashboard data"""
    try:
        result = ReportService.get_dashboard(file_path)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

