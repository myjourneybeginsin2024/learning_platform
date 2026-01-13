from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api import deps
from app.core.security import get_password_hash
from app.db.session import get_db
from app.models.user import User
from app.models.organization import Organization, OrganizationAdmin, OrganizationMember
from pydantic import BaseModel

router = APIRouter(prefix="/superadmin", tags=["superadmin"])

# Response Models
class SystemStats(BaseModel):
    total_users: int
    total_organizations: int
    total_admins: int

class OrganizationMini(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True

class UserOut(BaseModel):
    id: int
    email: str
    is_active: bool
    role: str
    organizations: List[OrganizationMini] = []
    class Config:
        from_attributes = True

class OrganizationOut(BaseModel):
    id: int
    name: str
    slug: str
    class Config:
        from_attributes = True

@router.get("/stats", response_model=SystemStats)
def read_system_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Get global system statistics.
    """
    # Using count() for simplicity and compatibility
    total_users = db.query(User).count()
    total_organizations = db.query(Organization).count()
    total_admins = db.query(OrganizationAdmin).count() # This counts org admin assignments, roughly active admins
    
    return {
        "total_users": total_users,
        "total_organizations": total_organizations,
        "total_admins": total_admins
    }

@router.get("/users", response_model=List[UserOut])
def read_all_users(
    skip: int = 0,
    limit: int = 100,
    role: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Retrieve all users.
    """
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    users = query.offset(skip).limit(limit).all()
    
    # Manually populate organizations for admins to avoid complex Pydantic mapping
    results = []
    for user in users:
        user_data = UserOut.model_validate(user)
        if user.role == 'admin':
            orgs = []
            for membership in user.organization_admin_memberships:
                if membership.organization:
                     orgs.append(OrganizationMini(id=membership.organization.id, name=membership.organization.name))
            user_data.organizations = orgs
        results.append(user_data)
        
    return results

class UserCreate(BaseModel):
    email: str
    password: str
    role: str = "user"
    is_active: bool = True
    organization_id: int = None

@router.post("/users", response_model=UserOut)
def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create a new user.
    """
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(status_code=400, detail="The user with this email already exists in the system.")
    
    hashed_password = get_password_hash(user_in.password)
    user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        role=user_in.role,
        is_active=user_in.is_active,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Link to Organization if provided
    if user_in.organization_id is not None:
        org = db.query(Organization).filter(Organization.id == user_in.organization_id).first()
        if not org:
            raise HTTPException(status_code=404, detail="Organization not found")
            
        org_admin = OrganizationAdmin(user_id=user.id, organization_id=org.id)
        db.add(org_admin)
        db.commit()

    return user

class UserUpdate(BaseModel):
    role: str = None
    is_active: bool = None
    email: str = None
    password: str = None
    organization_ids: List[int] = None

@router.put("/users/{user_id}", response_model=UserOut)
def update_user(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    user_in: UserUpdate,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Update a user.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_in.role is not None:
        user.role = user_in.role
    if user_in.is_active is not None:
        user.is_active = user_in.is_active
    
    if user_in.email is not None and user_in.email != user.email:
        existing_user = db.query(User).filter(User.email == user_in.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        user.email = user_in.email
        
    if user_in.password is not None and len(user_in.password) > 0:
        user.hashed_password = get_password_hash(user_in.password)
    
    # Update Organization Links if provided
    if user_in.organization_ids is not None:
        # Clear existing admin links
        db.query(OrganizationAdmin).filter(OrganizationAdmin.user_id == user.id).delete()
        
        # Add new links
        for org_id in user_in.organization_ids:
            # Verify org exists
            org = db.query(Organization).filter(Organization.id == org_id).first()
            if org:
                link = OrganizationAdmin(user_id=user.id, organization_id=org.id)
                db.add(link)
        
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Re-populate organizations for response
    user_data = UserOut.model_validate(user)
    if user.role == 'admin':
        orgs = []
        # Refresh relationship
        db.refresh(user) 
        for membership in user.organization_admin_memberships:
            if membership.organization:
                    orgs.append(OrganizationMini(id=membership.organization.id, name=membership.organization.name))
        user_data.organizations = orgs
        return user_data

    return user

@router.delete("/users/{user_id}", response_model=Any)
def delete_user(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Delete a user.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    db.delete(user)
    db.commit()
    return {"status": "success"}

@router.get("/organizations", response_model=List[OrganizationOut])
def read_all_organizations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Retrieve all organizations.
    """
    orgs = db.query(Organization).offset(skip).limit(limit).all()
    return orgs

class OrganizationUpdate(BaseModel):
    name: str = None
    slug: str = None

@router.put("/organizations/{organization_id}", response_model=OrganizationOut)
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

@router.delete("/organizations/{organization_id}", response_model=Any)
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

@router.get("/organizations/{organization_id}/available-admins", response_model=List[UserOut])
def read_available_admins(
    *,
    db: Session = Depends(get_db),
    organization_id: int,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Retrieve all admins that are NOT yet assigned to the specific organization.
    """
    # Subquery to find user_ids already admin of this org
    existing_admin_ids = db.query(OrganizationAdmin.user_id).filter(OrganizationAdmin.organization_id == organization_id)
    
    # Query users with role='admin' who are NOT in the subquery
    available_admins = db.query(User).filter(
        User.role == 'admin',
        ~User.id.in_(existing_admin_ids)
    ).all()
    
    return available_admins
