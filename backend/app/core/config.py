from pydantic import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://learning_user:MulaiBeraksi2024@localhost:5432/learning_platform"

    class Config:
        env_file = ".env"

settings = Settings()
