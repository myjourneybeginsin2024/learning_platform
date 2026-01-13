from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.models.user import User
from app.db.session import get_db
from sqlalchemy.orm import Session
from app.models.organization import OrganizationMember, OrganizationAdmin

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me")
def read_current_user(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Explicitly reload user with relationships to ensure data is present
    # (Fixes issue where lazy loading might return empty in some contexts)
    from sqlalchemy.orm import joinedload
    user = db.query(User).options(
        joinedload(User.organization_memberships).joinedload(OrganizationMember.organization),
        joinedload(User.organization_admin_memberships).joinedload(OrganizationAdmin.organization)
    ).filter(User.id == current_user.id).first()
    
    if not user:
        return current_user # Fallback

    orgs_data = {}
    
    if user.organization_memberships:
        for mem in user.organization_memberships:
            if mem.organization:
                orgs_data[mem.organization.id] = {
                    "id": mem.organization.id,
                    "name": mem.organization.name,
                    "slug": mem.organization.slug,
                    "role": "member"
                }
        
    if user.organization_admin_memberships:
        for admin in user.organization_admin_memberships:
            if admin.organization:
                orgs_data[admin.organization.id] = {
                    "id": admin.organization.id,
                    "name": admin.organization.name,
                    "slug": admin.organization.slug,
                    "role": "admin"
                }

    return {
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "organizations": list(orgs_data.values())
    }
