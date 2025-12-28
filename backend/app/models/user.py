from sqlalchemy import Column, Integer, String, Boolean
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)  # Made nullable to accommodate OAuth-only users
    role = Column(String, default="user", nullable=False)
    is_active = Column(Boolean, default=True)
    google_id = Column(String, unique=True, index=True, nullable=True)  # For Google OAuth
    microsoft_id = Column(String, unique=True, index=True, nullable=True)  # For Microsoft OAuth
    avatar_url = Column(String, nullable=True)  # For user avatars from OAuth providers

    def verify_password(self, password: str) -> bool:
        # Only verify password if hashed_password exists (for non-OAuth users)
        if self.hashed_password is None:
            return False
        from app.core.security import verify_password
        return verify_password(password, self.hashed_password)
