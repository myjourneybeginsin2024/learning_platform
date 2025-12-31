# LMS Phase 5: Master Cloud Deployment Guide
**Documentation Period:** Phase 5 — Final Push & Go-Live
**Status:** 🚀 Ready for Execution

---

## 📋 Prerequisite Checklist
Before starting, ensure you have:
1.  **Local Access**: Terminal open at `C:\TRISNA\learning-platform`.
2.  **Cloud Access**: SSH access to your Ubuntu server.
3.  **Credentials**: Ready to verify OAuth keys if needed.

---

## 🚀 Step 1: Push to Development Branch (Local Machine)
**Goal:** Commit all branding, styling, and feature updates (Popup, Detail Page) to the repository.

**Execute these commands in your Local Terminal:**

```powershell
# 1. Navigate to project root
cd C:\TRISNA\learning-platform

# 2. Check status (Should see modified files)
git status

# 3. Stage ALL changes
git add .

# 4. Commit with a comprehensive message
git commit -m "feat(phase-5): Final Polish & Feature Implementation

- Branding: Updated Application Logo, Favicon, and Fonts
- UI/UX: Implemented Dark Mode for Admin/Superadmin Dashboards
- UI/UX: Unified Button Colors to Grey Theme
- Feature: Added Full-Screen Image Popup (MediaViewer)
- Feature: Added Post Detail Page Navigation
- Fix: Corrected Feed Image Aspect Ratio and Content
- Chore: Updated Deployment Documentation"

# 5. Push to remote
git push origin development
```

**✅ Verification:**
*   Go to your GitHub/GitLab repo.
*   Confirm the latest commit is visible on the `development` branch.

---

## 🔧 Step 2: Cloud Server Configuration (One-Time)
**Goal:** Ensure the cloud server has the specific environment variables for the new domain and OAuth.

**Execute these commands in your Cloud Terminal (SSH):**

```bash
# 1. SSH into the server
ssh user@your-cloud-ip

# 2. Navigate to backend config
cd ~/apps/backend

# 3. Verify/Edit .env
nano .env
```

**Check that these values are set correctly:**
```dotenv
# Domain Configuration
API_BASE_URL=https://noleij.com
FRONTEND_URL=https://noleij.com

# OAuth Secure Transport (0 for Prod behind Proxy, 1 for Dev)
# Since you likely have SSL termination, 0 is safer if handling internally, or 1 if strict HTTPS.
# Usually 1 is required for OAuth over HTTPS.
AUTHLIB_INSECURE_TRANSPORT=0

# Credentials (Verify these match what you have locally)
GOOGLE_CLIENT_ID=<YOUR_GOOGLE_CLIENT_ID>
GOOGLE_CLIENT_SECRET=<YOUR_GOOGLE_CLIENT_SECRET>
MICROSOFT_CLIENT_ID=<YOUR_MICROSOFT_CLIENT_ID>
MICROSOFT_CLIENT_SECRET=<YOUR_MICROSOFT_CLIENT_SECRET>
```
*Press `Ctrl+O` to Save, `Enter` to confirm, `Ctrl+X` to Exit.*

---

## 📥 Step 3: Deployment (Pull & Rebuild)
**Goal:** Update the code on the server and rebuild Docker containers to apply changes.

**Execute these commands in your Cloud Terminal:**

```bash
# 1. Navigate to Project Root
cd ~/apps

# 2. Fetch and Pull Latest Code
git fetch origin
git checkout development
git pull origin development

# 3. Rebuild Containers (Force Recreation)
cd ~/apps/infrastructure/docker

# Stop existing containers to ensure clean state
docker compose -f docker-compose.prod.yml down

# Rebuild and Start (Detached)
docker compose -f docker-compose.prod.yml up -d --build
```

**⏳ Wait ~60 seconds for the build to complete and services to start.**

---

## ✅ Step 4: Verification & Go-Live
**Goal:** Confirm the live site `https://noleij.com` works exactly like your local environment.

**1. Log Check:**
```bash
docker compose -f docker-compose.prod.yml logs -f --tail=50
# Look for "Ready on port 3000" (Frontend) and "Application startup complete" (Backend)
# Press Ctrl+C to exit logs
```

**2. Browser Verification (Visit https://noleij.com):**
*   **[ ] Branding:** Is the Logo correct? Is the favicon visible?
*   **[ ] Dark Mode:** Does the site respect your system theme?
*   **[ ] Admin Dashboard:** Log in as Admin -> Are the tables Dark Grey (not white)?
*   **[ ] Image Popup:** Click a feed image -> Does it open full screen?
*   **[ ] Detail Page:** Click a post title -> Does it navigate to the detail view?
*   **[ ] OAuth:** Try logging in with Google.

---

## 🔄 Rollback (If things break)
**Emergency Checkpoint:** `db75e82` (Stable Phase 4 with RBAC)

```bash


# 1. Check and Revert to the known stable commit
git log --oneline -n 5

cd ~/apps
git checkout db75e82

# 2. Rebuild containers
cd ~/apps/infrastructure/docker
docker compose -f docker-compose.prod.yml up -d --build
```
