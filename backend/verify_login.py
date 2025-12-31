import sys
import os
# Ensure we can import from app
sys.path.append(os.getcwd())

from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash, verify_password
from app.core.config import settings

print(f"DEBUG: Connecting to DB -> {settings.DATABASE_URL}")

def verify_and_fix(email, password):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"User {email} NOT FOUND!")
            return

        print(f"User: {user.email}")
        print(f"Current Hash: {user.hashed_password}")
        
        is_valid = verify_password(password, user.hashed_password)
        print(f"Verify '{password}': {'SUCCESS' if is_valid else 'FAILED'}")

        if not is_valid:
            print("Attempting to FIX hash...")
            new_hash = get_password_hash(password)
            user.hashed_password = new_hash
            db.commit()
            print(f"Hash Updated: {new_hash}")
            
            # Verify again
            is_valid_now = verify_password(password, new_hash)
            print(f"Verify New Hash: {'SUCCESS' if is_valid_now else 'FAILED'}")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    verify_and_fix("superadmin@test.com", "password")
