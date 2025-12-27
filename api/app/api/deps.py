from fastapi import Query, HTTPException
from typing import Optional


def get_file_path(file_path: str = Query(..., description="Path to Beancount file")) -> str:
    """Dependency to get and validate file path"""
    if not file_path or not file_path.strip():
        raise HTTPException(status_code=400, detail="File path is required")
    
    import os
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"File not found: {file_path}")
    
    return file_path

