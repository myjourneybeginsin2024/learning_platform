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

API_URL = "http://localhost:8000"

def get_manual_token(email="admin@acme.com"):
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        print(f"User {email} not found")
        return None
    token = create_access_token(user_id=user.id, role=user.role)
    return token

def check_org_response(token, org_id):
    try:
        req = urllib.request.Request(f"{API_URL}/organizations/{org_id}", method="GET")
        req.add_header("Authorization", f"Bearer {token}")
        
        context = ssl._create_unverified_context()
        with urllib.request.urlopen(req, context=context) as response:
            print(f"API Status: {response.status}")
            body = response.read().decode()
            data = json.loads(body)
            
            print(f"--- Org: {data.get('name')} ---")
            members = data.get("members", [])
            print(f"Member count: {len(members)}")
            for m in members:
                print(f" - {m.get('email')} [{m.get('role')}] (ID: {m.get('id')})")
                
            admins = [m for m in members if m.get('role') == 'admin']
            if not admins:
                print("!!! NO ADMINS FOUND IN MEMBER LIST !!!")
            else:
                print(f"Found {len(admins)} admins in response.")

    except Exception as e:
        print(f"API Request Failed: {e}")
        if hasattr(e, 'read'):
             print(e.read().decode())

if __name__ == "__main__":
    token = get_manual_token() # Uses admin@acme.com (Super Admin or Org Admin)
    # Check Org 1 (Acme) which we know has an admin
    if token:
        check_org_response(token, 1)
