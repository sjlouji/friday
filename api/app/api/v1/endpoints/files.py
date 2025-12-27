from fastapi import APIRouter, HTTPException, Query
from app.models.schemas import FileBrowse, CommonPaths, FileCreateResult
from app.services.file_service import FileService

router = APIRouter()


@router.get("/browse", response_model=FileBrowse)
async def browse_files(
    path: str = Query(None, description="Directory path to browse"),
):
    """Browse files and directories"""
    try:
        result = FileService.browse_files(path)
        return result
    except (FileNotFoundError, PermissionError, ValueError) as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/common-paths", response_model=CommonPaths)
async def get_common_paths():
    """Get common file system paths"""
    try:
        result = FileService.get_common_paths()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/create", response_model=FileCreateResult)
async def create_beancount_file(
    file_path: str = Query(..., description="Path where to create the Beancount file"),
):
    """Create a new Beancount file"""
    try:
        result = FileService.create_file(file_path)
        return result
    except FileExistsError:
        raise HTTPException(status_code=400, detail=f"File already exists at {file_path}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

