from fastapi import APIRouter, HTTPException, Request, Depends, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.core.security import create_access_token, get_password_hash, verify_password
from app.core.config import settings
from app.oauth import oauth
from pydantic import BaseModel  # ← this is required

router = APIRouter()

class RegisterRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
async def login(user_data: dict, db: Session = Depends(get_db)):
    email = user_data.get("email")
    password = user_data.get("password")

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Email and password required"
        )

    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    token = create_access_token(user.id, user.role)
    return {"access_token": token, "token_type": "bearer"}

@router.post("/register")
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    email = request.email
    password = request.password

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Email and password required"
        )

    # Validate password length
    if len(password.encode('utf-8')) > 72:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password too long (max 72 bytes)"
        )

    # Check if user already exists
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user — note: your User model does NOT have 'name'
    hashed_password = get_password_hash(password)
    user = User(
        email=email,
        hashed_password=hashed_password
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(user.id, user.role)
    return {"access_token": access_token, "token_type": "bearer"}

# Google OAuth endpoints
@router.get("/google")
async def google_login(request: Request):
    redirect_uri = f"{settings.FRONTEND_URL}/auth/complete/google-oauth2/"
    try:
        return await oauth.google.authorize_redirect(request, redirect_uri)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Google OAuth error: {str(e)}")


@router.get("/complete/google-oauth2/")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get('userinfo')
        if not user_info:
            user_info = await oauth.google.parse_id_token(request, token)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch user info: {str(e)}")

    email = user_info.get('email')
    if not email:
        raise HTTPException(status_code=400, detail="Google account must have an email")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            google_id=user_info.get('sub'),
            avatar_url=user_info.get('picture')
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = create_access_token(user.id, user.role)
    redirect_url = f"{settings.FRONTEND_URL}/auth/callback?access_token={access_token}&token_type=bearer"
    return RedirectResponse(url=redirect_url)


# Microsoft OAuth endpoints
@router.get("/microsoft")
async def microsoft_login(request: Request):
    redirect_uri = f"{settings.FRONTEND_URL}/auth/complete/microsoft-oauth2/"
    try:
        return await oauth.microsoft.authorize_redirect(request, redirect_uri)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Microsoft OAuth error: {str(e)}")


@router.get("/complete/microsoft-oauth2/")
async def microsoft_callback(request: Request, db: Session = Depends(get_db)):
    try:
        token = await oauth.microsoft.authorize_access_token(request)
        user_info = await oauth.microsoft.parse_id_token(request, token)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch user info: {str(e)}")

    email = user_info.get('email') or user_info.get('preferred_username')
    if not email:
        raise HTTPException(status_code=400, detail="Microsoft account must have an email")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            microsoft_id=user_info.get('sub')
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = create_access_token(user.id, user.role)
    redirect_url = f"{settings.FRONTEND_URL}/auth/callback?access_token={access_token}&token_type=bearer"
    return RedirectResponse(url=redirect_url)


@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}
