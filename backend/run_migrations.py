import os
import sys
from pathlib import Path

# Add the parent directory to sys.path so we can import app modules
sys.path.append(str(Path(__file__).parent))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from alembic.config import Config
from alembic import command
from app.db.base import Base
from app.core.config import settings

def run_migrations():
    # Use the database URL from settings
    database_url = os.environ.get('DATABASE_URL', settings.DATABASE_URL)
    print(f"Using database URL: {database_url}")
    
    # Create alembic config
    alembic_cfg = Config("alembic.ini")
    alembic_cfg.set_main_option('sqlalchemy.url', database_url)
    
    # Run the migration
    command.upgrade(alembic_cfg, "head")
    print("Migrations completed successfully!")

if __name__ == "__main__":
    run_migrations()
