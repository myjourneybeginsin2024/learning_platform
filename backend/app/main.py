from fastapi import FastAPI
from app.api import auth, health, users, admin
from app.api import feed

app = FastAPI()
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(feed.router)
app.include_router(admin.router)
