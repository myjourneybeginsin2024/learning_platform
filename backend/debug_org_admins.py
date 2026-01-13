from app.db.session import SessionLocal
from app.models.organization import Organization, OrganizationAdmin
from app.models.user import User

db = SessionLocal()

print("--- Debugging Organization Admins ---")
orgs = db.query(Organization).all()
for org in orgs:
    print(f"Organization: {org.name} (ID: {org.id})")
    admins = db.query(OrganizationAdmin).filter(OrganizationAdmin.organization_id == org.id).all()
    print(f"  Found {len(admins)} admins in OrganizationAdmin table.")
    for admin in admins:
        user = db.query(User).filter(User.id == admin.user_id).first()
        print(f"    - User ID: {admin.user_id}, Email: {user.email if user else 'Unknown'}")
        
    print(f"  org.admins relationship count: {len(org.admins)}")

print("--- End Debug ---")
