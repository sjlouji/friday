from fastapi import APIRouter, HTTPException, Query, UploadFile, File
from typing import Optional
from app.models.schemas import (
    Transaction,
    TransactionCreate,
    TransactionUpdate,
    TransactionList,
    TransactionPreview,
)
from app.services.transaction_service import TransactionService
from app.services.import_service import ImportService
from app.api.deps import get_file_path

router = APIRouter()


@router.get("", response_model=TransactionList)
async def get_transactions(
    file_path: str = Query(..., description="Path to Beancount file"),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    free_text: Optional[str] = None,
    filter_tokens: Optional[str] = None,
    filter_operation: str = Query("and"),
    sort_field: Optional[str] = None,
    sort_descending: bool = False,
):
    """Get transactions with pagination and filtering"""
    try:
        result = TransactionService.get_transactions(
            file_path, page, page_size, free_text, filter_tokens,
            filter_operation, sort_field, sort_descending
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=Transaction)
async def create_transaction(
    transaction: TransactionCreate,
    file_path: str = Query(..., description="Path to Beancount file"),
):
    """Create a new transaction"""
    try:
        result = TransactionService.create_transaction(file_path, transaction.dict())
        return result["transaction"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{transaction_id}", response_model=Transaction)
async def update_transaction(
    transaction_id: str,
    transaction: TransactionUpdate,
    file_path: str = Query(..., description="Path to Beancount file"),
):
    """Update a transaction"""
    try:
        result = TransactionService.update_transaction(file_path, transaction_id, transaction.dict())
        return result["transaction"]
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{transaction_id}")
async def delete_transaction(
    transaction_id: str,
    file_path: str = Query(..., description="Path to Beancount file"),
):
    """Delete a transaction"""
    try:
        result = TransactionService.delete_transaction(file_path, transaction_id)
        return result
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/preview", response_model=TransactionPreview)
async def preview_transactions_file(
    file: UploadFile = File(...),
    file_path: Optional[str] = Query(None),
):
    """Preview and extract data from CSV/Excel file"""
    try:
        content = await file.read()
        result = ImportService.preview_file(content, file.filename or "")
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/import-mapped")
async def import_transactions_mapped(
    file: UploadFile = File(...),
    file_path: str = Query(..., description="Path to Beancount file"),
    mapping: str = Query(..., description="JSON mapping of columns to fields"),
):
    """Import transactions using column mapping"""
    try:
        import json
        mapping_dict = json.loads(mapping)
        content = await file.read()
        result = ImportService.import_mapped_transactions(
            file_path, content, file.filename or "", mapping_dict
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

