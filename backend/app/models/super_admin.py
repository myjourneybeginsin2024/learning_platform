from sqlalchemy import Column, Integer, String, Boolean
from app.db.base import Base

class SuperAdminSecret(Base):
    __tablename__ = "super_admin_secrets"

    id = Column(Integer, primary_key=True, index=True)
    secret_key = Column(String, unique=True, index=True, nullable=False)
    is_active = Column(Boolean, default=True)
    description = Column(String, nullable=True)
