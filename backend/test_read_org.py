import urllib.request
import urllib.parse
import json
import ssl
import sys
import os

# Add /app to path just in case
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
    
    # Generate token
    token = create_access_token(user_id=user.id, role=user.role)
    print(f"Generated token for user {user.id} ({user.role})")
    return token

def test_read_org(token, org_id):
    try:
        req = urllib.request.Request(f"{API_URL}/organizations/{org_id}", method="GET")
        req.add_header("Authorization", f"Bearer {token}")
        
        context = ssl._create_unverified_context()
        with urllib.request.urlopen(req, context=context) as response:
            print(f"Status Code: {response.status}")
            body = response.read().decode()
            data = json.loads(body)
            print("Response JSON (Members):")
            print(json.dumps(data.get("members", []), indent=2))
            
            # Check if our admin 'admin@acme.com' is in there
            found = any(m['email'] == 'admin@acme.com' for m in data.get('members', []))
            print(f"Admin found in members list: {found}")
            
    except Exception as e:
        print(f"Request failed: {e}") 
        if hasattr(e, 'read'):
             print(e.read().decode())

if __name__ == "__main__":
    token = get_manual_token()
    if token:
        test_read_org(token, 1) # Acme Corp
