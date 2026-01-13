from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)

    members = relationship("OrganizationMember", back_populates="organization")
    admins = relationship("OrganizationAdmin", back_populates="organization")
    files = relationship("OrganizationFile", back_populates="organization")
    topics = relationship("OrganizationTopic", back_populates="organization")

class OrganizationMember(Base):
    __tablename__ = "organization_members"

    user_id = Column(Integer, ForeignKey('users.id'), primary_key=True)
    organization_id = Column(Integer, ForeignKey('organizations.id'), primary_key=True)

    organization = relationship("Organization", back_populates="members")
    user = relationship("User", back_populates="organization_memberships")

class OrganizationAdmin(Base):
    __tablename__ = "organization_admins"

    user_id = Column(Integer, ForeignKey('users.id'), primary_key=True)
    organization_id = Column(Integer, ForeignKey('organizations.id'), primary_key=True)

    organization = relationship("Organization", back_populates="admins")
    user = relationship("User", back_populates="organization_admin_memberships")

class OrganizationFile(Base):
    __tablename__ = "organization_files"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey('organizations.id'), nullable=False)
    name = Column(String, nullable=False)
    url = Column(String, nullable=False)
    file_type = Column(String, nullable=True) # pdf, docx, etc
    uploaded_at = Column(DateTime, default=func.now())

    organization = relationship("Organization", back_populates="files")

class OrganizationTopic(Base):
    __tablename__ = "organization_topics"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey('organizations.id'), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    image_url = Column(String, nullable=True) # Cover image
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())

    organization = relationship("Organization", back_populates="topics")
    modules = relationship("OrganizationTopicModule", back_populates="topic", cascade="all, delete-orphan")

class OrganizationTopicModule(Base):
    __tablename__ = "organization_topic_modules"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey('organization_topics.id'), nullable=False)
    title = Column(String, nullable=False)
    content = Column(String, nullable=True) # The educational content
    image_url = Column(String, nullable=True) # Segment specific image
    sort_order = Column(Integer, default=0)
    
    topic = relationship("OrganizationTopic", back_populates="modules")
