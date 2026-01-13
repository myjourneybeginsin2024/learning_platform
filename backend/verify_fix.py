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

def create_test_data():
    db = SessionLocal()
    org = db.query(Organization).filter(Organization.id == 1).first()
    test_user_email = "verified_admin@test.com"
    
    # Clean up previous runs
    user = db.query(User).filter(User.email == test_user_email).first()
    if user:
        db.query(OrganizationAdmin).filter(OrganizationAdmin.user_id == user.id).delete()
        db.query(OrganizationMember).filter(OrganizationMember.user_id == user.id).delete()
        db.delete(user)
        db.commit()

    # Create User
    user = User(email=test_user_email, role="admin", is_active=True, hashed_password="hashedpassword")
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # 1. Add as MEMBER (to simulate conflict)
    mem = OrganizationMember(user_id=user.id, organization_id=org.id)
    db.add(mem)
    db.commit()
    
    # 2. Add as ADMIN (the goal)
    adm = OrganizationAdmin(user_id=user.id, organization_id=org.id)
    db.add(adm)
    db.commit()
    
    print(f"Created Test User: {user.email} (ID: {user.id}) as Member AND Admin of Org 1")
    return user.id

def verify_response(token):
    try:
        req = urllib.request.Request(f"{API_URL}/organizations/1", method="GET") # Org 1
        req.add_header("Authorization", f"Bearer {token}")
        
        context = ssl._create_unverified_context()
        with urllib.request.urlopen(req, context=context) as response:
            body = response.read().decode()
            data = json.loads(body)
            
            # Find verified_admin@test.com
            found = next((m for m in data['members'] if m['email'] == "verified_admin@test.com"), None)
            
            if found:
                print(f"User FOUND in response: {found}")
                if found['role'] == 'admin':
                    print("SUCCESS: Role is correctly set to 'admin' despite being a member.")
                else:
                    print(f"FAILURE: Role is '{found['role']}', expected 'admin'.")
            else:
                print("FAILURE: User NOT FOUND in response.")
                
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    create_test_data()
    token = get_manual_token()
    if token:
        verify_response(token)
