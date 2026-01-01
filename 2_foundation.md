# LMS Phase 1: Foundation to Frontend Integration
**Documentation Period:** Sprint 0 — Foundation Setup to Sprint 2 — Step 1
**Reference:** `Learning Platform Initial Plan Guidance.txt`
**Status:** ✅ Completed & Verified

---

## 🏗️ Sprint 0 — Foundation Setup
**Goal:** Establish the infrastructure, operating system environment, and project skeleton required to support a production-grade, AI-powered learning platform on Alibaba Cloud ECS (2 vCPU, 8GB RAM).

### 1.1 Infrastructure & Environment
We established a Docker-based architecture to ensure consistency between development and production.

**Components:**
*   **OS:** Ubuntu (simulated via Docker for dev)
*   **Containerization:** Docker + Docker Compose
*   **Reverse Proxy:** Nginx (handling HTTP/HTTPS routing)
*   **Database:** PostgreSQL 15+
*   **Cache/Queue:** Redis (Provisioned but conceptually parked for Sprint 2)

**Implementation: `docker-compose.prod.yml`**
```yaml
services:
  backend:
    build:
      context: ../..
      dockerfile: infrastructure/docker/Dockerfile.backend
    container_name: backend_prod
    env_file:
      - ../../backend/.env
    ports:
      - "8000:8000"
    depends_on:
      - db
    restart: unless-stopped

  frontend:
    build:
      context: ../..
      dockerfile: infrastructure/docker/Dockerfile.frontend
    container_name: frontend_prod
    ports:
      - "3000:3000"
    restart: unless-stopped

  db:
    image: postgres:16
    container_name: postgres_prod
    environment:
      POSTGRES_DB: learning_platform
      POSTGRES_USER: learning_user
      POSTGRES_PASSWORD: MulaiBeraksi2024
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

**Commands Executed:**
```bash
# Infrastructure Setup
cd ~/apps/infrastructure/docker
# Start the production-ready stack
docker compose -f docker-compose.prod.yml up -d
```

**Verification:**
*   `curl http://localhost` → Returns Nginx default page (Success).
*   `docker ps` → Shows containers for `nginx`, `backend`, `db`.

### 1.2 Project Skeleton (Backend)
Created a modular FastAPI architecture designed for maintainability and future microservice decoupling.

**Structure:**
*   `/app/api` → Endpoints (Auth, Feed, Users)
*   `/app/core` → Config & Security (JWT, settings)
*   `/app/models` → SQLModel/SQLAlchemy definitions
*   `/app/services` → Business logic isolation

**Implementation: `backend/app/main.py`**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from app.api import auth, health, users, admin
from app.api import feed

app = FastAPI()

# Add Session middleware for OAuth support
app.add_middleware(
    SessionMiddleware,
    secret_key="ciLagOHVWlvfQpre2dj5UmxByY6uqz7F",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(feed.router)
app.include_router(admin.router)
```

---

## 🛠️ Sprint 1 — Backend Core & Database
**Goal:** Implement the core data models, database migrations, and authentication system.

### 2.1 Database Schema & Migrations
We utilized **Alembic** for schema migrations to ensure robust version control of the database structure.

**Schema Definitions:**

*   **`users` table** (`app/models/user.py`):
    ```python
    class User(Base):
        __tablename__ = "users"
        id = Column(Integer, primary_key=True, index=True)
        email = Column(String, unique=True, index=True, nullable=False)
        hashed_password = Column(String, nullable=False)
        role = Column(String, default="user", nullable=False)
        is_active = Column(Boolean, default=True)
    ```

*   **`lessons` table** (`app/models/lesson.py`):
    ```python
    class Lesson(Base):
        __tablename__ = "lessons"
        id = Column(Integer, primary_key=True, index=True)
        title = Column(String(255), nullable=False)
        content = Column(Text, nullable=False)
        type = Column(String(50), nullable=False)  # text | quiz | audio
    ```

*   **`feed_items` table** (`app/models/feed_item.py`):
    ```python
    class FeedItem(Base):
        __tablename__ = "feed_items"
        id = Column(Integer, primary_key=True, index=True)
        lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
        order = Column(Integer, nullable=False)
        created_at = Column(DateTime, server_default=func.now())
        content_type = Column(String(50))
    ```

*   **`user_progress` table** (`app/models/user_progress.py`):
    ```python
    class UserProgress(Base):
        __tablename__ = "user_progress"
        id = Column(Integer, primary_key=True, index=True)
        user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
        lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
        completed = Column(Boolean, default=False)
    ```

**Creation Commands:**
```bash
# Initialize Alembic
docker compose exec backend alembic init alembic

# Generate migration script (after defining models)
docker compose exec backend alembic revision --autogenerate -m "Initial tables"

# Apply schema
docker compose exec backend alembic upgrade head
```

---

## 🐞 Issues, Bugs, and Solutions

| Issue Category | Description | Solution Implemented |
| :--- | :--- | :--- |
| **Startup / Docker** | **Race Condition:** Backend container failing to connect because `db` container wasn't ready accepting connections yet. | Introduced a connection retry loop in the startup command/script to wait for Postgres availability. |
| **Database** | **Alembic Env Check:** Alembic was not detecting `sqlalchemy.url` from environment variables. | Updated `alembic.ini` and `env.py` to explicitly read `DATABASE_URL` from `os.getenv` instead of hardcoded strings. |
| **Frontend/Auth** | **Hydration Error:** Next.js hydration mismatch because the auth state was different on server vs client. | Ensured `AuthProvider` only renders children or checks token after `useEffect` (client-side) mounting using an `initialized` state flag. |
| **CORS** | **Cross-Origin Block:** API requests from `localhost:3000` to `localhost:8000` blocked. | Configured `CORSMiddleware` in `main.py` to explicitly allow `http://localhost:3000`. |


### 2.2 Authentication System
Implemented a secure, stateless JWT (JSON Web Token) authentication flow, including OAuth support for Google/Microsoft.

**Implementation: `backend/app/api/auth.py`**
```python
@router.post("/register")
def register(request: AuthRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == request.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=request.email,
        hashed_password=hash_password(request.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "email": user.email}

@router.post("/login")
def login(request: AuthRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    token = create_access_token(user.id, user.role)
    return {"access_token": token, "token_type": "bearer"}
```

**Verification:**
```bash
# 1. Register User
curl -X POST https://noleij.com/api/auth/register -d '...'

# 2. Login & Get Token
TOKEN=$(curl -X POST https://noleij.com/api/auth/login ... | jq -r .access_token)

# 3. Verify Access
curl -H "Authorization: Bearer $TOKEN" https://noleij.com/api/users/me
```

---

## 🚀 Sprint 2 — Step 1: Frontend Integration
**Goal:** Connect the Next.js frontend to the robust backend API and establish the authentication state management.

### 3.1 Next.js App Router Setup
Transited to the modern Next.js 14+ App Router structure.

**Tech Stack:**
*   **Framework:** Next.js (TypeScript)
*   **Styling:** TailwindCSS
*   **State:** React Context API (`AuthContext`)

### 3.2 Authentication Wiring
We built the bridge between the Frontend and Backend using a global AuthContext.

**Implementation: `frontend/context/AuthContext.tsx`**
```typescript
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for token immediately when component mounts
    const token = localStorage.getItem('token');
    if (token) {
      getCurrentUser(token)
        .then((fetchedUser) => {
          setUser({
          id: fetchedUser.id,
          email: fetchedUser.email,
          role: fetchedUser.role,
          });
        })
        .catch(() => localStorage.removeItem("token"));
    }
  }, []);

  async function loginUser(email: string, password: string) {
    const data = await apiLogin(email, password);
    localStorage.setItem("token", data.access_token); // Persist token
    const user = await getCurrentUser(data.access_token);
    setUser({
     id: user.id,
     email: user.email,
     role: user.role,
    });
  }
  // ...
}
```

**Implementation: `frontend/app/login/page.tsx`**
```typescript
export default function LoginPage() {
  const { loginUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await loginUser(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {/* Form inputs... */}
          </form>
      </div>
    </ProtectedRoute>
  );
}
```

**Current Status (Sprint 2 Step 1):**
*   ✅ Users can log in via UI.
*   ✅ Token is stored and persists on refresh.
*   ✅ Protected routes active.

---

## 📝 Summary of Current State
| Component | Status | Notes |
| :--- | :--- | :--- |
| **Infrastructure** | 🟢 Stable | 2 vCPU optimization verified |
| **Backend API** | 🟢 Stable | Auth & Feed endpoints ready |
| **Database** | 🟢 Stable | Tables created & migrated |
| **Frontend Auth** | 🟢 Stable | Complete Login flow |
| **Frontend Feed** | 🔴 Pending | Next step in Sprint 2 |
| **AI Integration** | 🔴 Pending | Next step in Sprint 2 |

**Next Immediate Steps:**
1.  Build the **Feed UI** (Vertical scroll component).
2.  Implement **Content Ingestion** (S3/OSS upload).
