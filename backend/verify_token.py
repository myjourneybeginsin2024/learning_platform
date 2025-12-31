from app.core.security import get_current_user
from app.core.config import settings
from jose import jwt
import sys

# The token captured from the failing URL
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5Iiwicm9sZSI6InVzZXIiLCJleHAiOjE3NjcwNzc5MzksImlhdCI6MTc2NzA3NDMzOX0.YMQ7_EyvrlMrhUk-4hLBbuxcFm-XMH4NFuNJEW27t4U"

print(f"Testing Token: {token}")
print(f"Using Secret: {settings.JWT_SECRET_KEY}")

try:
    payload = jwt.decode(
        token,
        settings.JWT_SECRET_KEY,
        algorithms=["HS256"],
    )
    print("SUCCESS: Token decoded.")
    print(f"Payload: {payload}")
except Exception as e:
    print(f"FAILURE: {e}")
