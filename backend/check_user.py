from app.db.session import SessionLocal
from app.models.user import User
import sys

db = SessionLocal()
email = "roxnew2113@gmail.com"
user = db.query(User).filter(User.email == email).first()

if user:
    print(f"FOUND: ID={user.id}, Email={user.email}, Role={user.role}")
else:
    print("NOT FOUND")
db.close()
