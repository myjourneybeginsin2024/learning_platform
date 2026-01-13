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

def get_manual_token(email="superadmin@test.com"):
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    if not user: return None
    return create_access_token(user_id=user.id, role=user.role)

def test_delete_flow():
    db = SessionLocal()
    org = db.query(Organization).first()
    
    # 1. Create Dummy User to Delete
    email = "todelete@test.com"
    user = db.query(User).filter(User.email == email).first()
    if user:
        db.query(OrganizationAdmin).filter(OrganizationAdmin.user_id == user.id).delete()
        db.delete(user)
        db.commit()
        
    user = User(email=email, role="admin", is_active=True, hashed_password="hashed")
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Assign to Org
    adm = OrganizationAdmin(user_id=user.id, organization_id=org.id)
    db.add(adm)
    db.commit()
    print(f"Created user {user.id} assigned to org {org.id}")

    # 2. Call DELETE API
    token = get_manual_token()
    if not token:
        print("Failed to get token")
        return

    try:
        url = f"{API_URL}/organizations/{org.id}/users/{user.id}"
        print(f"Calling DELETE {url}")
        req = urllib.request.Request(url, method="DELETE")
        req.add_header("Authorization", f"Bearer {token}")
        
        context = ssl._create_unverified_context()
        with urllib.request.urlopen(req, context=context) as response:
            print(f"Response Code: {response.status}")
            print(f"Response Body: {response.read().decode()}")
            
        # 3. Verify DB
        exists = db.query(OrganizationAdmin).filter(
            OrganizationAdmin.user_id == user.id, 
            OrganizationAdmin.organization_id == org.id
        ).first()
        
        if not exists:
            print("SUCCESS: User removed from organization in DB.")
        else:
            print("FAILURE: User still exists in OrganizationAdmin table.")

    except Exception as e:
        print(f"API Request Failed: {e}")

if __name__ == "__main__":
    test_delete_flow()
