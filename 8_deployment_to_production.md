# Production Deployment Guide (Go-Live)

This guide details the step-by-step process to deploy the Learning Platform to a cloud server (e.g., AWS EC2, DigitalOcean, Azure VM).

---

## 1. Local Preparation (Completed)

We have already configured the infrastructure files:
-   **`infrastructure/docker/docker-compose.prod.yml`**: Updated to accept build arguments for domain configuration.
-   **`infrastructure/docker/Dockerfile.frontend`**: Refactored to use `ARG` for `NEXT_PUBLIC_API_URL`.
-   **`.env.prod.example`**: Created a template for production secrets.

### Action: Push to GitHub
Ensure all local changes are pushed to your remote repository.

```bash
git add .
git commit -m "chore: prepare infrastructure for production"
git push origin development
```

---

## 2. Server Preparation

Connect to your Cloud Server via SSH.

### Prerequisites
Ensure Git and Docker are installed.
```bash
# Update System
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose Plugin
sudo apt install docker-compose-plugin
```

---

## 3. Pull Code

Clone your repository or pull the latest changes.

```bash
# Verify directory
cd ~/learning-platform

# Pull changes
git pull origin development
```

---

## 4. Configuration

Create the production environment file.

```bash
# Copy example
cp .env.prod.example backend/.env

# Edit with your REAL secrets
nano backend/.env
```

> [!IMPORTANT]
> **Edit the following fields in `backend/.env`**:
> *   `NEXT_PUBLIC_API_URL`: Set this to `https://your-domain.com`.
> *   `NEXTAUTH_URL`: Set this to `https://your-domain.com`.
> *   `SECRET_KEY` and `JWT_SECRET_KEY`: Generate strong random strings.
> *   `OPENAI_API_KEY`: Add your real AI key.

---

## 5. Deployment (Build & Run)

Launch the application using the production compose file. We pass the environment variables to the build process.

```bash
# Load env vars for the command
export $(cat backend/.env | xargs)

# Build and Start
docker compose -f infrastructure/docker/docker-compose.prod.yml up -d --build
```

### Explanation:
*   `-f ...`: Points to the correct production YAML.
*   `--build`: Forces a rebuild of images (Crucial for Frontend to bake in the new URL).
*   `-d`: Detached mode (runs in background).

---

## 6. Database Initialization

Since this is a fresh prod server, you need to apply schema and seed data.

```bash
# 1. Run Migrations
docker exec backend_prod alembic upgrade head

# 2. Seed Initial User Roles & Data
# (Assuming your container has the script, or you can copy it in)
docker cp backend/seed_org_roles.py backend_prod:/app/seed_org_roles.py
docker exec backend_prod python seed_org_roles.py
```

---

## 7. Verification

1.  Open `http://your-server-ip:3000` (or your domain).
2.  **Login**: Try `admin@acme.com` / `password123`.
3.  **Check AI**: Upload a test PDF and try generating a curriculum.
    *   *Note*: Ensure your server firewall allows port 3000 (and 8000 for API if accessed directly, though frontend proxies it).

---

## Troubleshooting

### "Frontend can't reach Backend"
*   Check the browser console. If you see `Connection refused` to `localhost`, you forgot to set `NEXT_PUBLIC_API_URL` before building.
*   **Fix**: Update `.env`, run `export ...`, and run the `docker compose ... --build` command again.

### "Database Connection Error"
*   Ensure the `db` service is healthy: `docker compose -f infrastructure/docker/docker-compose.prod.yml ps`.
*   Check logs: `docker logs backend_prod`.

### "Permission Denied" (Uploads)
*   You may need to ensure the upload directory is writable:
    ```bash
    docker exec backend_prod mkdir -p /app/uploads
    docker exec backend_prod chmod 777 /app/uploads
    ```
