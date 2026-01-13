from app.db.session import SessionLocal
from app.models.user import User
from app.models.organization import Organization, OrganizationAdmin
from app.api.superadmin import UserOut, OrganizationMini

db = SessionLocal()

print("--- Debugging User Serialization ---")
admins = db.query(User).filter(User.role == 'admin').all()
print(f"Found {len(admins)} admins.")

for user in admins:
    print(f"Processing Admin: {user.email} (ID: {user.id})")
    try:
        user_data = UserOut.model_validate(user)
        # Replicating logic from superadmin.py
        orgs = []
        for membership in user.organization_admin_memberships:
            if membership.organization:
                 print(f"  - Found Org Link: {membership.organization.name}")
                 orgs.append(OrganizationMini(id=membership.organization.id, name=membership.organization.name))
        user_data.organizations = orgs
        print(f"  > Serialized OK. Orgs: {len(user_data.organizations)}")
    except Exception as e:
        print(f"  ! Serialization FAILED: {e}")

print("--- End Debug ---")
