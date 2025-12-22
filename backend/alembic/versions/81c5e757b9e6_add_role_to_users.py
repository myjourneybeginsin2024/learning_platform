"""add role to users

Revision ID: 81c5e757b9e6
Revises: <YOUR_PREVIOUS_REVISION_ID>
Create Date: 2025-12-19 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# IMPORTANT: Replace 'YOUR_PREVIOUS_REVISION_ID' with actual ID from alembic_version table
# Get it via: docker exec postgres_prod psql -U learning_user -d learning_platform -c "SELECT * FROM alembic_version;"

revision = '81c5e757b9e6'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Column already exists (you added it via SQL), so this is a no-op
    pass

def downgrade():
    # Optional: drop column if needed
    op.drop_column('users', 'role')
