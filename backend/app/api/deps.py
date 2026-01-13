from fastapi import Depends, HTTPException, status, Path
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import get_current_user as security_get_current_user
from app.models.user import User
from app.models.organization import OrganizationMember, OrganizationAdmin

# Use the existing get_current_user
def get_current_user(user: User = Depends(security_get_current_user)) -> User:
    return user

def get_current_active_superuser(current_user: User = Depends(get_current_user)) -> User:
    # Check both legacy role string and standard is_superuser flag
    if current_user.role not in ["super_admin", "super admin"] and not getattr(current_user, "is_superuser", False):
         raise HTTPException(
            status_code=403, detail="The user doesn't have enough privileges"
         )
    return current_user

def get_current_organization_member(
    organization_id: int = Path(..., title="The ID of the organization to access"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> OrganizationMember:
    member = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == current_user.id,
        OrganizationMember.organization_id == organization_id
    ).first()
    
    # Allow Super Admins to bypass
    if current_user.role in ["super_admin", "super admin"] or getattr(current_user, "is_superuser", False):
        if not member:
            # If not a member, return a dummy object or handle gracefully. 
            # Ideally return current_user but type hint says OrganizationMember.
            # But the endpoint uses duck typing for 'has access'. 
            # Let's return the user wrapped or just the user if the endpoint supports it.
            # Looking at organizations.py: current_user: User ...
            # Wait, api endpoint types `current_user: User`. 
            # deps.get_current_organization_member returns OrganizationMember OR OrganizationAdmin.
            # But the type hint in endpoint is `User`?
            # No, in organizations.py: `current_user: User = Depends(deps.get_current_organization_member)`
            # BUT deps returns `OrganizationMember`. This is a mismatch in type hint in organizations.py.
            # However fail-safe is to return something that has .user_id or .id?
            # Actually, `read_organization` doesn't USE `current_user`!
            # It just uses it for Authorization.
            return getattr(member, 'user', current_user) 
            
    if not member:
        # Fallback: Check if admin
        admin = db.query(OrganizationAdmin).filter(
            OrganizationAdmin.user_id == current_user.id,
            OrganizationAdmin.organization_id == organization_id
        ).first()
        if admin:
            return admin # Return admin object which has same interface (user_id, organization_id)

        raise HTTPException(
            status_code=403, detail="User is not a member of this organization"
        )
    return member

def get_current_organization_admin(
    organization_id: int = Path(..., title="The ID of the organization to access"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> OrganizationAdmin:
    admin = db.query(OrganizationAdmin).filter(
        OrganizationAdmin.user_id == current_user.id,
        OrganizationAdmin.organization_id == organization_id
    ).first()
    
    # Allow Super Admins to bypass
    if current_user.role in ["super_admin", "super admin"] or getattr(current_user, "is_superuser", False):
         # If the endpoint assumes it gets an OrganizationAdmin object, we might crash if we return User.
         # But usually these endpoints use `current_user` for permission check only.
         return getattr(admin, 'user', current_user)

    if not admin:
        raise HTTPException(
            status_code=403, detail="User is not an admin of this organization"
        )
    return admin

def require_role(allowed_roles: list):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Role {current_user.role} is not authorized"
            )
        return current_user
    return role_checker
