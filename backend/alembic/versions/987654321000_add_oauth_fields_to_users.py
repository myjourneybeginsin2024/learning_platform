"""add oauth fields to users

Revision ID: 987654321000
Revises: 1725c382c59e
Create Date: 2025-12-26 03:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '987654321000'
down_revision: Union[str, None] = '1725c382c59e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Make hashed_password nullable to support OAuth-only users
    op.alter_column('users', 'hashed_password', nullable=True)
    
    # Add OAuth-specific columns
    op.add_column('users', sa.Column('google_id', sa.String(), nullable=True))
    op.add_column('users', sa.Column('microsoft_id', sa.String(), nullable=True))
    op.add_column('users', sa.Column('avatar_url', sa.String(), nullable=True))
    
    # Create indexes for the new columns
    op.create_index(op.f('ix_users_google_id'), 'users', ['google_id'], unique=True)
    op.create_index(op.f('ix_users_microsoft_id'), 'users', ['microsoft_id'], unique=True)


def downgrade() -> None:
    # Remove indexes
    op.drop_index(op.f('ix_users_microsoft_id'), table_name='users')
    op.drop_index(op.f('ix_users_google_id'), table_name='users')
    
    # Remove OAuth-specific columns
    op.drop_column('users', 'avatar_url')
    op.drop_column('users', 'microsoft_id')
    op.drop_column('users', 'google_id')
    
    # Make hashed_password non-nullable again
    op.alter_column('users', 'hashed_password', nullable=False)
