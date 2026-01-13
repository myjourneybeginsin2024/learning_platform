
from app.db.session import SessionLocal
from app.models.organization import OrganizationAdmin, OrganizationMember

def fix_admin1():
    db = SessionLocal()
    try:
        # Link User 22 (admincompany1) to Org 1
        uid = 22
        org_id = 1
        
        # Check if exists
        exists_adm = db.query(OrganizationAdmin).filter_by(user_id=uid, organization_id=org_id).first()
        if not exists_adm:
            db.add(OrganizationAdmin(user_id=uid, organization_id=org_id))
            print("Added Adminship")
            
        exists_mem = db.query(OrganizationMember).filter_by(user_id=uid, organization_id=org_id).first()
        if not exists_mem:
            db.add(OrganizationMember(user_id=uid, organization_id=org_id))
            print("Added Membership")
            
        db.commit()
        print("Data fixed for admincompany1")
    finally:
        db.close()

if __name__ == "__main__":
    fix_admin1()
