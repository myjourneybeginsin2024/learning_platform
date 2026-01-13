from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import Any, List

from app.api import deps
from app.db.session import get_db
from app.models.organization import Organization, OrganizationMember, OrganizationAdmin
from app.models.user import User
from pydantic import BaseModel

router = APIRouter()

# Simple Pydantic models for request body (can be moved to schemas/ later)
class OrganizationCreate(BaseModel):
    name: str
    slug: str

class OrganizationOut(BaseModel):
    id: int
    name: str
    slug: str
    class Config:
        orm_mode = True

@router.post("/", response_model=OrganizationOut)
def create_organization(
    *,
    db: Session = Depends(get_db),
    org_in: OrganizationCreate,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create new organization.
    """
    # Check if slug exists
    if db.query(Organization).filter(Organization.slug == org_in.slug).first():
        raise HTTPException(status_code=400, detail="Organization slug already exists")

    org = Organization(name=org_in.name, slug=org_in.slug)
    db.add(org)
    db.commit()
    db.refresh(org)
    db.refresh(org)
    return org

class OrganizationUpdate(BaseModel):
    name: str = None
    slug: str = None

@router.put("/{organization_id}", response_model=OrganizationOut)
def update_organization(
    *,
    db: Session = Depends(get_db),
    organization_id: int,
    org_in: OrganizationUpdate,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Update an organization.
    """
    org = db.query(Organization).filter(Organization.id == organization_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    if org_in.name is not None:
        org.name = org_in.name
    if org_in.slug is not None:
        # Check uniqueness if changed
        if org_in.slug != org.slug:
             if db.query(Organization).filter(Organization.slug == org_in.slug).first():
                 raise HTTPException(status_code=400, detail="Organization slug already exists")
        org.slug = org_in.slug
        
    db.add(org)
    db.commit()
    db.refresh(org)
    return org

@router.delete("/{organization_id}", response_model=Any)
def delete_organization(
    *,
    db: Session = Depends(get_db),
    organization_id: int,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Delete an organization.
    """
    org = db.query(Organization).filter(Organization.id == organization_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
        
    # Manual Cascade Delete
    try:
        db.query(OrganizationAdmin).filter(OrganizationAdmin.organization_id == organization_id).delete(synchronize_session=False)
        db.query(OrganizationMember).filter(OrganizationMember.organization_id == organization_id).delete(synchronize_session=False)
        
        db.delete(org)
        db.commit()
    except Exception as e:
        print(f"Error deleting organization: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        
    return {"status": "success"}

@router.get("/{organization_id}", response_model=Any)
def read_organization(
    *,
    db: Session = Depends(get_db),
    organization_id: int,
    current_user: User = Depends(deps.get_current_organization_member),
) -> Any:
    """
    Get organization details including members and admins.
    """
    org = db.query(Organization).filter(Organization.id == organization_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
        
    # Serialize members
    members_data = []
    for member in org.members:
        if member.user:
            members_data.append({
                "id": member.user.id,
                "email": member.user.email,
                "role": "member",
                "joined_at": None
            })
            
    # Serialize admins
    for admin in org.admins:
        if admin.user:
            # Check if already added as member
            existing_member = next((m for m in members_data if m['id'] == admin.user.id), None)
            
            if existing_member:
                # If they are already in the list (e.g. as a member), UPGRADE their role to admin
                existing_member['role'] = 'admin'
            else:
                members_data.append({
                    "id": admin.user.id,
                    "email": admin.user.email,
                    "role": "admin",
                })
        else:
            print(f"DEBUG: Admin {admin.user_id} has no user object")
            
    return {
        "id": org.id,
        "name": org.name,
        "slug": org.slug,
        "members": members_data
    }

@router.post("/{organization_id}/users", response_model=Any)
def add_user_to_organization(
    *,
    db: Session = Depends(get_db),
    organization_id: int,
    user_email: str = Body(..., embed=True),
    role: str = Body("member", embed=True), # member or admin
    current_user: User = Depends(deps.get_current_organization_admin), 
) -> Any:
    """
    Add user to organization.
    """
    user_to_add = db.query(User).filter(User.email == user_email).first()
    if not user_to_add:
        raise HTTPException(status_code=404, detail="User not found")
    
    if role == "admin":
        if db.query(OrganizationAdmin).filter_by(user_id=user_to_add.id, organization_id=organization_id).first():
             return {"status": "User is already an admin"}
        obj = OrganizationAdmin(user_id=user_to_add.id, organization_id=organization_id)
        db.add(obj)
    else:
        if db.query(OrganizationMember).filter_by(user_id=user_to_add.id, organization_id=organization_id).first():
             return {"status": "User is already a member"}
        obj = OrganizationMember(user_id=user_to_add.id, organization_id=organization_id)
        db.add(obj)
        
    db.commit()
    return {"status": "success"}

@router.get("/{organization_id}/stats", response_model=Any)
def read_organization_stats(
    *,
    db: Session = Depends(get_db),
    organization_id: int,
    current_user: User = Depends(deps.get_current_organization_admin),
) -> Any:
    """
    Get organization stats.
    """
    member_count = db.query(OrganizationMember).filter(OrganizationMember.organization_id == organization_id).count()
    return {"member_count": member_count}

@router.delete("/{organization_id}/users/{user_id}", response_model=Any)
def delete_user_from_organization(
    *,
    db: Session = Depends(get_db),
    organization_id: int,
    user_id: int,
    current_user: User = Depends(deps.get_current_organization_admin),
) -> Any:
    """
    Remove user from organization (removes both member and admin roles).
    """
    # Remove from Admin
    db.query(OrganizationAdmin).filter(
        OrganizationAdmin.user_id == user_id,
        OrganizationAdmin.organization_id == organization_id
    ).delete()

    # Remove from Member
    db.query(OrganizationMember).filter(
        OrganizationMember.user_id == user_id,
        OrganizationMember.organization_id == organization_id
    ).delete()
    
    db.commit()
    return {"status": "success"}
