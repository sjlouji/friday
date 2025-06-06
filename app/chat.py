from fastapi import APIRouter, Depends
from app.core.config import get_settings

router = APIRouter()

@router.post("/chat")
def chat_endpoint(settings=Depends(get_settings)):
    return {"msg": "Chat endpoint placeholder", "version": settings.FASTAPI_VERSION} 