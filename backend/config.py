from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
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
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()

