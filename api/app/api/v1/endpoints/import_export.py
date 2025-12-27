from fastapi import APIRouter, HTTPException, Query, UploadFile, File
from fastapi.responses import FileResponse
import os
from app.services.import_service import ImportService

router = APIRouter()


@router.post("/import/upload")
async def import_file(
    file: UploadFile = File(...),
    file_path: str = Query(..., description="Path to Beancount file"),
):
    """Import beancount file"""
    try:
        content = await file.read()
        result = ImportService.import_file(file_path, content)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/export/download")
async def export_file(
    file_path: str = Query(..., description="Path to Beancount file"),
):
    """Export beancount file"""
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="No file to export")
    
    return FileResponse(
        file_path,
        media_type="text/plain",
        filename=os.path.basename(file_path)
    )

