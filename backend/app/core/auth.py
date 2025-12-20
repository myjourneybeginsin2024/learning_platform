# ~/apps/backend/app/core/auth.py
from datetime import datetime, timedelta
from jose import jwt
from app.core.config import settings  # ← IMPORT settings

def create_access_token(user_id: int, role: str):
    """Create JWT token with user_id and role for RBAC."""
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "role": role,
        "exp": expire
    }
    return jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm="HS256"
    )


