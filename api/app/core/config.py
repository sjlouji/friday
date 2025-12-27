from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    app_name: str = "Friday Beancount API"
    version: str = "1.0.0"
    api_v1_prefix: str = "/api"
    
    cors_origins: List[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ]
    
    beancount_file: str = "ledger.beancount"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

