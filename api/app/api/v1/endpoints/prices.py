from fastapi import APIRouter, HTTPException, Query
from app.utils.beancount_utils import load_beancount_file

router = APIRouter()


@router.get("", response_model=dict)
async def get_prices(
    file_path: str = Query(..., description="Path to Beancount file"),
):
    """Get all prices"""
    try:
        _, _, _, prices, errors = load_beancount_file(file_path)
        return {"prices": prices, "errors": errors if errors else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

