from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from app.api import auth, health, users, admin
from app.api import feed

app = FastAPI()

# Add Session middleware
app.add_middleware(
    SessionMiddleware,
    secret_key="ciLagOHVWlvfQpre2dj5UmxByY6uqz7F",  # Use your JWT secret or a separate session secret
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(feed.router)
app.include_router(admin.router)
