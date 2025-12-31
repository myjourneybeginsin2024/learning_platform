# LMS Phase 3 & 4: Local-Cloud Sync & UI Migration
**Documentation Period:** Phase 3 — Environment Sync to Phase 4 — UI/UX Redesign
**Reference:** `lms-phase-1.md`, `lms-phase-2-final.md`
**Status:** ✅ Completed & Verified

---

## 🏗️ Phase 3 — Local-Cloud Infrastructure Synchronization
**Goal:** Synchronize the local Windows development environment with the latest Cloud production code, fix all critical authentication issues, and establish a stable debugging baseline.

### Step 1: Git Synchronization
* **Timing**: Start of Phase 3.
* **Preparation Requirements**:
  * Docker Desktop must be installed and running.
  * Git must be configured with SSH access to the repository.
  * Local PostgreSQL must be accessible (or containerized `postgres_local`).

* **Execution Commands**:
    ```powershell
    # Navigate to project
    cd C:\TRISNA\learning-platform

    # Fetch all latest remote changes
    git fetch origin

    # Create isolated development branch from production
    git checkout -b development origin/production

    # (Optional) Routine sync during development
    git pull origin production
    ```

* **Verification**:
    ```powershell
    git branch
    # Expected: * development
    ```

### Step 2: Environment Configuration
* **Timing**: Following git sync.
* **File Created**: `.envs/local/.env`

* **Implementation Details**:
    ```dotenv
    # --- Database Configuration ---
    # CRITICAL: Must point to container name, NOT localhost
    DATABASE_URL=postgresql://app_user:app_password@postgres_local:5432/learning_platform
    POSTGRES_USER=app_user
    POSTGRES_PASSWORD=app_password
    POSTGRES_DB=learning_platform

    # --- Security ---
    SECRET_KEY=development_secret_key_123
    ALGORITHM=HS256
    ACCESS_TOKEN_EXPIRE_MINUTES=30

    # --- OAuth Configuration ---
    # "1" allows HTTP for local dev. Set to "0" in production.
    AUTHLIB_INSECURE_TRANSPORT=1

    # --- Domain/URL Configuration ---
    API_BASE_URL=http://localhost:8000
    FRONTEND_URL=http://localhost:3000

    # --- Third-Party Keys ---
    GOOGLE_CLIENT_ID=<YOUR_GOOGLE_CLIENT_ID>
    GOOGLE_CLIENT_SECRET=<YOUR_GOOGLE_CLIENT_SECRET>
    MICROSOFT_CLIENT_ID=<YOUR_MICROSOFT_CLIENT_ID>
    MICROSOFT_CLIENT_SECRET=<YOUR_MICROSOFT_CLIENT_SECRET>
    ```

### Step 3: Container Deployment
* **Timing**: Following environment setup.
* **Execution Commands**:
    ```bash
    # Navigate to infrastructure folder
    cd infrastructure/local

    # Build and start all services
    docker-compose up -d --build

    # Verify containers are running
    docker ps
    # Expected: postgres_local, backend_local, frontend_local
    ```

---

## 🐞 Phase 3 — Issues, Bugs, and Solutions

| Issue Category | Description | Tracing Process | Root Cause | Solution |
| :--- | :--- | :--- | :--- | :--- |
| **Database** | "Invalid credentials" error on manual login despite correct password. | Inspected backend logs → `Login failed`. Checked `.env` → `DATABASE_URL` pointed to `host.docker.internal`. | Backend was connecting to an empty host DB instead of the seeded container DB. | Updated `DATABASE_URL` host to `postgres_local`. |
| **OAuth/Redirect** | OAuth login caused a "flash" of the `/login` page before redirecting to dashboard. | Observed network tab → 302 Redirect to `/login?token=...`. | Backend hardcoded redirect to `/login`. | Refactored backend to redirect to `/auth/callback`. Created `frontend/app/auth/callback/page.tsx`. |
| **State/Auth** | Users redirected to `/user`, then immediately bounced back to `/login`. | Added console logs to `ProtectedRoute` → `isAuthenticated` was `false`. | Race condition: Redirect fired before `AuthContext` state updated. | Added `await loginWithToken(token)` in callback to synchronize state before redirect. |
| **Security** | "Signature has expired" error on freshly generated tokens. | Backend logs showed `exp` claim validation failure. Compared `datetime.utcnow()` in container vs token `iat`. | Docker container clock drifted 3-5 seconds from Host clock. | Added `leeway=60` to `jwt.decode` options in `backend/app/core/security.py`. |

---

## 🎨 Phase 4 — UI/UX Redesign (Default Template)
**Goal:** Migrate the "Reddit Clone" high-fidelity UI into the stable Learning Platform architecture (Next.js 14/Tailwind v3).

### Step 4: Template Infrastructure Setup
* **Timing**: Following Phase 3 verification.
* **Execution Commands**:
    ```bash
    # Create template directory structure
    mkdir -p frontend/templates/default/components/{layout,feed,auth,profile}
    mkdir -p frontend/templates/default/styles

    # Install required dependencies
    cd frontend
    npm install lucide-react clsx tailwind-merge
    ```

### Step 5: Styles Migration (Tailwind v4 → v3)
* **Timing**: Following infrastructure setup.
* **File Modified**: `frontend/app/globals.css`

* **Implementation Details**:
    ```css
    @layer base {
        :root {
            --color-reddit-orange: #FF4500;
            --color-reddit-bg: #FFFFFF;
            --color-reddit-card: #FFFFFF;
            --color-reddit-text: #1C1C1C;
            --color-reddit-border: #D1D5DB;
            --radius-pill: 9999px;
        }

        .dark {
            --color-reddit-bg: #030303;
            --color-reddit-card: #1A1A1B;
            --color-reddit-text: #D7DADC;
            --color-reddit-border: #343536;
        }

        body {
            @apply bg-reddit-bg text-reddit-text transition-colors;
        }
    }
    ```

* **File Modified**: `frontend/tailwind.config.ts`
    ```ts
    export default {
      darkMode: ["class"],
      theme: {
        extend: {
          colors: {
            reddit: {
              orange: "var(--color-reddit-orange)",
              bg: "var(--color-reddit-bg)",
              card: "var(--color-reddit-card)",
              text: "var(--color-reddit-text)",
              border: "var(--color-reddit-border)",
            },
          },
          borderRadius: {
            pill: "var(--radius-pill)",
          }
        }
      }
    }
    ```

### Step 6: Component Integration
* **Timing**: Following styles migration.
* **Components Ported**:
    | Component | Source File | Destination | Notes |
    | :--- | :--- | :--- | :--- |
    | Navbar | `reddit-clone/components/layout/Navbar.tsx` | `templates/default/components/layout/Navbar.tsx` | Integrated with `AuthContext` |
    | Sidebar | `reddit-clone/components/layout/Sidebar.tsx` | `templates/default/components/layout/Sidebar.tsx` | Added `dark:` variants |
    | PostCard | `reddit-clone/components/feed/PostCard.tsx` | `templates/default/components/feed/PostCard.tsx` | Standard port |
    | UserDrawer | `reddit-clone/components/layout/UserDrawer.tsx` | `templates/default/components/layout/UserDrawer.tsx` | Fixed logout button |

### Step 7: Page Integration
* **Timing**: Following component integration.
* **Files Modified**:

#### A. Landing Page (`frontend/app/(main)/page.tsx`)
```tsx
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function FeedPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Role-Based Redirect Logic
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
        if (user.role === 'super admin') router.replace('/superadmin');
        else if (user.role === 'admin') router.replace('/admin');
        else router.replace('/user');
    }
  }, [isLoading, isAuthenticated, user, router]);

  return (
    <div>
      <TrendingCarousel />
      {/* Feed Content */}
    </div>
  );
}
```

#### B. OAuth Callback (`frontend/app/auth/callback/page.tsx`)
```tsx
'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AuthCallback() {
  const { loginWithToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('access_token');
    async function handleCallback() {
      if (token) {
        try {
          const user = await loginWithToken(token);
          if (user.role === 'super admin') router.push('/superadmin');
          else if (user.role === 'admin') router.push('/admin');
          else router.push('/user');
        } catch (e) {
          router.push('/login?error=callback_error');
        }
      }
    }
    handleCallback();
  }, [searchParams, router]);

  return <div>Authenticating...</div>;
}
```

#### C. Auth Context (`frontend/context/AuthContext.tsx`)
```tsx
async function loginWithToken(token: string): Promise<User> {
    localStorage.setItem("token", token);
    const fetchedUser = await getCurrentUser(token);
    setUser(fetchedUser);
    localStorage.setItem('user_role', fetchedUser.role);
    return fetchedUser;
}
```

#### D. Mobile Drawer Logout (`frontend/templates/default/components/layout/UserDrawer.tsx`)
```tsx
const handleLogout = () => {
    onClose();
    logout();
};

<button onClick={handleLogout}>
    <LogOut size={20} /> Log Out
</button>
```

---

## 📝 Summary of Current State
| Component | Status | Notes |
| :--- | :--- | :--- |
| **Local-Cloud Sync** | 🟢 Stable | Docker + Git workflow verified |
| **Manual Login** | 🟢 Stable | DB connection fixed |
| **OAuth Login** | 🟢 Stable | Callback architecture refactored |
| **Default Template** | 🟢 Stable | All components ported |
| **Dark Mode** | 🟢 Stable | CSS variables + Tailwind `dark:` |
| **Mobile UI** | 🟢 Stable | Drawer & Logout fixed |
| **Role Redirects** | 🟢 Stable | `/`, `/login` → Dashboard |

**Next Immediate Steps:**
1.  **Push Changes to `development` branch.**
2.  **Deploy to Cloud Server using `lms-cloud-deployment.md`.**
