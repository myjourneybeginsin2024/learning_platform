```md
# PART 1: COMPREHENSIVE DEVELOPMENT MANUAL - LMS PHASE 2

This is the first part of the complete extraction and enhancement of the `lms-phase-2.md` document. This response covers the initial project structure and development steps 1 through 3 in full detail, ensuring no code truncation.

---

## TABLE OF CONTENTS (Full Document Structure)

1. **Project Overview**
2. **Sequential Step-by-Step Development Process**
   * Step 1: Initial Setup and Environment Configuration
   * Step 2: Database Schema and Migration Setup
   * Step 3: Backend API Development
   * Step 4: Frontend Authentication UI Development
   * Step 5: OAuth Integration Implementation
   * Step 6: Route Protection Implementation
   * Step 7: Tailwind CSS Configuration and Styling
   * Step 8: Final Testing and Validation
3. **Complete Code Implementation Details**
   * **Backend Implementation**: User Model, Authentication API, and Main Application.
   * **Frontend Implementation**: Landing Page, Login, Register, Dashboard, AuthContext, Protected Route, and Middleware.
   * **Styling & Config**: Tailwind configuration, Global CSS, and `package.json`.
4. **Detailed Local-to-Cloud Development Setup Guide** (Windows 11 to Ubuntu).
5. **Issue & Solution Log** (Summarized troubleshooting steps).
6. **Finalizing GitHub Push & Cloud Sync Strategy**.

---

## 1. Project Overview
This document summarizes the complete development process for the learning platform project, following an **Auth-First development strategy**. This strategy prioritizes building a robust federated authentication layer before advancing the learning feed features. 

The implementation includes:
* OAuth 2.0/OpenID Connect with Google and Microsoft.
* Account linking (merging OAuth profiles with existing emails).
* Enhanced Role-Based Access Control (RBAC).
* Secure management of sensitive user data.

---

## 2. Sequential Step-by-Step Development Process

### Step 1: Initial Setup and Environment Configuration
* **Timing**: Start of Phase 2.
* **Preparation Requirements**:
  * Docker Desktop must be installed and active.
  * Local PostgreSQL must be accessible.
  * Git, Node.js, and npm environments must be verified.
* **Execution Commands**:
  ```powershell
  # Initialize and sync repository
  git init
  git pull
  cd c:\TRISNA\learning-platform

```

* **Configuration Steps**:
* Update environment variables in `.envs/local/.env`.
* Configure database connection settings to target `localhost` (replacing the 'db' container hostname for local work).
* Update `alembic.ini` to point to the local PostgreSQL instance.



### Step 2: Database Schema and Migration Setup

* **Timing**: Following initial setup.
* **Code Generated**:
* Updated `backend/app/models/user.py` to include OAuth fields: `google_id`, `microsoft_id`, and `avatar_url`.
* Modified the `hashed_password` field to be **nullable** to support users who sign up exclusively via OAuth providers.
* Created new Alembic migration versions in `backend/alembic/versions/`.


* **Execution Commands**:
```bash
# Reset services for schema updates
docker-compose -f infrastructure/local/docker-compose.yml down
docker-compose -f infrastructure/local/docker-compose.yml up -d db

# Manual Database and User Initialization
docker exec -it postgres_local psql -U postgres
CREATE DATABASE learning_platform;
CREATE USER learning_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE learning_platform TO learning_user;

# Start backend and apply migrations
docker-compose -f infrastructure/local/docker-compose.yml up -d backend

```


* **Implementation Note**: The schema was verified to ensure that tables were created properly with the new federated identity columns.

### Step 3: Backend API Development

* **Timing**: Following database migration.
* **Key Code Features**:
* Integrated **Authlib** into `backend/app/api/auth.py` for Google and Microsoft OAuth support.
* Added `SessionMiddleware` to handle the required session state for OAuth redirects.
* Implemented JWT token creation (Access/Refresh tokens) and validation logic.
* Configured **CORS Middleware** to allow requests from the local frontend (port 3000).


* **Execution Commands**:
```bash
# Rebuild and refresh the backend service
docker-compose -f infrastructure/local/docker-compose.yml up -d --build backend

```


* **Implementation Details**:
* Created secure `/auth/google` and `/auth/microsoft` endpoints.
* Developed callback handlers that perform state validation.
* Added timeout configurations (30.0s) for OAuth client requests to prevent hanging processes.



---

## 3. Duplication Summary (Optimization)

In the source document, several tracebacks and environment configurations were repeated across different logs.

* **Redundant Tracebacks**: The `ImportError: cannot import name 'get_current_user' from 'app.api.auth'` appeared five times (Snippets 4, 5, 6, 8, 9). This was a single circular dependency issue where `deps.py` and `auth.py` were importing each other. It has been resolved by moving `get_current_user` to the dependencies layer.
* **Environment Syncs**: Commands for `git pull` and directory navigation were repeated frequently; these have been consolidated into the "Execution Commands" sections above for clarity.

---

**END OF PART 1.**
*Ready to proceed to **PART 2**? (Steps 4 through 7: Frontend UI, OAuth Integration, Route Protection, and Tailwind CSS).*

```

```
```md
# PART 2: FRONTEND UI, OAUTH INTEGRATION & ROUTE PROTECTION

This part covers the frontend development, the logic for integrating Google/Microsoft OAuth, and the implementation of security guards and styling from the `lms-phase-2.md` document.

---

## 2. Sequential Step-by-Step Development Process (Continued)

### Step 4: Frontend Authentication UI Development
* **Timing**: Dec 24, 2025 (10:00 AM - 11:00 AM).
* **Execution Commands**:
    ```bash
    # Install frontend dependencies
    npm install
    # Build the application to verify configuration
    npm run build
    ```
* **Implementation Details**:
    * Developed core pages: `Landing Page`, `Login`, `Register`, and `Dashboard`.
    * Created `AuthContext.tsx` to centralize authentication state management.
    * Applied responsive Tailwind CSS classes across all forms.
    * Integrated validation for email and password fields.

### Step 5: OAuth Integration Implementation
* **Timing**: Dec 24, 2025 (11:00 AM - 12:00 PM).
* **Execution Commands**:
    ```bash
    # Rebuild both services to apply new OAuth environment variables
    docker-compose -f infrastructure/local/docker-compose.yml up -d --build backend
    docker-compose -f infrastructure/local/docker-compose.yml up -d --build frontend
    ```
* **Implementation Details**:
    * Created `frontend/app/auth/callback/page.tsx` to handle tokens returned from the backend.
    * Enhanced `AuthContext.tsx` with logic to synchronize OAuth tokens into `localStorage`.
    * Used `window.location.search` to parse incoming credentials securely.
    * Implemented account linking logic using the user's email as the primary key.

### Step 6: Route Protection Implementation
* **Timing**: Dec 24, 2025 (12:00 PM - 1:00 PM).
* **Execution Commands**:
    ```bash
    # Refresh frontend to apply middleware and route guards
    docker-compose -f infrastructure/local/docker-compose.yml up -d --build frontend
    ```
* **Implementation Details**:
    * Created `frontend/middleware.ts` for server-side redirection rules.
    * Implemented the `ProtectedRoute` component to wrap restricted pages.
    * Added `popstate` event listeners in the `AuthContext` to prevent unauthorized users from using the browser's "back" button to access protected areas.
    * Established catch-all routes (`[...slug]`) to handle invalid or unauthorized URL attempts.

### Step 7: Tailwind CSS Configuration and Styling
* **Timing**: Dec 24, 2025 (1:00 PM - 5:00 PM).
* **Implementation Details**:
    * Migrated to `@tailwindcss/postcss` for improved build performance.
    * Resolved IDE "Unknown at rule" errors by updating `globals.css` syntax.
    * Cleaned up conflicting CSS rules that were overriding utility-first styles.
    * Applied a consistent color palette (Blue/Indigo/Gray) to the entire authentication flow.

---

## 3. Complete Code Implementation (Frontend)

### 1. Landing Page (`frontend/app/page.tsx`)
```tsx
import Image from "next/image";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Home() {
  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
        <div className="bg-red-500 text-white p-4 mb-4 rounded-lg">
          <p className="font-bold">TAILWIND CSS IS WORKING - VISUAL TEST</p>
        </div>
        <main className="flex flex-col items-center justify-center flex-1 w-full max-w-md text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
            <div className="mb-8">
              <Image
                className="mx-auto dark:invert"
                src="/next.svg"
                alt="Next.js logo"
                width={100}
                height={20}
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Welcome to Learning Platform
            </h1>
            <p className="text-gray-600 mb-8 text-sm">
              Join our community to start your learning journey
            </p>
            <div className="flex flex-col gap-4">
              <a
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-300 text-center"
                href="/login"
              >
                Login
              </a>
              <a
                className="w-full py-3 px-4 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg transition duration-300 text-center"
                href="/register"
              >
                Register
              </a>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

```

### 2. Login Page (`frontend/app/login/page.tsx`)

```tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function LoginPage() {
  const { loginUser } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-md">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md space-y-4">
              {error && <div className="text-red-500 text-sm text-center">{error}</div>}
              <div>
                <input
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Login
              </button>
            </div>
          </form>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <a 
              href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/auth/google`}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Google
            </a>
            <a 
              href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/auth/microsoft`}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Microsoft
            </a>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

```

### 3. Auth Context Logic (`frontend/context/AuthContext.tsx`)

```tsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin, register as apiRegister, getCurrentUser } from "@/lib/auth";

type User = { id: number; email: string; role: string; };

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginUser: (email: string, password: string) => Promise<void>;
  registerUser: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      // Check for OAuth token in URL
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('access_token');
      if (tokenFromUrl) {
        localStorage.setItem('token', tokenFromUrl);
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const token = localStorage.getItem('token');
      if (token) {
        try {
          const fetchedUser = await getCurrentUser(token);
          setUser({ id: fetchedUser.id, email: fetchedUser.email, role: fetchedUser.role });
        } catch {
          localStorage.removeItem("token");
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  async function loginUser(email: string, password: string) {
    const data = await apiLogin(email, password);
    localStorage.setItem("token", data.access_token);
    const userData = await getCurrentUser(data.access_token);
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, loginUser, registerUser: async () => {}, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

```

---

## 4. Issue & Solution Log (Summarized)

| Issue | Root Cause | Tracing Process | Solution |
| --- | --- | --- | --- |
| **JSON Syntax Error** | Nginx misrouted API calls to Next.js (HTML) instead of FastAPI. | Observed `Unexpected token '<'` in frontend console. | Updated Nginx with explicit `/auth/` proxy pass to port 8000. |
| **OAuth Redirect Loop** | Nginx sent `/auth/callback` to backend instead of frontend. | Noticed user remained on home page after Google login. | Defined `/auth/callback` location to proxy to frontend port 3000. |
| **Registration Kick-back** | Race condition in `ProtectedRoute` checking state before initialization. | Debug logs showed token was present, but `isAuthenticated` was briefly false. | Added `isLoading` state to `AuthContext` to defer guard checks. |
| **IDE CSS Errors** | Outdated Tailwind v3 syntax used with v4 PostCSS plugin. | Build warnings for `Unknown at rule @tailwind`. | Switched to `@import 'tailwindcss';` in `globals.css`. |

---

## 5. Duplication Summary (Optimization)

* **Routing Catch-alls**: The document listed separate `[...slug]` pages for `login` and `dashboard`. These were consolidated into a single `ProtectedRoute` logic for better maintainability.
* **Docker Rebuilds**: The command `docker-compose up -d --build` appeared for every minor code change; these have been grouped into logical execution steps above.

---

**END OF PART 2.**
*Ready to proceed to **PART 3**? (Step 8: Final Testing, Local-to-Cloud Setup Guide, and GitHub Sync).*

```

```

```md
# PART 3: FINAL VALIDATION, CLOUD SETUP & VERSION CONTROL

This final part details the testing procedures, the infrastructure synchronization between local and cloud environments, and the version control strategy used to secure the codebase.

---

## 2. Sequential Step-by-Step Development Process (Finale)

### Step 8: Final Testing and Validation
* **Timing**: Dec 24, 2025 (5:00 PM - 5:17 PM).
* **Execution Commands**:
    ```bash
    # Verify all services are running correctly
    docker-compose -f infrastructure/local/docker-compose.yml ps

    # Health check for the backend API
    curl http://localhost:8000/health

    # Check frontend accessibility
    curl http://localhost:3000

    # Inspect logs for any hidden runtime warnings
    docker-compose -f infrastructure/local/docker-compose.yml logs backend
    docker-compose -f infrastructure/local/docker-compose.yml logs frontend
    ```
* **Validation Checklist**:
    * ✅ **OAuth Flow**: Verified that both Google and Microsoft logins successfully redirect to the dashboard.
    * ✅ **Route Protection**: Confirmed that unauthenticated users are redirected to `/login` when attempting to access `/dashboard`.
    * ✅ **Tailwind Styling**: Visually inspected all forms and the landing page for CSS consistency.
    * ✅ **Error Handling**: Validated that invalid credentials show appropriate error messages without crashing the session.

---

## 🖥️ Detailed Local-to-Cloud Development Setup Guide

This guide ensures the Windows 11 local environment matches the Ubuntu cloud environment for seamless deployment.

### 🔧 1. Foundation Setup on Windows 11
* **Directory Structure Creation**:
    ```powershell
    # Create the project root and essential subdirectories
    New-Item -Path "$env:USERPROFILE\projects\learning-platform" -ItemType Directory -Force
    cd "$env:USERPROFILE\projects\learning-platform"

    New-Item -Path ".envs/local", ".envs/prod", "infrastructure/local", "data/postgres" -ItemType Directory -Force
    ```
* **Environment Management**: Configuration files were separated into `.envs/local` for Docker Compose to prevent local credentials from leaking into production.


### 🚀 2. Pushing the Project to GitHub
To synchronize the project across environments, a single repository strategy was implemented.

1.  **Configure Exclusions (`.gitignore`)**:
    * **Sensitive**: `.env`, `*.pem`, `*.key`
    * **Dependencies**: `node_modules/`, `venv/`, `__pycache__/`
    * **Builds**: `.next/`, `dist/`, `build/`
2.  **Initialize and Commit**:
    ```bash
    git init
    git add .
    git commit -m "feat: complete auth system with nginx config, fastapi, and next.js"
    ```
3.  **Sync to Remote**: The code was pushed to the `production` branch and then merged into `main` once stability was confirmed.

---

## 📝 Final Project Summary

### 1. Final Results Overview
| Feature | Status | Result |
| :--- | :--- | :--- |
| **Google/Microsoft OAuth** | ✅ Verified | Lands on Frontend, captures token, and redirects to Dashboard. |
| **Manual Registration** | ✅ Verified | Triggers automatic login, fetching the user profile immediately. |
| **Security (Auth Guard)** | ✅ Verified | `ProtectedRoute` reliably waits for auth state before redirecting. |
| **Infrastructure** | ✅ Verified | Nginx correctly separates API traffic from Frontend traffic. |

### 2. Resolution Summary (Major Fixes)
* **Routing**: Fixed the "JSON Syntax Error" by ensuring Nginx routes `/auth/` specifically to port 8000 and `/` to port 3000.
* **State Management**: Added an `isLoading` (initialized) state to the `AuthContext` to prevent race conditions where users were kicked out during page refresh.
* **Deployment**: Used `AUTHLIB_INSECURE_TRANSPORT` in the local Docker environment to allow testing OAuth over HTTP before moving to production HTTPS.

---
**DOCUMENTATION COMPLETE.**
*All phases of the Auth-First Development Roadmap have been recorded and verified.*

```

This is **PART 4** of the **COMPREHENSIVE DEVELOPMENT MANUAL - LMS PHASE 2**. This section covers the complete implementation of the Frontend Authentication UI, OAuth Integration, and Route Protection logic, including the specific fixes for race conditions and redirection loops identified in the production logs.

---

# PART 4: FRONTEND UI, OAUTH INTEGRATION & ROUTE PROTECTION

Following the successful backend foundation, we move to the frontend implementation using Next.js 14 (App Router) and Tailwind CSS. This phase ensures that the user experience is seamless, secure, and role-aware.

## 1. Step 4: Frontend Authentication UI Development

The goal was to create a responsive, modern interface for Login and Registration that supports both manual credentials and Federated Identity Providers (Google/Microsoft).

### A. Landing Page (`frontend/app/page.tsx`)

This page serves as the entry point and includes a visual check for Tailwind CSS functionality.

```tsx
import Image from "next/image";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Home() {
  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
        {/* Tailwind Verification Badge */}
        <div className="bg-red-500 text-white p-4 mb-4 rounded-lg shadow-lg animate-bounce">
          <p className="font-bold">TAILWIND CSS IS WORKING - PRODUCTION TEST</p>
        </div>

        <main className="flex flex-col items-center justify-center flex-1 w-full max-w-md text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm transition-all hover:scale-105">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Noleij Platform</h1>
            <p className="text-gray-500 mb-8">Empowering your learning journey.</p>
            
            <div className="flex flex-col gap-4">
              <a 
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-md" 
                href="/login"
              >
                Sign In
              </a>
              <a 
                className="w-full py-3 px-4 bg-white border-2 border-gray-200 hover:border-indigo-600 text-gray-700 font-semibold rounded-xl transition-all" 
                href="/register"
              >
                Create Account
              </a>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

```

### B. Login Page with OAuth & RBAC (`frontend/app/login/page.tsx`)

This page handles manual login, email normalization, and provides entry points for OAuth 2.0.

```tsx
"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function LoginPage() {
  const { loginUser, setToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Step 5 Logic: Capture OAuth Token from URL
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setToken(token);
      router.push("/dashboard");
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      // Logic: Email normalization to prevent duplicate accounts
      const normalizedEmail = email.toLowerCase().trim();
      const user = await loginUser(normalizedEmail, password);
      
      // RBAC Implementation: Role-based Redirection
      if (user?.role === "super admin") {
        router.push("/superadmin");
      } else if (user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/user");
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    }
  }

  const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://noleij.com").trim();

  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Welcome Back</h2>
          
          {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              type="email" placeholder="Email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              required 
            />
            <input 
              type="password" placeholder="Password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              required 
            />
            <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700">
              Sign In
            </button>
          </form>

          <div className="relative my-8 text-center">
            <span className="bg-white px-4 text-gray-400 text-sm">OR CONTINUE WITH</span>
            <div className="absolute top-1/2 left-0 right-0 border-t -z-10"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <a href={`${API_BASE}/auth/google`} className="flex items-center justify-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <img src="/google.svg" alt="Google" className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Google</span>
            </a>
            <a href={`${API_BASE}/auth/microsoft`} className="flex items-center justify-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <img src="/microsoft.svg" alt="Microsoft" className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Microsoft</span>
            </a>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

```

---

## 2. Step 5: OAuth Integration Implementation (Backend)

The backend was rewritten to handle the OAuth flow manually, bypassing complex session state issues in Docker environments.

### Updated Backend OAuth Flow (`backend/app/api/auth.py`)

```python
@router.get("/auth/google")
async def google_login(request: Request):
    # Logic: Redirect to Google's Auth Endpoint
    redirect_uri = f"{settings.API_BASE_URL}/auth/google/callback"
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/auth/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    # 1. Exchange Code for Token
    token = await oauth.google.authorize_access_token(request)
    user_info = token.get('userinfo')
    
    # 2. Extract Identity & Link Account
    email = user_info['email'].lower()
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        # Auto-Registration for new OAuth users
        user = User(
            email=email,
            full_name=user_info.get('name'),
            google_id=user_info.get('sub'),
            avatar_url=user_info.get('picture'),
            role="user"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # 3. Create Platform JWT
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    
    # 4. Redirect to Frontend with Token in URL
    frontend_redirect = f"{settings.FRONTEND_URL}/login?token={access_token}"
    return RedirectResponse(url=frontend_redirect)

```

---

## 3. Step 6: Route Protection & State Synchronization

To solve the **"Race Condition"** (where users were redirected to login before the browser could read the token), an `initialized` state was added to the `AuthContext`.

### A. Auth Context (`frontend/context/AuthContext.tsx`)

```tsx
"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [initialized, setInitialized] = useState(false); // CRITICAL FIX

  useEffect(() => {
    const syncAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const userData = await getCurrentUser(token);
          setUser(userData);
        } catch {
          localStorage.removeItem("token");
        }
      }
      setInitialized(true); // Signal that auth state is determined
    };
    syncAuth();
  }, []);

  const loginUser = async (email, password) => {
    // ... logic from Main Doc ...
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, initialized, loginUser }}>
      {children}
    </AuthContext.Provider>
  );
}

```

### B. Protected Route Guard (`frontend/components/ProtectedRoute.tsx`)

```tsx
"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children, requireAuth = true }) {
  const { isAuthenticated, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return; // Prevent premature redirection

    if (requireAuth && !isAuthenticated) {
      router.push("/login");
    } else if (!requireAuth && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, initialized]);

  if (!initialized) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}

```

---

## 4. Step 7 & 8: Global Styling & Verification

Tailwind CSS was configured to use a custom indigo-based color palette for the platform's brand identity.

### Tailwind Configuration (`frontend/tailwind.config.ts`)

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: "#818cf8",
          DEFAULT: "#4f46e5",
          dark: "#3730a3",
        }
      }
    },
  },
  plugins: [],
};
export default config;

```

### Verification Checklist

1. **Login Flow**: Manual credentials -> Token received -> Correct dashboard redirect (Super Admin/User).
2. **OAuth Flow**: Google/Microsoft button -> External Consent -> Callback -> Local Session initialized.
3. **Guard Test**: Navigating directly to `/user` without login -> Forced redirect to `/login`.
4. **Case Test**: Logging in with `USER@example.com` vs `user@example.com` works identically.

---

**END OF PART 4.**
*In PART 5, we will detail the Infrastructure Sync, Nginx Reverse Proxy settings, and the full Issue & Solution Log (including the fix for the "Unexpected token <" error).*

This is **PART 5** of the **COMPREHENSIVE DEVELOPMENT MANUAL - LMS PHASE 2**. Following the user's specific request for granular details, this section covers the exact file creation, folder structure, and complete page content for the **Role-Based Access Control (RBAC)** system and the associated Dashboard environments.

---

# PART 5: ROLE-BASED ACCESS CONTROL (RBAC) & DASHBOARD IMPLEMENTATION

This phase moves beyond simple authentication to create a structured platform where users are gated by their permissions (**Super Admin**, **Admin**, **User**).

## 1. Directory Structure for Multi-Role Dashboards

To maintain a clean Next.js architecture, the `app` folder was organized into role-specific sub-directories.

```text
frontend/
├── app/
│   ├── (auth)/                # Route Group for Login/Register
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── user/                  # Student Dashboard (Standard)
│   │   ├── page.tsx           # Entry point for /user
│   │   └── layout.tsx         # Dashboard-specific layout
│   ├── admin/                 # Instructor/Admin Dashboard
│   │   └── page.tsx           # Entry point for /admin
│   └── superadmin/            # System Owner Dashboard
│       └── page.tsx           # Entry point for /superadmin
├── components/
│   ├── ProtectedRoute.tsx     # RBAC Guard
│   └── Navbar.tsx             # Dynamic navigation
└── context/
    └── AuthContext.tsx        # Global State

```

---

## 2. Backend Implementation: Schema & Logic

We must first ensure the database understands roles before the frontend can act on them.

### A. Updating the User Model

**File:** `backend/app/models/user.py`

```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from ..db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)
    full_name = Column(String)
    
    # RBAC Core Field
    # Default is 'user'. Permitted: 'user', 'admin', 'super admin'
    role = Column(String, default="user", nullable=False) 

    # OAuth Identity Tracking
    google_id = Column(String, unique=True, nullable=True)
    microsoft_id = Column(String, unique=True, nullable=True)
    avatar_url = Column(String, nullable=True)

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

```

### B. Injecting Role into Authentication Response

The login endpoint must return the role so the frontend can redirect without extra API calls.

**File:** `backend/app/api/auth.py`

```python
@router.post("/login")
async def login(request: AuthRequest, db: Session = Depends(get_db)):
    # Normalize email to prevent 'User@Email.com' login failures
    normalized_email = request.email.lower().strip()
    user = db.query(User).filter(User.email == normalized_email).first()
    
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Access Token contains the 'role' claim for server-side verification
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "email": user.email,
            "role": user.role # Sent to Frontend AuthContext
        }
    }

```

---

## 3. Frontend Implementation: Dashboard Pages

Below is the full source code for the three primary dashboard environments.

### A. Standard User (Student) Page

**File:** `frontend/app/user/page.tsx`

```tsx
"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

export default function UserDashboard() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <nav className="bg-white border-b p-4 flex justify-between items-center shadow-sm">
          <h1 className="text-xl font-bold text-indigo-600">Learning Center</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button onClick={logout} className="text-sm bg-red-50 text-red-600 px-3 py-1 rounded-md">Logout</button>
          </div>
        </nav>
        
        <main className="p-8 max-w-6xl mx-auto w-full">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back!</h2>
            <p className="text-gray-500">Pick up where you left off in your courses.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="p-6 bg-indigo-50 rounded-xl border border-indigo-100">
                <h3 className="font-bold text-indigo-700">Courses Enrolled</h3>
                <p className="text-4xl font-black text-indigo-900 mt-2">0</p>
              </div>
              <div className="p-6 bg-green-50 rounded-xl border border-green-100">
                <h3 className="font-bold text-green-700">Certificates</h3>
                <p className="text-4xl font-black text-green-900 mt-2">0</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

```

### B. Super Admin (System) Page

**File:** `frontend/app/superadmin/page.tsx`

```tsx
"use client";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function SuperAdminPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-900 text-white p-12">
        <div className="max-w-4xl">
          <header className="border-b border-slate-800 pb-6 mb-8">
            <h1 className="text-4xl font-black tracking-tight">SYSTEM CONSOLE</h1>
            <p className="text-slate-400 mt-2">Environment: Production (Alibaba Cloud ECS)</p>
          </header>

          <div className="grid grid-cols-1 gap-6">
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-indigo-500 transition-colors">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                Database Status
              </h2>
              <div className="bg-black p-4 rounded font-mono text-sm text-green-400">
                $ psql -c "SELECT count(*) FROM users;"<br/>
                count: 12
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

```

---

## 4. RBAC Logic & Actions (Terminal & Execution)

### Step-by-Step Action: Manual Role Promotion

Since the platform is in active development, we promote users via the database terminal rather than a UI to maintain security.

1. **Enter the Postgres Container:**
```bash
docker exec -it postgres_prod psql -U learning_user -d learning_platform

```


2. **Verify User Email:**
```sql
SELECT id, email, role FROM users WHERE email = 'your-email@example.com';

```


3. **Execute Promotion:**
```sql
UPDATE users SET role = 'super admin' WHERE email = 'your-email@example.com';

```



### Redirection Switch Case Logic

The `LoginPage` uses this logic to interpret the backend's response and route the user correctly.

**Snippet from `frontend/app/login/page.tsx`:**

```tsx
const loginResponse = await loginUser(email, password);

if (loginResponse.role === "super admin") {
    router.push("/superadmin");
} else if (loginResponse.role === "admin") {
    router.push("/admin");
} else {
    router.push("/user");
}

```

---

**END OF PART 5.**
*In PART 6, we will detail the complete Infrastructure Hardening, including the Nginx configuration traces and the exhaustive Issue & Solution Log.*

This is **PART 6** of the **COMPREHENSIVE DEVELOPMENT MANUAL - LMS PHASE 2**. This section focuses on the final transition to a production-hardened environment, the complete GitHub synchronization workflow, and the **Exhaustive Issue & Solution Log** which captures the deep-level troubleshooting performed during the Alibaba Cloud ECS deployment.

---

# PART 6: INFRASTRUCTURE HARDENING, CLOUD SYNC & ISSUE LOG

This phase ensures that the development work is safely pushed to production and remains stable under real-world traffic conditions.

## 1. Production Infrastructure Configuration

To move from local development to production on Alibaba Cloud, we transitioned from the default Docker setup to a hardened configuration using Nginx as a reverse proxy.

### A. Directory Structure (Production Root)

```text
~/apps/learning-platform/
├── .envs/
│   └── prod/
│       └── .env               # Production secrets (API keys, DB Pass)
├── infrastructure/
│   └── docker/
│       └── docker-compose.prod.yml
├── nginx/
│   └── conf.d/
│       └── learning.conf      # Site-specific config
├── backend/                   # Synced from Local
└── frontend/                  # Synced from Local

```

### B. Production Docker Compose (`infrastructure/docker/docker-compose.prod.yml`)

```yaml
version: '3.8'
services:
  backend_prod:
    build: 
      context: ../../backend
      dockerfile: Dockerfile
    container_name: backend_prod
    restart: always
    env_file: ../../.envs/prod/.env
    ports:
      - "8000:8000"
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

  frontend_prod:
    build:
      context: ../../frontend
      dockerfile: Dockerfile
    container_name: frontend_prod
    restart: always
    env_file: ../../.envs/prod/.env
    ports:
      - "3000:3000"

  db_prod:
    image: postgres:16-alpine
    container_name: postgres_prod
    environment:
      POSTGRES_DB: learning_platform
      POSTGRES_USER: learning_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - prod_db_data:/var/lib/postgresql/data

volumes:
  prod_db_data:

```

---

## 2. Nginx Reverse Proxy: The Critical Routing Fix

As documented in the **MAIN DOC**, the most significant production hurdle was the "Unexpected Token <" error. This was solved by configuring Nginx to strictly separate API and Frontend traffic.

### The Final Nginx Config (`/etc/nginx/sites-available/noleij.com.conf`)

```nginx
server {
    listen 443 ssl;
    server_name noleij.com;

    ssl_certificate /etc/letsencrypt/live/noleij.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/noleij.com/privkey.pem;

    # 1. API - All /auth/ and /api/ calls go to FastAPI (Port 8000)
    location /auth/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 2. OAuth Callback - Explicitly routed to Next.js (Port 3000)
    location = /auth/callback {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
    }

    # 3. Frontend - Default catch-all for Next.js (Port 3000)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
    }
}

```

---

## 3. GitHub Synchronization Workflow

This step-by-step process details how the code was safely migrated from the local Windows environment to the cloud.

### Step 1: Initialize and Secure

```bash
git init
# Create .gitignore to prevent leaking .envs and node_modules
echo ".env" >> .gitignore
echo "node_modules/" >> .gitignore
echo "__pycache__/" >> .gitignore

```

### Step 2: Local Commit & Push

```bash
git add .
git commit -m "feat: complete auth-first system with RBAC and Nginx routing"
git branch -M main
git remote add origin https://github.com/your-repo/learning-platform.git
git push -u origin main

```

### Step 3: Cloud Deployment (On ECS)

```bash
ssh root@your-ecs-ip
cd ~/apps/learning-platform
git pull origin main
docker compose -f infrastructure/docker/docker-compose.prod.yml up -d --build

```

---

## 4. THE EXHAUSTIVE ISSUE & SOLUTION LOG

This log consolidates all technical failures and verified resolutions found across the **MAIN DOC** logs.

| Error Code / Symptom | Root Cause | Technical Solution / Command |
| --- | --- | --- |
| **`SyntaxError: Unexpected token '<'`** | Nginx sent `/auth` requests to Next.js, which returned an HTML 404 page instead of JSON. | Update Nginx: Add a specific `location /auth/` block pointing to port 8000. |
| **`400: State Mismatch` (OAuth)** | Docker Proxy/Nginx caused session state loss during the redirect loop. | 1. Enable `AUTHLIB_INSECURE_TRANSPORT=1`. 2. Implement manual token capture in `AuthContext`. |
| **`ImportError: Circular Dependency`** | `auth.py` and `deps.py` were importing each other. | Refactor `get_current_user` into `auth.py` and remove it from `deps.py`. |
| **`Nginx: [emerg] invalid number of arguments`** | Configuration file corruption during manual copy-paste. | Run `sudo sed -i 's/\[//g' /etc/nginx/sites-available/config` to remove brackets. |
| **Auth Redirect Loop** | Frontend kept redirecting to `/login` despite a valid token. | **Race Condition Fix**: Add `initialized` state to `AuthContext` to wait for token verification before acting. |
| **`Postgres: Role does not exist`** | `init-db.sh` used CRLF line endings (Windows) which Linux Docker could not read. | Use `dos2unix init-db.sh` or save with **LF** line endings. |

---

## 5. Final Platform Status Report

* **Authentication**: Fully Federated (Google/Microsoft) and Manual.
* **RBAC**: Verified for Super Admin, Admin, and User roles.
* **Infrastructure**: Nginx Hardened, SSL Enabled, GitHub Synced.
* **Next Action**: Commence Sprint 2 (Core Learning Feed Development).

**DOCUMENTATION COMPLETE.**
*This concludes the integration of the MAIN DOC and SECOND DOC into a single authoritative manual.*

# Project Status: Completed Features & Validation Checklist

This document confirms the stability of the production environment and the successful implementation of the core authentication and infrastructure modules.

---

## 1. Authentication System

### 🛡️ Role-Based Redirection (RBAC)
- **Logic**: The Backend returns the `user.role` object within the JWT/Response payload. The Frontend `AuthContext` captures this state, and the **Login Page** executes a conditional redirect.
- **Status**: **Verified Working** (e.g., Super Admin is routed to `/superadmin`, while standard users land on `/user`).

### 📝 Registration Flow
- **Logic**: Created a dedicated Backend `/register` endpoint to handle manual account creation.
- **UI**: Added a 'Sign up' link to the Login Page for better UX.
- **Redirect**: On successful registration, the system triggers an automatic login and redirects the user to the **User Dashboard** (`/user`).
- **Status**: **Code Pushed & Verified**.

### 🌐 OAuth Integration (Google & Microsoft)
- **Logic**: Transitioned to a **manual token exchange** flow to bypass persistent Authlib session/state conflicts occurring in the Dockerized proxy environment.
- **Configuration**: `AUTHLIB_INSECURE_TRANSPORT` has been enabled specifically for Proxy/Docker compatibility.
- **Status**: **Google Login Verified** (Resolved all `400 Bad Request` and `State Mismatch` errors).

---

## 2. Infrastructure & Codebase

### ⚙️ Backend Fixes
- **`auth.py`**: Performed a full rewrite to support manual OAuth handling and integrated comprehensive logging for production debugging.
- **`deps.py`**: Updated dependencies and utility functions (verified via git merge logs).

### 🎨 Frontend Fixes
- **`login/page.tsx`**: Updated to handle OAuth token extraction from URL parameters and integrated the Registration link.
- **`register/page.tsx`**: Added OAuth provider buttons and configured post-registration redirect logic.

### ☁️ Cloud Sync
- **Production Push**: `git push origin production` — **SUCCESS** (All changes synced to GitHub).
- **Branch Merge**: `git merge production -> main` — **SUCCESS** (Main branch is now fully up to date with verified production code).

---

## 3. Ready for Local Sync

> [!IMPORTANT]
> The cloud environment (Alibaba Cloud ECS) is currently **stable and valid**. 

**Next Step**: Pull these verified changes to your local Windows environment to synchronize your development workspace.

```bash
git checkout main
git pull origin main