import logging
import sys
from contextvars import ContextVar
from typing import Any

from app.core.config import settings

# Context variable to store request_id for the current async context
request_id_context: ContextVar[str] = ContextVar("request_id", default="")


class RequestIDFilter(logging.Filter):
    """Filter to automatically add request_id to all log records"""

    def filter(self, record: logging.LogRecord) -> bool:
        request_id = request_id_context.get("")
        if request_id:
            record.request_id = request_id
        else:
            record.request_id = ""
        return True


class RequestIDFormatter(logging.Formatter):
    """Custom formatter to include request_id in log messages"""

    def format(self, record: logging.LogRecord) -> str:
        request_id = getattr(record, "request_id", "")
        if request_id:
            record.msg = f"[request_id={request_id}] {record.msg}"
        return super().format(record)


def setup_logging() -> None:
    """Configure logging for the application with automatic request ID support"""
    formatter = RequestIDFormatter(
        fmt="%(asctime)s %(levelname)s %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.addFilter(RequestIDFilter())
    handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    root_logger.addHandler(handler)

    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("fastapi").setLevel(logging.INFO)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)

