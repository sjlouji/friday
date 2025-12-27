from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/health")
async def health_check():
    """
    Health check endpoint for Docker and load balancer monitoring.
    Returns 200 if service is healthy, 503 if unhealthy.
    """
    try:
        return {
            "status": "healthy",
            "service": settings.app_name,
            "version": settings.version,
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")


@router.get("/health/live")
async def liveness_check():
    """
    Kubernetes liveness probe endpoint.
    Returns 200 if the container is alive.
    """
    return {"status": "alive", "timestamp": datetime.now().isoformat()}


@router.get("/health/ready")
async def readiness_check():
    """
    Kubernetes readiness probe endpoint.
    Returns 200 if the service is ready to accept traffic.
    """
    try:
        return {"status": "ready", "timestamp": datetime.now().isoformat()}
    except Exception as e:
        logger.error(f"Readiness check failed: {str(e)}")
        raise HTTPException(status_code=503, detail=f"Service not ready: {str(e)}")

