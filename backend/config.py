from pathlib import Path
from typing import List

from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict


# Load environment variables from project root and diy/.env (if present)
_PROJECT_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(_PROJECT_ROOT / ".env", override=False)
load_dotenv(_PROJECT_ROOT / "diy" / ".env", override=False)


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        extra="ignore",
        env_file=".env",
        case_sensitive=False,
    )

    # API Settings
    app_name: str = "DIY CrewAI API"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # CORS Settings
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",  # Vite dev server
        "http://frontend",
    ]
    
    # Database
    database_url: str = "postgresql://diy_user:diy_password@db:5432/diy"
    
    # SMTP Configuration
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from_email: str = ""
    smtp_from_name: str = "DIY CrewAI"
    
    # File Storage
    downloads_dir: str = "/app/diy/outputs/generated"
    outputs_dir: str = "/app/diy/outputs"
    
    # CrewAI
    crewai_working_dir: str = "/app/diy"

    # OpenAI
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"

# Global settings instance
settings = Settings()

