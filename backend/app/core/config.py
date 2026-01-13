import os
from pydantic_settings import BaseSettings
from typing import List
from fastapi.security import OAuth2PasswordBearer

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://learning_user:MulaiBeraksi2024@db:5432/learning_platform")
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    CORS_ORIGINS: List[str] = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001,https://noleij.com").split(",")
    
    # OAuth settings
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    MICROSOFT_CLIENT_ID: str = os.getenv("MICROSOFT_CLIENT_ID", "")
    MICROSOFT_CLIENT_SECRET: str = os.getenv("MICROSOFT_CLIENT_SECRET", "")
    DASHSCOPE_API_KEY: str = os.getenv("DASHSCOPE_API_KEY", "")
    
    # Frontend URL
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "https://noleij.com")

    # [MODIFIED FOR LOCAL DEV]
    # Added API_BASE_URL to support dynamic OAuth redirects on localhost
    API_BASE_URL: str = os.getenv("API_BASE_URL", "https://noleij.com")
    
    # CORS settings
    BACKEND_CORS_ORIGINS: List[str] = []
    
    # OAuth2 scheme for dependency injection
    oauth2_scheme: OAuth2PasswordBearer = OAuth2PasswordBearer(tokenUrl="auth/login")

    class Config:
        env_file = ".env"
        extra = "ignore"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Set BACKEND_CORS_ORIGINS from CORS_ORIGINS
        self.BACKEND_CORS_ORIGINS = [origin.strip() for origin in self.CORS_ORIGINS]

        # [AUTO-FIX] Force Localhost if Env Var is polluted with Docker hostname
        # Also handles default value '@db' which fails on host
        if any(x in self.DATABASE_URL for x in ["postgres_prod", "postgres_local", "@db:"]):
            # Check if we are presumably running locally (not in docker)
            # Simple heuristic: If OS is Windows, we likely want localhost
            if os.name == 'nt': 
                print(f"WARNING: Detected Docker hostname in '{self.DATABASE_URL}' on Windows. Forcing localhost.")
                self.DATABASE_URL = self.DATABASE_URL.replace("postgres_prod", "localhost")\
                                                     .replace("postgres_local", "localhost")\
                                                     .replace("@db:", "@localhost:")

settings = Settings()
