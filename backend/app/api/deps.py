from fastapi import Depends, HTTPException
from app.core.security import get_current_user as security_get_current_user
from app.models.user import User

# This is the standard way to provide the user to routes
def get_current_user(user: User = Depends(security_get_current_user)):
    return user

# This helper allows you to check for multiple roles at once
def require_role(allowed_roles: list):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Role {current_user.role} is not authorized"
            )
        return current_user
    return role_checker
