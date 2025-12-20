from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel  # ← ADD THIS

from app.db.session import get_db
from app.models.user import User
from app.core.security import hash_password, verify_password
from app.core.auth import create_access_token

from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth")

# ← ADD THESE MODELS
class AuthRequest(BaseModel):
    email: str
    password: str

@router.post("/register")
def register(request: AuthRequest, db: Session = Depends(get_db)):  # ← USE request: AuthRequest
    existing = db.query(User).filter(User.email == request.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=request.email,
        hashed_password=hash_password(request.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "email": user.email}

@router.post("/login")
def login(request: AuthRequest, db: Session = Depends(get_db)):  # ← USE request: AuthRequest
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    token = create_access_token(user.id, user.role)
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me")
def read_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
    }
