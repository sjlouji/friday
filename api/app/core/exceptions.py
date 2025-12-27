import logging
from typing import Union
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger(__name__)


class AccountAlreadyExistsError(HTTPException):
    """Raised when trying to create an account that already exists"""

    def __init__(self, account_name: str):
        super().__init__(
            status_code=409,
            detail=f"Account '{account_name}' already exists",
        )
        self.account_name = account_name


class InvalidAccountNameError(HTTPException):
    """Raised when an account name is invalid"""

    def __init__(self, account_name: str, reason: str = "Invalid account name format"):
        super().__init__(
            status_code=400,
            detail=f"Invalid account name '{account_name}': {reason}",
        )
        self.account_name = account_name
        self.reason = reason


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


async def http_exception_handler(request: Request, exc: Union[HTTPException, StarletteHTTPException]) -> JSONResponse:
    """Handler for HTTP exceptions (including FastAPI HTTPException and custom exceptions)"""
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
