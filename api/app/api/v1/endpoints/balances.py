from fastapi import APIRouter, HTTPException, Query
from typing import List
from app.models.schemas import Balance
from app.utils.beancount_utils import load_beancount_file

router = APIRouter()


@router.get("", response_model=dict)
async def get_balances(
    file_path: str = Query(..., description="Path to Beancount file"),
):
    """Get all balances"""
    try:
        _, _, balances, _, errors = load_beancount_file(file_path)
        return {"balances": balances, "errors": errors if errors else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

