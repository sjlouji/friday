import logging
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger(__name__)


async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Global exception handler for unhandled exceptions"""
    request_id = getattr(request.state, "request_id", "unknown")
    logger.exception(f"Unhandled exception: {type(exc).__name__}", exc_info=exc)

    return JSONResponse(
        status_code=500,
        content={
            "message": "Internal Server Error",
            "request_id": request_id,
        },
    )


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """Handler for HTTP exceptions"""
    request_id = getattr(request.state, "request_id", "unknown")
    logger.warning(f"HTTP {exc.status_code}: {exc.detail}")

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "message": exc.detail,
            "request_id": request_id,
        },
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Handler for request validation errors"""
    request_id = getattr(request.state, "request_id", "unknown")
    logger.warning(f"Validation error: {exc.errors()}")

    return JSONResponse(
        status_code=422,
        content={
            "message": "Validation Error",
            "errors": exc.errors(),
            "request_id": request_id,
        },
    )
