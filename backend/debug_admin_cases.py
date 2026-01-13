import urllib.request
import json
import ssl
import sys
import os

sys.path.append("/app")
sys.path.append(os.getcwd())

from app.core.security import create_access_token
from app.db.session import SessionLocal
from app.models.user import User
from app.models.organization import Organization, OrganizationAdmin, OrganizationMember

API_URL = "http://localhost:8000"

def get_manual_token(email="admin@acme.com"):
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    if not user: return None
    return create_access_token(user_id=user.id, role=user.role)

def create_debug_data():
    db = SessionLocal()
    org = db.query(Organization).filter(Organization.id == 1).first()
    
    # Case A: ONLY Admin
    email_a = "debug_only_admin@test.com"
    user_a = db.query(User).filter(User.email == email_a).first()
    if user_a:
        db.query(OrganizationAdmin).filter(OrganizationAdmin.user_id == user_a.id).delete()
        db.query(OrganizationMember).filter(OrganizationMember.user_id == user_a.id).delete()
        db.delete(user_a)
    
    user_a = User(email=email_a, role="admin", is_active=True, hashed_password="hashed")
    db.add(user_a)
    db.commit()
    db.refresh(user_a)
    
    adm_a = OrganizationAdmin(user_id=user_a.id, organization_id=org.id)
    db.add(adm_a)
    
    # Case B: Member AND Admin
    email_b = "debug_member_admin@test.com"
    user_b = db.query(User).filter(User.email == email_b).first()
    if user_b:
        db.query(OrganizationAdmin).filter(OrganizationAdmin.user_id == user_b.id).delete()
        db.query(OrganizationMember).filter(OrganizationMember.user_id == user_b.id).delete()
        db.delete(user_b)
        
    user_b = User(email=email_b, role="admin", is_active=True, hashed_password="hashed")
    db.add(user_b)
    db.commit()
    db.refresh(user_b)
    
    mem_b = OrganizationMember(user_id=user_b.id, organization_id=org.id)
    db.add(mem_b)
    adm_b = OrganizationAdmin(user_id=user_b.id, organization_id=org.id)
    db.add(adm_b)
    
    db.commit()
    print("Debug Data Created.")

def verify_response(token):
    try:
        req = urllib.request.Request(f"{API_URL}/organizations/1", method="GET") # Org 1
        req.add_header("Authorization", f"Bearer {token}")
        
        context = ssl._create_unverified_context()
        with urllib.request.urlopen(req, context=context) as response:
            body = response.read().decode()
            data = json.loads(body)
            
            print(f"--- API Response Members ({len(data['members'])}) ---")
            for m in data['members']:
                print(f" >> {m['email']} | Role: {m['role']}")
                
            # Verify Case A
            found_a = next((m for m in data['members'] if m['email'] == "debug_only_admin@test.com"), None)
            if found_a:
                print(f"[CASE A - ONLY ADMIN] Found: {found_a['role'] == 'admin'}")
            else:
                print("[CASE A - ONLY ADMIN] NOT FOUND!")

            # Verify Case B
            found_b = next((m for m in data['members'] if m['email'] == "debug_member_admin@test.com"), None)
            if found_b:
                print(f"[CASE B - MEMBER+ADMIN] Found: {found_b['role'] == 'admin'}")
            else:
                print("[CASE B - MEMBER+ADMIN] NOT FOUND!")
                
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    create_debug_data()
    token = get_manual_token()
    if token:
        verify_response(token)
