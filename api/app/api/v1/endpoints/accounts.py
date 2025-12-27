from fastapi import APIRouter, HTTPException, Query
from app.models.schemas import Account, AccountCreate
from app.services.account_service import AccountService
from app.core.exceptions import (
    AccountAlreadyExistsError,
    InvalidAccountNameError,
)

router = APIRouter()


@router.get("", response_model=dict)
async def get_accounts(
    file_path: str = Query(..., description="Path to Beancount file"),
):
    """Get all accounts"""
    try:
        result = AccountService.get_accounts(file_path)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=dict)
async def create_account(
    account: AccountCreate,
    file_path: str = Query(..., description="Path to Beancount file"),
):
    """Create a new account"""
    try:
        result = AccountService.create_account(file_path, account.dict())
        return result
    except (AccountAlreadyExistsError, InvalidAccountNameError):
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

