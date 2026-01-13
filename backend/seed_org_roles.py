
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User
from app.models.organization import Organization, OrganizationAdmin, OrganizationMember
from app.core.security import get_password_hash
import sys

def seed_data():
    db: Session = SessionLocal()
    try:
        print("--- Seeding Organization Roles ---")
        
        # 1. Create Organization
        org_name = "Acme Corp"
        org_slug = "acme-corp"
        org = db.query(Organization).filter(Organization.slug == org_slug).first()
        if not org:
            print(f"Creating Organization: {org_name}")
            org = Organization(name=org_name, slug=org_slug)
            db.add(org)
            db.commit()
            db.refresh(org)
        else:
            print(f"Organization {org_name} already exists")

        # Define Users
        users_to_seed = [
            # Super Admin
            {
                "email": "superadmin@noleij.ai",
                "password": "password123",
                "role": "super_admin",
                "is_superuser": True
            },
            # Organization Admin
            {
                "email": "admin@acme.com",
                "password": "password123",
                "role": "admin", # Changed from user to admin for clarity
                "org_role": "admin"
            },
            # Organization Member
            {
                "email": "user@acme.com",
                "password": "password123",
                "role": "user",
                "org_role": "member"
            },
            # Public User
            {
                "email": "public@gmail.com",
                "password": "password123",
                "role": "user",
                "org_role": None
            }
        ]

        for u_data in users_to_seed:
            user = db.query(User).filter(User.email == u_data["email"]).first()
            
            # Create User if not exists
            if not user:
                print(f"Creating User: {u_data['email']}")
                user = User(
                    email=u_data["email"],
                    hashed_password=get_password_hash(u_data["password"]),
                    role=u_data["role"],
                    is_active=True
                )
                # Handle superuser flag if present (some User models might not have it yet based on alembic, but let's try)
                if u_data.get("is_superuser"):
                     # Assuming logic handled elsewhere or column exists
                     pass 
                
                db.add(user)
                db.commit()
                db.refresh(user)
                db.add(user)
                db.commit()
                db.refresh(user)
            else:
                 print(f"User {u_data['email']} already exists. Updating role...")
                 user.role = u_data["role"]
                 if u_data.get("is_superuser"):
                     # user.is_superuser = True # If model supports it
                     pass
                 db.add(user)
                 db.commit()
                 db.refresh(user)
            
            # Link to Organization
            if u_data.get("org_role") == "admin":
                if not db.query(OrganizationAdmin).filter_by(user_id=user.id, organization_id=org.id).first():
                    print(f"Linking {user.email} as Admin to {org.name}")
                    link = OrganizationAdmin(user_id=user.id, organization_id=org.id)
                    db.add(link)
            
            elif u_data.get("org_role") == "member":
                if not db.query(OrganizationMember).filter_by(user_id=user.id, organization_id=org.id).first():
                    print(f"Linking {user.email} as Member to {org.name}")
                    link = OrganizationMember(user_id=user.id, organization_id=org.id)
                    db.add(link)
        
        db.commit()
        print("--- Seeding Complete ---")

    except Exception as e:
        print(f"Error seeding data: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
