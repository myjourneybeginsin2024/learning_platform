# Cloud Deployment Log - Learning Platform

## Deployment Process Documentation

This document details the complete deployment process of the Learning Platform from local development to cloud production environment, including all commands, code changes, issues, and solutions encountered during the process.

---

## Phase 1: Initial Setup and Repository Preparation

### 1.1 Repository Push to Git

**Objective**: Push the local repository to a Git hosting service for cloud deployment access.

**Commands executed**:
```bash
git init
git add .
git commit -m "Initial commit - Learning Platform"
git remote add origin <your-repo-url>
git push -u origin main
```

---

## Phase 2: Cloud Environment Setup

### 2.1 Cloud Server Access

**Environment**: Alibaba Cloud ECS instance
**OS**: Linux (Ubuntu/CentOS)

### 2.2 Prerequisites Installation

**Commands executed**:
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
```

### 2.3 Repository Clone

**Commands executed**:
```bash
git clone <your-repo-url>
cd learning-platform
```

---

## Phase 3: Backend Configuration and Issues

### 3.1 Initial Backend Startup

**Commands executed**:
```bash
docker-compose -f infrastructure/docker/docker-compose.prod.yml up -d
```

**Issue Encountered**: Connection to database failed
**Error Message**: `connection to server at "localhost" failed`
**Root Cause**: Database connection URL using localhost instead of service hostname

**Solution Applied**:
Modified `backend/alembic/env.py` to use correct database hostname:

```python
# Set the sqlalchemy.url from environment variable or settings
database_url = os.environ.get('DATABASE_URL', 'postgresql://learning_user:MulaiBeraksi2024@postgres_prod:5432/learning_platform')
config.set_main_option('sqlalchemy.url', database_url)
```

### 3.2 Database Migration Issues

**Issue Encountered**: Alembic migration failed due to empty revision in version table
**Error Message**: `AssertionError: Invalid version table record: ''`
**Root Cause**: Corrupted alembic_version table with empty revision entries

**Solution Applied**:
```bash
# Access database container
docker exec -it postgres_prod psql -U learning_user -d learning_platform

# Clean up corrupted entries
DELETE FROM alembic_version WHERE version_num = '';
```

---

## Phase 4: OAuth and Authentication Issues

### 4.1 Missing OAuth Module

**Issue Encountered**: `ModuleNotFoundError: No module named 'app.oauth'`
**Root Cause**: Missing OAuth module in the backend application

**Solution Applied**: Created `backend/app/oauth.py` with OAuth configuration:

```python
# backend/app/oauth.py
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
from starlette.middleware.sessions import SessionMiddleware
import os

# OAuth configuration
oauth = OAuth()

# Google OAuth configuration
oauth.register(
    name='google',
    client_id=os.getenv('GOOGLE_CLIENT_ID'),
    client_secret=os.getenv('GOOGLE_CLIENT_SECRET'),
    server_metadata_url='https://accounts.google.com/.well-known/openid_configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

# Microsoft OAuth configuration
oauth.register(
    name='microsoft',
    client_id=os.getenv('MICROSOFT_CLIENT_ID'),
    client_secret=os.getenv('MICROSOFT_CLIENT_SECRET'),
    access_token_url='https://login.microsoftonline.com/common/oauth2/v2.0/token',
    access_token_params=None,
    authorize_url='https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    authorize_params=None,
    api_base_url='https://graph.microsoft.com/v1.0/',
    client_kwargs={'scope': 'user.read'},
)
```

### 4.2 OAuth Redirect Issues

**Issue Encountered**: OAuth redirects to localhost:3000 instead of production domain (noleij.com)
**Root Cause**: Incorrect redirect URI construction in OAuth callback endpoints

**Solution Applied**: Updated OAuth callback endpoints in `backend/app/api/auth.py`:

```python
# In Google OAuth callback
async def auth_google_callback(request: Request, code: str = Query(...)):
    # Get the actual host from request headers
    scheme = request.headers.get('x-forwarded-proto', 'https')
    host = request.headers.get('host', 'noleij.com')
    redirect_uri = f"{scheme}://{host}/auth/google/callback"
    
    # Rest of the OAuth flow...
    token = await oauth.google.authorize_access_token(request)
    user_info = await oauth.google.parse_id_token(request, token)
    
    # Create or get user, generate JWT token
    # Redirect to frontend dashboard
    frontend_url = os.getenv('FRONTEND_URL', 'https://noleij.com')
    return RedirectResponse(f"{frontend_url}/dashboard")

# Similar fix for Microsoft OAuth callback
```

### 4.3 Registration JSON Response Issues

**Issue Encountered**: Registration returning HTML instead of JSON with error "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"
**Root Cause**: API endpoints not properly mounted with correct prefixes

**Solution Applied**: Fixed router mounting in `backend/app/main.py`:

```python
from fastapi import FastAPI
from app.api import auth, health, users, feed, admin

app = FastAPI(title="Learning Platform API")

# Properly mount auth router with prefix
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(health.router)
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(feed.router, prefix="/feed", tags=["feed"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
```

---

## Phase 5: Security and Password Hashing Issues

### 5.1 Bcrypt Version Attribute Issue

**Issue Encountered**: `AttributeError: module 'bcrypt' has no attribute '__about__'`
**Root Cause**: Bcrypt module version attribute missing, causing passlib to fail during backend loading

**Solution Applied**: Modified `backend/app/core/security.py` to handle bcrypt version issue:

```python
# Handle the bcrypt version issue at the module level before any bcrypt imports
import sys
import types

# Create the missing __about__ module with version info for bcrypt if it doesn't exist
if 'bcrypt' in sys.modules:
    bcrypt = sys.modules['bcrypt']
else:
    import bcrypt

# Ensure bcrypt has the required __about__ module with version
if not hasattr(bcrypt, '__about__'):
    bcrypt.__about__ = types.ModuleType('bcrypt.__about__')
    bcrypt.__about__.__version__ = '4.0.1'
elif not hasattr(bcrypt.__about__, '__version__'):
    bcrypt.__about__.__version__ = '4.0.1'

# Now import all other modules
from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import logging

from passlib.context import CryptContext

from app.core.config import settings
from app.db.session import get_db
from app.models.user import User

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Configure password hashing context with fallback options
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__ident="2b",
    bcrypt__rounds=12,
)

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    print(f"DEBUG: JWT_SECRET_KEY = {settings.JWT_SECRET_KEY}")
    logger.info(f"VALIDATING token with secret: {settings.JWT_SECRET_KEY[:10]}...")    
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=["HS256"],           
        )
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user  # ← MUST return user


def get_password_hash(password: str):
    # Ensure password is not longer than 72 bytes for bcrypt
    # First, encode to bytes to check actual byte length (not character length)
    password_bytes = password.encode('utf-8')
    
    # If password is longer than 72 bytes, truncate it
    if len(password_bytes) > 72:
        # Truncate to 72 bytes, then decode back to string
        password_bytes = password_bytes[:72]
        # Decode back to string, handling potential multi-byte character truncation
        password = password_bytes.decode('utf-8', errors='ignore')
    elif len(password) > 72:
        # Additional check: if character length is > 72, truncate by characters
        password = password[:72]
    
    # Use bcrypt directly to avoid passlib backend issues
    try:
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    except ValueError as e:
        if "password cannot be longer than 72 bytes" in str(e):
            # If error still occurs, ensure password is properly truncated at the character level
            # This is a final fallback to ensure we never exceed 72 characters
            safe_password = password[:72] if len(password) > 72 else password
            salt = bcrypt.gensalt()
            hashed = bcrypt.hashpw(safe_password.encode('utf-8'), salt)
            return hashed.decode('utf-8')
        else:
            raise


def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Verify password using bcrypt directly to avoid passlib backend issues
    try:
        # Pre-truncate if needed before verification
        plain_password_bytes = plain_password.encode('utf-8')
        if len(plain_password_bytes) > 72:
            plain_password_bytes = plain_password_bytes[:72]
            plain_password = plain_password_bytes.decode('utf-8', errors='ignore')
        elif len(plain_password) > 72:
            # Additional check: if character length is > 72, truncate by characters
            plain_password = plain_password[:72]
        
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except ValueError:
        # Handle case where password is too long
        return False
    except Exception:
        # Handle any other potential errors during verification
        return False


def create_access_token(user_id: int, role: str = "user", expires_delta: timedelta = None):
    logger.info(f"SIGNING token with secret: {settings.JWT_SECRET_KEY[:10]}...")
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=30)  # Default 30 minutes
    
    to_encode = {
        "sub": str(user_id),
        "role": role,
        "exp": expire,
        "iat": datetime.utcnow()
    }
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm="HS256")
    return encoded_jwt


def require_role(required_role: str):
    def checker(user: User = Depends(get_current_user)):
        if user.role != required_role:
            raise HTTPException(
                status_code=403,
                detail="Insufficient permissions"
            )
        return user
    return checker
```

### 5.2 Password Truncation Issue

**Issue Encountered**: `ValueError: password cannot be longer than 72 bytes, truncate manually if necessary`
**Root Cause**: Bcrypt algorithm limitation where passwords longer than 72 bytes cause errors

**Solution Applied**: Implemented robust password truncation in the `get_password_hash` function (as shown in the security.py code above).

---

## Phase 6: Final Deployment Commands

### 6.1 Complete System Restart

**Commands executed**:
```bash
# Stop all services
docker-compose -f infrastructure/docker/docker-compose.prod.yml down

# Rebuild backend service to ensure all changes are applied
docker-compose -f infrastructure/docker/docker-compose.prod.yml build backend_prod

# Start all services
docker-compose -f infrastructure/docker/docker-compose.prod.yml up -d
```

### 6.2 Service Verification

**Commands executed**:
```bash
# Check running containers
docker ps

# Check backend logs
docker logs backend_prod

# Test registration endpoint
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com", "password":"testpass123", "name":"Test User"}'

# Test OAuth redirect (from frontend)
curl -v http://localhost:8000/auth/google
```

---

## Phase 7: Post-Deployment Verification

### 7.1 OAuth Flow Verification

**Test Performed**: Google OAuth flow from frontend to backend and back
**Result**: Successfully redirects to noleij.com/dashboard after authentication

### 7.2 Registration Flow Verification

**Test Performed**: User registration via POST request to /auth/register
**Result**: Successfully returns JWT token with proper JSON response

### 7.3 Database Connection Verification

**Test Performed**: Database operations through various API endpoints
**Result**: All database operations working correctly with postgres_prod hostname

---

## Summary of Issues Resolved

1. **Database Connection Issue**: Fixed localhost reference in alembic configuration
2. **OAuth Module Missing**: Created app.oauth module with proper configuration
3. **OAuth Redirect Issue**: Fixed redirect URI construction to use production domain
4. **API Endpoint Mounting**: Properly mounted auth router with /auth prefix
5. **Bcrypt Version Issue**: Handled missing __about__ attribute in bcrypt module
6. **Password Length Issue**: Implemented robust 72-byte password truncation
7. **JSON Response Issue**: Fixed API endpoints to return proper JSON instead of HTML

## Key Learnings

1. Production environment variables must be properly configured for all services
2. Docker container communication requires using service hostnames, not localhost
3. OAuth flows require proper redirect URI construction based on request headers
4. Password hashing libraries may have specific requirements that need handling
5. Proper error handling and fallback mechanisms are essential for production systems

## Next Steps

1. Implement monitoring and logging for production environment
2. Set up SSL certificates for HTTPS
3. Configure backup strategies for database
4. Implement CI/CD pipeline for automated deployments
5. Set up proper environment variable management for production

---

**Deployment Date**: December 26, 2025
**Deployed Version**: Learning Platform v1.0
**Deployed By**: Development Team
