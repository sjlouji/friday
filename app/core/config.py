from functools import lru_cache
from typing import Any, Literal

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class FridaySettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file='.env',
        env_file_encoding='utf-8',
        extra='ignore',
        case_sensitive=True,
    )

    ENVIRONMENT: Literal['development', 'production'] = 'development'

    FASTAPI_API_V1_PATH: str = '/api/v1'
    FASTAPI_TITLE: str = 'Friday: AI Chat Finance API'
    FASTAPI_VERSION: str = '0.0.1'
    FASTAPI_DESCRIPTION: str = 'AI-powered personal finance management system'

    CORS_ALLOWED_ORIGINS: list[str] = [
        'http://127.0.0.1:8000',
        'http://localhost:5173',
    ]
    MIDDLEWARE_CORS: bool = True
    CORS_EXPOSE_HEADERS: list[str] = [
        'X-Request-ID',
    ]

    LOG_ACCESS_FILENAME: str = 'friday_access.log'
    LOG_ERROR_FILENAME: str = 'friday_error.log'
    LOG_CID_DEFAULT_VALUE: str = '-'
    LOG_CID_UUID_LENGTH: int = 32
    LOG_STD_LEVEL: str = 'INFO'
    LOG_ACCESS_FILE_LEVEL: str = 'INFO'
    LOG_ERROR_FILE_LEVEL: str = 'ERROR'
    LOG_STD_FORMAT: str = (
        '<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</> | <lvl>{level: <8}</> | '
        '<cyan> {correlation_id} </> | <lvl>{message}</>'
    )
    LOG_FILE_FORMAT: str = (
        '<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</> | <lvl>{level: <8}</> | '
        '<cyan> {correlation_id} </> | <lvl>{message}</>'
    )

    PORT: int = 8000


@lru_cache
def get_settings() -> FridaySettings:
    return FridaySettings()


settings = get_settings() 