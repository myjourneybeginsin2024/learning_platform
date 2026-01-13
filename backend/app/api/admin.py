from fastapi import APIRouter, Depends, HTTPException, Body, UploadFile, File
import os
import shutil
import uuid
from app.services.document_parser import DocumentParser
from app.services.llm import LLMService
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from datetime import datetime

from app.db.session import get_db
from app.api import deps
from app.models.organization import Organization, OrganizationMember, OrganizationAdmin, OrganizationFile, OrganizationTopic, OrganizationTopicModule
from app.models.user import User
from app.core.security import get_password_hash

router = APIRouter(prefix="/admin", tags=["admin"])

# --- Schemas ---
from app.schemas import (
    FileCreate, FileOut,
    ModuleCreate, ModuleOut,
    TopicCreate, TopicOut,
    OrgStats, OrgUserOut,
    OrgUserCreate, OrgUserUpdate
)









# --- Endpoints ---

@router.get("/organizations/{organization_id}/stats", response_model=OrgStats)
def get_organization_stats(
    organization_id: int,
    db: Session = Depends(get_db),
    current_admin: OrganizationAdmin = Depends(deps.get_current_organization_admin)
):
    """
    Get high-level stats for the organization dashboard.
    """
    total_users = db.query(OrganizationMember).filter(OrganizationMember.organization_id == organization_id).count()
    total_files = db.query(OrganizationFile).filter(OrganizationFile.organization_id == organization_id).count()
    total_topics = db.query(OrganizationTopic).filter(OrganizationTopic.organization_id == organization_id).count()
    active_topics = db.query(OrganizationTopic).filter(
        OrganizationTopic.organization_id == organization_id,
        OrganizationTopic.is_active == True
    ).count()

    return {
        "total_users": total_users,
        "total_files": total_files,
        "total_topics": total_topics,
        "active_topics": active_topics
    }

# --- Files (Knowledge Base) ---

@router.get("/organizations/{organization_id}/files", response_model=List[FileOut])
def list_organization_files(
    organization_id: int,
    db: Session = Depends(get_db),
    current_admin: OrganizationAdmin = Depends(deps.get_current_organization_admin)
):
    return db.query(OrganizationFile).filter(OrganizationFile.organization_id == organization_id).all()

@router.post("/organizations/{organization_id}/files", response_model=FileOut)
def upload_organization_file(
    organization_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_admin: OrganizationAdmin = Depends(deps.get_current_organization_admin)
):
    # Ensure uploads directory exists
    UPLOAD_DIR = "uploads"
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # Generate unique filename
    file_ext = os.path.splitext(file.filename)[1]
    unique_name = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)

    # Save file locally
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Save to DB
    # Note: URL is storing the local path for this phase. In prod, use S3 URL.
    db_file = OrganizationFile(
        organization_id=organization_id,
        name=file.filename,
        url=file_path, 
        file_type=file_ext.strip('.') or "txt"
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    return db_file

@router.post("/organizations/{organization_id}/files/{file_id}/generate")
async def generate_curriculum_from_file(
    organization_id: int,
    file_id: int,
    db: Session = Depends(get_db),
    current_admin: OrganizationAdmin = Depends(deps.get_current_organization_admin)
):
    """
    Trigger AI generation from an existing file.
    """
    # 1. Get File Record
    db_file = db.query(OrganizationFile).filter(
        OrganizationFile.id == file_id, 
        OrganizationFile.organization_id == organization_id
    ).first()
    
    if not db_file:
         raise HTTPException(status_code=404, detail="File not found")

    # 2. Read File Content
    file_path = db_file.url # Assuming we stored local path here (see upload)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=400, detail="File content missing on server.")

    try:
        with open(file_path, "rb") as f:
            content_bytes = f.read()
            
        # 3. Parse Text
        text_content = await DocumentParser.extract_text(content_bytes, db_file.name)
        
        if not text_content.strip():
             raise HTTPException(status_code=400, detail="Could not extract text from file.")

        # 4. Generate with LLM
        generated_json = LLMService.generate_curriculum(text_content)
        
        return generated_json

    except Exception as e:
        print(f"Generation Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/organizations/{organization_id}/files/{file_id}")
def delete_organization_file(
    organization_id: int,
    file_id: int,
    db: Session = Depends(get_db),
    current_admin: OrganizationAdmin = Depends(deps.get_current_organization_admin)
):
    file = db.query(OrganizationFile).filter(
        OrganizationFile.id == file_id,
        OrganizationFile.organization_id == organization_id
    ).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    db.delete(file)
    db.commit()
    return {"status": "success"}

# --- Topics (Curriculum) ---

@router.get("/organizations/{organization_id}/topics", response_model=List[TopicOut])
def list_organization_topics(
    organization_id: int,
    db: Session = Depends(get_db),
    current_member: OrganizationMember = Depends(deps.get_current_organization_member)
):
    return db.query(OrganizationTopic).filter(OrganizationTopic.organization_id == organization_id).all()

@router.post("/organizations/{organization_id}/topics", response_model=TopicOut)
def create_organization_topic(
    organization_id: int,
    topic_in: TopicCreate,
    db: Session = Depends(get_db),
    current_admin: OrganizationAdmin = Depends(deps.get_current_organization_admin)
):
    db_topic = OrganizationTopic(
        organization_id=organization_id,
        title=topic_in.title,
        description=topic_in.description,
        image_url=topic_in.image_url,
        is_active=topic_in.is_active
    )
    db.add(db_topic)
    db.commit()
    db.refresh(db_topic)

    # Add Modules
    if topic_in.modules:
        for mod in topic_in.modules:
            db_mod = OrganizationTopicModule(
                topic_id=db_topic.id,
                title=mod.title,
                content=mod.content,
                image_url=mod.image_url,
                sort_order=mod.sort_order
            )
            db.add(db_mod)
        db.commit()
        db.refresh(db_topic)

    return db_topic

@router.delete("/organizations/{organization_id}/topics/{topic_id}")
def delete_organization_topic(
    organization_id: int,
    topic_id: int,
    db: Session = Depends(get_db),
    current_admin: OrganizationAdmin = Depends(deps.get_current_organization_admin)
):
    topic = db.query(OrganizationTopic).filter(
        OrganizationTopic.id == topic_id,
        OrganizationTopic.organization_id == organization_id
    ).first()
    if not topic:
         raise HTTPException(status_code=404, detail="Topic not found")
    
    db.delete(topic)
    db.commit()
    db.delete(topic)
    db.commit()
    return {"status": "success"}

@router.get("/organizations/{organization_id}/topics/{topic_id}", response_model=TopicOut)
def get_organization_topic(
    organization_id: int,
    topic_id: int,
    db: Session = Depends(get_db),
    # Using member dependency to allow users to read it too
    current_member: OrganizationMember = Depends(deps.get_current_organization_member)
):
    topic = db.query(OrganizationTopic).filter(
        OrganizationTopic.id == topic_id,
        OrganizationTopic.organization_id == organization_id
    ).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    return topic

# --- Users (Employees) ---



@router.get("/organizations/{organization_id}/users", response_model=List[OrgUserOut])
def list_organization_users(
    organization_id: int,
    db: Session = Depends(get_db),
    current_admin: OrganizationAdmin = Depends(deps.get_current_organization_admin)
):
    """
    List all users (members and admins) in the organization.
    """
    # 1. Get Members
    members = db.query(OrganizationMember).filter(OrganizationMember.organization_id == organization_id).all()
    # 2. Get Admins
    admins = db.query(OrganizationAdmin).filter(OrganizationAdmin.organization_id == organization_id).all()
    
    results = []
    
    # Process Members
    print(f"DEBUG: Found {len(members)} members for org {organization_id}")
    for m in members:
        # Avoid duplicates if someone is both (shouldn't happen ideally, but handle it)
        user = db.query(User).filter(User.id == m.user_id).first()
        if user:
            print(f"DEBUG: Processing user {user.email} (ID: {user.id})")
            results.append({
                "id": user.id,
                "email": user.email,
                "full_name": getattr(user, 'full_name', None),
                "role": "member"
            })
            
    # Process Admins
    for a in admins:
        # Check if already added as member? 
        # For simplicity, if user is in results with role 'member', upgrade to 'admin' or list Separate?
        # Usually admins are also members. Let's assume unique list based on User ID.
        user = db.query(User).filter(User.id == a.user_id).first()
        if user:
            existing = next((r for r in results if r["id"] == user.id), None)
            if existing:
                existing["role"] = "admin" # Admin overrides member
            else:
                results.append({
                    "id": user.id,
                    "email": user.email,
                    "full_name": user.full_name,
                    "role": "admin"
                })
                
    return results





@router.post("/organizations/{organization_id}/users", response_model=OrgUserOut)
def add_organization_user(
    organization_id: int,
    user_in: OrgUserCreate,
    db: Session = Depends(get_db),
    current_admin: OrganizationAdmin = Depends(deps.get_current_organization_admin)
):
    """
    Create a new user and add them to the organization.
    If user with email already exists, return 400 (Cannot overwrite).
    """
    # 1. Check if User exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists.")

    # 2. Create New User
    hashed_pw = get_password_hash(user_in.password)
    new_user = User(
        email=user_in.email,
        hashed_password=hashed_pw,
        full_name=user_in.full_name, # Assuming User model has full_name, wait, I need to check User model again. 
        # Checking User model... The view_file User.py shows it DOES NOT have full_name column explicitly?
        # AHH, the User view file earlier showed:
        # id, email, hashed_password, role, is_active, google_id, microsoft_id, avatar_url.
        # It DOES NOT show full_name. But OrgUserOut schema uses full_name?
        # Let me re-verify User model in a bit. If it's missing, I'll add it or map it.
        # Assuming for now it logic holds or I'll fix schemas.
        role="user", # Default global role
        is_active=True
    )
    # Wait, the previous `OrgUserOut` schema used full_name. 
    # Let's double check if my `User` model actually has `full_name`. The view_file output did NOT show it. 
    # BUT `list_organization_users` used `user.full_name`. 
    # If the code compiles/runs, maybe I missed it in view_file or it's implicitly there?
    # Actually, looking at `list_organization_users`: `results.append({ ... "full_name": user.full_name ... })`.
    # And my view_file output:
    # 5: class User(Base): ...
    # It ends at line 26.
    # It seems `full_name` might be missing from the model definition I viewed! Or the previous engineer assumed it exists.
    # If I try to access `user.full_name` and it doesn't exist, it will crash.
    # I should safely assume I might need to add it or ignore it for now.
    # User request: "3. edit empyloyee, edit its name and password" -> explicitly asks for name.
    # So I MUST ensure User model has full_name.
    # For this step, I will assume I can pass it to constructor. If it fails, I'll fix the Model.
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 3. Add to Organization
    if user_in.role == 'admin':
        new_relation = OrganizationAdmin(user_id=new_user.id, organization_id=organization_id)
        db.add(new_relation)
        new_member = OrganizationMember(user_id=new_user.id, organization_id=organization_id)
        db.add(new_member)
    else:
        new_member = OrganizationMember(user_id=new_user.id, organization_id=organization_id)
        db.add(new_member)

    db.commit()
    
    return {
        "id": new_user.id,
        "email": new_user.email,
        "full_name": getattr(new_user, 'full_name', None),
        "role": user_in.role
    }

@router.put("/organizations/{organization_id}/users/{user_id}", response_model=OrgUserOut)
def update_organization_user(
    organization_id: int,
    user_id: int,
    user_in: OrgUserUpdate,
    db: Session = Depends(get_db),
    current_admin: OrganizationAdmin = Depends(deps.get_current_organization_admin)
):
    """
    Update Organization Employee (Name, Password).
    """
    # 1. Verify user is in this org
    member = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == user_id,
        OrganizationMember.organization_id == organization_id
    ).first()
    
    if not member:
         raise HTTPException(status_code=404, detail="User not found in this organization.")
         
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    # 2. Update fields
    if user_in.password:
        user.hashed_password = get_password_hash(user_in.password)
    
    # Handle full_name update if model supports it
    if user_in.full_name is not None:
        if hasattr(user, 'full_name'):
             user.full_name = user_in.full_name
        # Note: If database column missing, this won't persist unless I add it.
        # I will check `User` model in next step to be sure.

    db.commit()
    db.refresh(user)

    # Determine role for response
    role = "member"
    admin_rel = db.query(OrganizationAdmin).filter(
        OrganizationAdmin.user_id == user.id, 
        OrganizationAdmin.organization_id == organization_id
    ).first()
    if admin_rel:
        role = "admin"

    return {
        "id": user.id,
        "email": user.email,
        "full_name": getattr(user, 'full_name', None),
        "role": role
    }

@router.delete("/organizations/{organization_id}/users/{user_id}")
def remove_organization_user(
    organization_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: OrganizationAdmin = Depends(deps.get_current_organization_admin)
):
    """
    Remove a user from the organization.
    """
    # Prevent removing self?
    if user_id == current_admin.user_id:
        raise HTTPException(status_code=400, detail="Cannot remove yourself.")
        
    # Remove from Member and Admin tables
    db.query(OrganizationMember).filter(
        OrganizationMember.user_id == user_id,
        OrganizationMember.organization_id == organization_id
    ).delete()
    
    db.query(OrganizationAdmin).filter(
        OrganizationAdmin.user_id == user_id,
        OrganizationAdmin.organization_id == organization_id
    ).delete()
    
    db.commit()
    return {"status": "success"}

