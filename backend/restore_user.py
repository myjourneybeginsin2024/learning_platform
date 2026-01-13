
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User
from app.models.organization import Organization, OrganizationAdmin
from app.core.security import get_password_hash
import sys

def restore_user():
    db: Session = SessionLocal()
    email = "trisna2@gmail.com"
    password = "password123"
    
    try:
        print(f"--- Restoring User: {email} ---")
        
        # 1. Get Organization
        org = db.query(Organization).filter(Organization.slug == "acme-corp").first()
        if not org:
            print("Creating fallback organization 'Acme Corp'...")
            org = Organization(name="Acme Corp", slug="acme-corp")
            db.add(org)
            db.commit()
            db.refresh(org)

        # 2. Check/Create User
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"Creating new user {email}...")
            user = User(
                email=email,
                hashed_password=get_password_hash(password),
                role="admin", # Give them admin rights
                is_active=True,
                full_name="Trisna"
            )
            db.add(user)
        else:
            print(f"User {email} found. Resetting password...")
            user.hashed_password = get_password_hash(password)
            user.role = "admin"
            user.full_name = "Trisna"
            db.add(user)
        
        db.commit()
        db.refresh(user)
        
        # 3. Link to Organization
        link = db.query(OrganizationAdmin).filter_by(user_id=user.id, organization_id=org.id).first()
        if not link:
            print(f"Linking {email} as Admin to {org.name}...")
            link = OrganizationAdmin(user_id=user.id, organization_id=org.id)
            db.add(link)
            db.commit()
        else:
            print(f"User is already Admin of {org.name}")

        print("--- Restore Complete ---")
        print(f"Login: {email}")
        print(f"Pass:  {password}")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    restore_user()
