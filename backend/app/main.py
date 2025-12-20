from fastapi import FastAPI
from app.api import auth, health, users
from app.api import admin

app = FastAPI()
app.include_router(auth.router)      # auth.py uses prefix="/auth"
app.include_router(health.router)    # health.py uses no prefix
app.include_router(users.router)
app.include_router(admin.router)
