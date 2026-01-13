
from app.db.session import SessionLocal
from app.models.user import User
from app.models.organization import OrganizationMember, OrganizationAdmin

def check_users():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"Found {len(users)} users.")
        for u in users:
            print(f"User: {u.email} (ID: {u.id}, Role: {u.role})")
            print(f"  - Memberships: {len(u.organization_memberships)}")
            print(f"  - Adminships: {len(u.organization_admin_memberships)}")
            for m in u.organization_memberships:
                print(f"    -> Member of Org: {m.organization_id}")
    finally:
        db.close()

if __name__ == "__main__":
    check_users()
