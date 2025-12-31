from app.core.security import create_access_token
from app.core.config import settings
import sys

# Generate a fresh token for superadmin (User ID 1 in seed)
token = create_access_token(user_id=1, role="super admin")
print(f"FRESH_TOKEN: {token}")
