from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

# --- Files (Knowledge Base) ---

class FileCreate(BaseModel):
    name: str
    url: str 
    file_type: Optional[str] = "doc"

class FileOut(BaseModel):
    id: int
    name: str
    url: str
    file_type: Optional[str]
    uploaded_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Modules (Curriculum) ---

class ModuleCreate(BaseModel):
    title: str
    content: Optional[str] = None
    image_url: Optional[str] = None
    sort_order: int = 0

class ModuleOut(BaseModel):
    id: int
    title: str
    content: Optional[str]
    image_url: Optional[str]
    sort_order: int
    model_config = ConfigDict(from_attributes=True)

# --- Topics (Curriculum) ---

class TopicCreate(BaseModel):
    title: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_active: bool = True
    modules: List[ModuleCreate] = []

class TopicOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    image_url: Optional[str]
    is_active: bool
    created_at: datetime
    modules: List[ModuleOut] = []
    model_config = ConfigDict(from_attributes=True)

# --- Stats ---

class OrgStats(BaseModel):
    total_users: int
    total_files: int
    total_topics: int
    active_topics: int

# --- Users ---

class OrgUserOut(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    role: str # 'admin' or 'member'
    model_config = ConfigDict(from_attributes=True)

class OrgUserCreate(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None
    role: str = "member"

class OrgUserUpdate(BaseModel):
    full_name: Optional[str] = None
    password: Optional[str] = None
