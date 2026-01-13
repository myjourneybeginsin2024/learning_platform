from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User

def check_roles():
    db: Session = SessionLocal()
    emails = [
        "superadmin@noleij.ai",
        "admin@acme.com",
        "user@acme.com",
        "public@gmail.com"
    ]
    
    print(f"{'Email':<30} | {'Role':<15} | {'Org Memberships'}")
    print("-" * 75)
    
    for email in emails:
        user = db.query(User).filter(User.email == email).first()
        if user:
            orgs = []
            if hasattr(user, 'organization_memberships'):
                for m in user.organization_memberships:
                    orgs.append(f"{m.organization.name} (Member)")
            if hasattr(user, 'organization_admin_memberships'):
                for a in user.organization_admin_memberships:
                    orgs.append(f"{a.organization.name} (Admin)")
            
            org_str = ", ".join(orgs) if orgs else "None"
            print(f"{email:<30} | {user.role:<15} | {org_str}")
        else:
            print(f"{email:<30} | {'NOT FOUND':<15} | -")

    db.close()

if __name__ == "__main__":
    check_roles()
