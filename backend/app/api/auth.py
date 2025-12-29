from fastapi import APIRouter, HTTPException, Depends, status, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.session import get_db
from app.models.user import User
from app.core.security import create_access_token, verify_password, get_password_hash
from app.core.config import settings
from authlib.integrations.starlette_client import OAuth
import os
import httpx 
import logging
# Set insecure transport for Docker/Proxy env
os.environ['AUTHLIB_INSECURE_TRANSPORT'] = '1'
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
router = APIRouter()
# --- OAuth Setup ---
oauth = OAuth()
oauth.register(
    name='google',
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)
oauth.register(
    name='microsoft',
    client_id=settings.MICROSOFT_CLIENT_ID,
    client_secret=settings.MICROSOFT_CLIENT_SECRET,
    server_metadata_url='https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration',
    client_kwargs={'scope': 'User.Read'}
)
# -------------------
class AuthRequest(BaseModel):
    email: str
    password: str
class UserCreate(BaseModel):
    email: str
    password: str
@router.post("/login")
def login(request: AuthRequest, db: Session = Depends(get_db)):
    normalized_email = request.email.lower().strip()
    user = db.query(User).filter(User.email == normalized_email).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token(user_id=user.id, role=user.role)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role
        }
    }
@router.post("/register")
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    normalized_email = user_in.email.lower().strip()
    
    if db.query(User).filter(User.email == normalized_email).first():
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists."
        )
    
    user = User(
        email=normalized_email,
        hashed_password=get_password_hash(user_in.password),
        role="user", 
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    access_token = create_access_token(user_id=user.id, role=user.role)
    return {
        "access_token": access_token,
        "msg": "Registration successful", 
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role
        }
    }
# --- OAUTH ROUTES (MANUAL IMPLEMENTATION) ---
@router.get("/google")
async def google_login(request: Request):
    try:
        redirect_uri = "https://noleij.com/auth/complete/google-oauth2/"
        return await oauth.google.authorize_redirect(request, redirect_uri)
    except Exception as e:
         logger.error(f"Google Login Start Error: {str(e)}")
         raise HTTPException(status_code=500, detail="Could not start Google Login")
@router.get("/complete/google-oauth2/")
async def google_auth(request: Request, db: Session = Depends(get_db)):
    try:
        # MANUAL TOKEN FETCH to avoid Authlib session conflicts
        redirect_uri = "https://noleij.com/auth/complete/google-oauth2/"
        
        # 1. Manually exchange code for token using fetch_access_token
        # This bypasses authorize_access_token which relies on session verification that is failing
        token = await oauth.google.fetch_access_token(
            redirect_uri=redirect_uri,
            grant_type='authorization_code',
            code=request.query_params.get('code')
        )
        
        # 2. Get User Info
        if 'userinfo' in token:
            user_info = token['userinfo']
        else:
            user_info = await oauth.google.userinfo(token=token)
            
    except Exception as e:
        # Note: Changed Error Log prefix for verification
        logger.error(f"OAuth Manual Callback Error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"OAuth Manual Error: {str(e)}")
    email = user_info.get('email')
    if not email:
        raise HTTPException(status_code=400, detail="No email returned from Google")
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            hashed_password=get_password_hash("oauth_social_login"),
            role="user", 
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    access_token = create_access_token(user_id=user.id, role=user.role)
    return RedirectResponse(url=f"{settings.FRONTEND_URL}/login?token={access_token}")
@router.get("/microsoft")
async def microsoft_login(request: Request):
    redirect_uri = request.url_for('microsoft_auth')
    return await oauth.microsoft.authorize_redirect(request, redirect_uri)
@router.get("/microsoft/callback")
async def microsoft_auth(request: Request, db: Session = Depends(get_db)):
    try:
        token = await oauth.microsoft.authorize_access_token(request)
    except Exception as e:
        logger.error(f"Microsoft OAuth Callback Error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"OAuth Error: {str(e)}")
    user_info = await oauth.microsoft.userinfo(token=token)
    email = user_info.get('mail') or user_info.get('userPrincipalName')
    
    if not email:
         raise HTTPException(status_code=400, detail="Could not retrieve email.")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            hashed_password=get_password_hash("oauth_social_login"),
            role="user",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    access_token = create_access_token(user_id=user.id, role=user.role)
    
    return RedirectResponse(url=f"{settings.FRONTEND_URL}/login?token={access_token}")
