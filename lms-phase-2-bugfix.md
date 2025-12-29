
Plaintext


# 📘 Project Documentation: Full-Stack Authentication & Deployment
**Project Name:** Noleij Platform  
**Environment:** Cloud Server (Ubuntu) + Docker + Nginx  
**Stack:** FastAPI (Backend), Next.js (Frontend), PostgreSQL, Docker, GitHub.

---

## 1. Development Overview
This project involved deploying a containerized full-stack application with a unified domain (**noleij.com**). The core focus was implementing a robust authentication system (Email/Password + Google/Microsoft OAuth) and solving complex reverse proxy routing issues.

---

## 2. Issue & Solution Log

| Phase | Issue | Root Cause | Solution |
| :--- | :--- | :--- | :--- |
| **Routing** | `Unexpected token <` JSON Error | Nginx sent API requests to Next.js (HTML) instead of FastAPI (JSON). | Defined strict `location` blocks in Nginx for `/auth/` and `/users/`. |
| **OAuth** | OAuth Callback Loop | The `/auth/callback` path was handled by the Backend; it needed to land on the Frontend. | Created an exact match `location = /auth/callback` routing to port 3000. |
| **Auth Logic**| Redirected to `/` after Login | Race condition: `ProtectedRoute` checked auth state before initialization was finished. | Added `isLoading` state to `AuthContext` and a wait-guard in `ProtectedRoute`. |
| **UX** | Registration not going to Dashboard | `registerUser` only signed up; didn't log in. | Updated `registerUser` to perform an auto-login and use `window.location.href`. |

---

## 3. Step-by-Step Command Guide

### 🔍 Trace & Diagnose
Use these commands to find where requests are failing:
```bash
# Monitor Nginx traffic in real-time
sudo tail -f /var/log/nginx/access.log

# Look for 404 errors or wrong redirects
sudo tail -f /var/log/nginx/access.log | grep " 404 "

# Verify Docker container logs
docker logs frontend_prod --tail 50
docker logs backend_prod --tail 50


✅ Validate & Restart

Bash


# Test Nginx syntax
sudo nginx -t

# Restart Nginx to apply changes
sudo systemctl restart nginx

# Restart Docker services
docker restart frontend_prod backend_prod


🛠️ Infrastructure Fixes

Bash


# Clean up corrupt Nginx formatting (removing brackets/typos)
sudo nano /etc/nginx/sites-available/noleij.com.conf

# Verify folder structure for Next.js routes
ls ~/apps/frontend/app/auth/callback/page.tsx
ls ~/apps/frontend/app/dashboard/page.tsx


4. Configuration & Code Updates
A. Nginx Configuration
File: /etc/nginx/sites-available/noleij.com.conf

Nginx


server {
    listen 443 ssl;
    server_name noleij.com [www.noleij.com](https://www.noleij.com);

    ssl_certificate /etc/letsencrypt/live/[noleij.com/fullchain.pem](https://noleij.com/fullchain.pem);
    ssl_certificate_key /etc/letsencrypt/live/[noleij.com/privkey.pem](https://noleij.com/privkey.pem);

    # 1. Frontend OAuth Callback
    location = /auth/callback {
        proxy_pass [http://127.0.0.1:3000](http://127.0.0.1:3000);
        proxy_set_header Host $host;
    }

    # 2. Backend API
    location /auth/ {
        proxy_pass [http://127.0.0.1:8000](http://127.0.0.1:8000);
        proxy_set_header Host $host;
    }

    location /users/ {
        proxy_pass [http://127.0.0.1:8000](http://127.0.0.1:8000);
        proxy_set_header Host $host;
    }

    # 3. Next.js Frontend
    location / {
        proxy_pass [http://127.0.0.1:3000](http://127.0.0.1:3000);
        proxy_set_header Host $host;
    }
}


B. Auth Context (State Management)
File: ~/apps/frontend/context/AuthContext.tsx
Updated to handle initialization and auto-login after registration.

TypeScript


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Initialize: Check localStorage and fetch user profile
  const initializeAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const fetchedUser = await getCurrentUser(token);
        setUser(fetchedUser);
      } catch (e) { localStorage.removeItem("token"); }
    }
    setInitialized(true);
  };

  async function registerUser(email, password) {
    await apiRegister(email, password); // Register
    await loginUser(email, password);    // Then Login
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading: !initialized, registerUser }}>
      {initialized ? children : <LoadingSpinner />}
    </AuthContext.Provider>
  );
}


C. Protected Route (Auth Guard)
File: ~/apps/frontend/components/ProtectedRoute.tsx
Prevents unauthorized access and "flicker" redirects.

TypeScript


export default function ProtectedRoute({ children, requireAuth = true }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // WAIT for initialization

    if (requireAuth && !isAuthenticated) {
      router.push('/login');
    } else if (!requireAuth && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading || (requireAuth && !isAuthenticated)) return null;
  return <>{children}</>;
}


5. Deployment Strategy (Git Workflow)
To manage differences between Local Development and the Live Server, we established a two-branch system.
Step 1: Secure the Live Version (Server)

Bash


git checkout -b production
git add .
git commit -m "stable: working live version"
git push origin production


Step 2: Synchronize Main (Server)

Bash


git checkout main
git merge production
git push origin main


Step 3: Local Development Loop
Local: Make changes in main branch -> git push origin main.
Server: git checkout main -> git pull -> Test.
Go Live: git checkout production -> git merge main -> git push.
6. Final Result
The platform successfully handles secure email registration and Google/Microsoft OAuth. Users are correctly routed by Nginx, and the Next.js frontend maintains a stable authentication state without race-condition redirects.
Would you like me to help you generate a README.md for this repository that explains how to run the Docker environment for a new developer?
