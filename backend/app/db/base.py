from sqlalchemy.orm import declarative_base

Base = declarative_base()

# Import all models here so Alembic can detect them
from app.models.user import User  # noqa
from app.models.organization import Organization, OrganizationMember, OrganizationAdmin  # noqa
from app.models.super_admin import SuperAdminSecret  # noqa
