from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from app.core.config import settings

app = FastAPI()

app.add_middleware(
    SessionMiddleware,
    secret_key="ciLagOHVWlvfQpre2dj5UmxByY6uqz7F",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routers AFTER app is created
from app.api import auth, health, users, admin, feed

app.include_router(health.router)
app.include_router(auth.router, prefix="/auth")
app.include_router(users.router)
app.include_router(feed.router)
app.include_router(admin.router)
