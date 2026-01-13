from app.db.session import SessionLocal
from app.models.user import User

db = SessionLocal()
print("--- Finding Super Admins ---")
users = db.query(User).filter((User.role == 'super_admin') | (User.role == 'super_admin')).all() # Check logic
# Actually, let's just dump all users roles
all_users = db.query(User).all()
for u in all_users:
    print(f"User: {u.email} | Role: {u.role} | Superuser: {getattr(u, 'is_superuser', False)}")
