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

def get_manual_token(email="superadmin@test.com"):
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    if not user: return None
    return create_access_token(user_id=user.id, role=user.role)

def verify_endpoints(token):
    context = ssl._create_unverified_context()
    
    # 1. Check Organization Details
    print("\n--- Checking GET /organizations/1 (Company Details) ---")
    try:
        req = urllib.request.Request(f"{API_URL}/organizations/1", method="GET")
        req.add_header("Authorization", f"Bearer {token}")
        with urllib.request.urlopen(req, context=context) as response:
            data = json.loads(response.read().decode())
            admins = [m for m in data['members'] if m['role'] == 'admin']
            print(f"Found {len(admins)} admins in Org 1")
            for a in admins:
                print(f" - {a['email']} (ID: {a['id']})")
    except Exception as e:
        print(f"FAILED: {e}")

    # 2. Check All Admins List
    print("\n--- Checking GET /superadmin/users?role=admin (All Admins) ---")
    try:
        req = urllib.request.Request(f"{API_URL}/superadmin/users?role=admin", method="GET")
        req.add_header("Authorization", f"Bearer {token}")
        with urllib.request.urlopen(req, context=context) as response:
            data = json.loads(response.read().decode())
            print(f"Found {len(data)} total admins")
            for u in data:
                 print(f" - {u['email']} (ID: {u['id']}) | Orgs: {len(u.get('organizations', []))}")
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == "__main__":
    token = get_manual_token()
    if token:
        verify_endpoints(token)
