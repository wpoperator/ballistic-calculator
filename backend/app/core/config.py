from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # App settings
    APP_NAME: str = "Ballistics Calculator API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Security settings
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALLOWED_HOSTS: List[str] = ["*"]
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
    ]

    # API settings
    API_PREFIX: str = "/api"

    # Rate limiting
    RATE_LIMIT: str = "100/minute"

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    # Ballistics calculation limits
    MAX_RANGE_YARDS: float = 3000.0
    MIN_RANGE_YARDS: float = 25.0
    MAX_STEP_SIZE: float = 100.0
    MIN_STEP_SIZE: float = 1.0

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()
