
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash
import sys

def create_users():
    db: Session = SessionLocal()
    try:
        users = [
            {
                "email": "superadmin@example.com",
                "password": "superadminpassword",
                "role": "super admin"
            },
            {
                "email": "admin@example.com",
                "password": "adminpassword",
                "role": "admin"
            },
            {
                "email": "user@example.com",
                "password": "userpassword",
                "role": "user"
            }
        ]

        print("--- Seeding Cloud Users ---")
        for u in users:
            existing_user = db.query(User).filter(User.email == u["email"]).first()
            if not existing_user:
                print(f"Creating {u['role']}: {u['email']}")
                db_user = User(
                    email=u["email"],
                    hashed_password=get_password_hash(u["password"]),
                    role=u["role"],
                    is_active=True
                )
                db.add(db_user)
            else:
                print(f"Skipping {u['email']} (Already exists)")
        
        db.commit()
        print("--- Seeding Complete ---")
    
    except Exception as e:
        print(f"Error seeding users: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_users()
