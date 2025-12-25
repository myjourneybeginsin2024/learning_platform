# Cloud Deployment Guide: Learning Platform to Alibaba Cloud

## Table of Contents
1. [Overview](#overview)
2. [Production-Ready State](#production-ready-state)
3. [Cloud Server Directory Structure](#cloud-server-directory-structure)
4. [Cloud Server Readiness Verification](#cloud-server-readiness-verification)
5. [Simplified Production Update Process](#simplified-production-update-process)
6. [Requirements Gap Analysis](#requirements-gap-analysis)
7. [Development Workflow: Local to Cloud](#development-workflow-local-to-cloud)

## Overview

This document provides a guide for updating the existing Learning Platform application on Alibaba Cloud. The platform is already deployed and operational, consisting of:
- Backend API (FastAPI) with OAuth 2.0 authentication
- Frontend (Next.js) with Tailwind CSS styling
- PostgreSQL database for user data
- Redis for session management and caching
- OAuth 2.0 integration with Google and Microsoft

This guide focuses on the simplified process for updating the existing production environment, including requirement gap analysis between local and cloud environments.

## Production-Ready State

The Learning Platform is currently deployed and operational on Alibaba Cloud. The system is production-ready and has been thoroughly tested as documented in `lms-phase-1.md`. The current deployment includes:

- ✅ Complete authentication system with OAuth 2.0 integration
- ✅ Secure API endpoints with proper authentication middleware
- ✅ PostgreSQL database with proper connection handling
- ✅ Redis for session management and caching
- ✅ Frontend application with proper routing and state management
- ✅ SSL certificates for secure communication
- ✅ Load balancing for high availability
- ✅ Monitoring and logging infrastructure

The codebase that powers the production system is maintained in a GitHub repository, which serves as the single source of truth for the application. The local development environment pulls code from this central repository to ensure consistency between local and cloud environments.

## Cloud Server Directory Structure

The following directory structure represents the current layout on the cloud server:

```
root@iZk1aapxncocjjkjzcagseZ:~/apps# tree -L 2
.
├── apps
├── backend
│   ├── alembic
│   ├── alembic.ini
│   ├── app
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── test.json
│   └── venv
├── frontend
│   ├── app
│   ├── context
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── eslint.config.mjs
│   ├── lib
│   ├── next.config.ts
│   ├── next-env.d.ts
│   ├── node_modules
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.mjs
│   ├── public
│   ├── README.md
│   └── tsconfig.json
├── infrastructure
│   ├── docker
│   └── README.md
└── nginx
    └── default.conf

15 directories, 17 files
```

This structure shows the main components of the deployed application:
- **backend**: Contains the FastAPI application with all necessary configuration files
- **frontend**: Contains the Next.js application with all necessary configuration files
- **infrastructure**: Contains Docker and deployment configurations
- **nginx**: Contains Nginx configuration for reverse proxy and load balancing
- **apps**: General directory for additional applications if needed

## Cloud Server Readiness Verification

Based on the current Docker container listing, the cloud server has the following containers running:

```
CONTAINER ID   IMAGE             COMMAND                  CREATED      STATUS      PORTS                                         NAMES
bb99ffb3265b   docker-backend    "uvicorn app.main:ap…"   2 days ago   Up 2 days   0.0.0.0:8000->8000/tcp, [::]:8000->8000/tcp   backend_prod
6cf5e7e59571   postgres:16       "docker-entrypoint.s…"   2 days ago   Up 2 days   5432/tcp                                      postgres_prod
8d804a397376   docker-frontend   "docker-entrypoint.s…"   2 days ago   Up 2 days   0.0.0.0:3000->3000/tcp, [::]:3000->3000/tcp   frontend_prod
```

To confirm the readiness of the cloud server, perform the following verification steps:

### 1. Service Health Status
Check if all services are responding correctly:

```bash
# Check if backend is responding
curl -X GET http://localhost:8000/health

# Check if frontend is accessible
curl -X GET http://localhost:3000/

# Check container status
docker ps
```

### 2. Database Connectivity
Verify the backend can connect to the PostgreSQL database:

```bash
# Access backend container
docker exec -it backend_prod bash

# Test database connection from within the container
python -c "
import psycopg2
import os
# Use the database connection details from environment or configuration
conn = psycopg2.connect(
    host='postgres_prod',  # or the correct host
    database='learning_platform',
    user='learning_user',
    password='MulaiBeraksi2024'  # Use the actual password
)
print('Database connection successful')
conn.close()
"
```

### 3. API Endpoint Responses
Test key API endpoints to ensure they're functioning:

```bash
# Test health endpoint
curl -X GET http://localhost:8000/health

# Test API endpoints
curl -X GET http://localhost:8000/api/users/me -H "Authorization: Bearer <valid_token>"

# Test if authentication endpoints are accessible
curl -X GET http://localhost:8000/docs  # Should return API documentation
```

### 4. Frontend Accessibility
Confirm the frontend is accessible and properly connected to the backend:

```bash
# Check if frontend is accessible
curl -I http://localhost:3000/

# Test frontend with a browser if possible
# Access http://<server-ip>:3000 in a web browser
```

### 5. Authentication Flow
Test the OAuth and login functionality:

```bash
# Test registration endpoint
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword"}'

# Test login endpoint
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword"}'
```

### 6. Environment Configuration
Verify all environment variables are properly set:

```bash
# Check backend environment variables
docker exec backend_prod env

# Check frontend environment variables
docker exec frontend_prod env

# Verify specific variables like database URLs, API keys, etc.
docker exec backend_prod printenv | grep -E "(DATABASE_URL|JWT_SECRET|OAUTH)"
```

### 7. Network Connectivity
Test connectivity between services:

```bash
# Test connectivity from backend to database
docker exec backend_prod ping postgres_prod

# Test connectivity to external services if needed
docker exec backend_prod curl -I https://www.google.com
```

### 8. Log Analysis
Review logs for any errors or warnings:

```bash
# Check backend logs
docker logs backend_prod

# Check frontend logs
docker logs frontend_prod

# Check database logs
docker logs postgres_prod

# Look for errors in the logs
docker logs backend_prod 2>&1 | grep -i error
docker logs backend_prod 2>&1 | grep -i exception
```

### 9. Resource Utilization
Check if containers have adequate resources:

```bash
# Check container resource usage
docker stats backend_prod frontend_prod postgres_prod

# Check system resources
docker exec backend_prod top -b -n 1
```

### 10. Security Settings
Ensure SSL certificates and security headers are properly configured:

```bash
# Check if HTTPS is properly configured (if applicable)
# If using a reverse proxy like nginx, check its configuration
docker exec nginx cat /etc/nginx/conf.d/default.conf

# Check security headers in HTTP response
curl -I http://localhost:3000/
```

### Readiness Checklist

To confirm the cloud server is ready for production, verify the following:

- [ ] All containers are running without restart loops
- [ ] Backend service is responding to health checks
- [ ] Database connection is established and stable
- [ ] API endpoints return expected responses
- [ ] Frontend is accessible and functional
- [ ] Authentication flow works correctly
- [ ] Environment variables are correctly configured
- [ ] No critical errors in logs
- [ ] Network connectivity between services is working
- [ ] SSL certificates are properly configured (if applicable)
- [ ] Resource usage is within acceptable limits
- [ ] Security settings are properly configured

When all these checks pass, the cloud server is confirmed to be ready for production use.

## Simplified Production Update Process

This section outlines the streamlined workflow for updating the production server. The process has been simplified to just four main steps:

### Step 1: Push Code from Local to GitHub

1. Navigate to your local project directory:
   ```bash
   cd C:\TRISNA\learning-platform
   ```

2. Verify your changes are working locally:
   ```bash
   # Test the application locally
   docker-compose -f infrastructure/local/docker-compose.yml up -d
   
   # Test API endpoints
   curl -X GET http://localhost:8000/health
   ```

3. Commit and push changes to GitHub:
   ```bash
   git add .
   git commit -m "Brief description of changes made"
   git push origin main
   ```

### Step 2: Pull Code from GitHub to Cloud

1. SSH into your production server:
   ```bash
   ssh user@your-server-ip
   ```

2. Navigate to the project directory on the cloud server:
   ```bash
   cd ~/apps
   ```

3. Pull the latest code from GitHub:
   ```bash
   git pull origin main
   ```

### Step 3: Run the Service

1. Check the current status of your containers:
   ```bash
   docker ps
   ```

2. If there are changes to the Docker images, rebuild them:
   ```bash
   # Rebuild Docker images if needed
   docker-compose -f infrastructure/local/docker-compose.yml build --no-cache
   
   # Or pull latest images if using pre-built images
   docker-compose -f infrastructure/local/docker-compose.yml pull
   ```

3. Apply any necessary database migrations:
   ```bash
   docker-compose -f infrastructure/local/docker-compose.yml run backend alembic upgrade head
   ```

4. Restart the services:
   ```bash
   docker-compose -f infrastructure/local/docker-compose.yml down
   docker-compose -f infrastructure/local/docker-compose.yml up -d
   ```

### Step 4: Go Live - Verification

1. Verify all services are running:
   ```bash
   docker-compose -f infrastructure/local/docker-compose.yml ps
   ```

2. Check service logs for any errors:
   ```bash
   docker-compose -f infrastructure/local/docker-compose.yml logs
   ```

3. Test the application endpoints:
   ```bash
   # Test health endpoint
   curl -X GET http://localhost:8000/health
   
   # Test frontend
   curl -X GET http://localhost:3000/
   ```

4. Verify the application is accessible externally:
   ```bash
   # Access your domain in a browser
   # Or test with curl from an external machine
   curl -I http://your-domain.com
   ```

### Quick Update Checklist

- [ ] Changes tested locally
- [ ] Code committed and pushed to GitHub
- [ ] Code pulled from GitHub to cloud server
- [ ] Services restarted with new code
- [ ] All containers running properly
- [ ] No errors in logs
- [ ] Application accessible externally
- [ ] API endpoints responding correctly

### Troubleshooting Quick Fixes

If services fail to start after an update:

1. Check logs for errors:
   ```bash
   docker-compose -f infrastructure/local/docker-compose.yml logs
   ```

2. If database migration is needed:
   ```bash
   docker-compose -f infrastructure/local/docker-compose.yml run backend alembic upgrade head
   ```

3. If containers are failing, try restarting them individually:
   ```bash
   docker-compose -f infrastructure/local/docker-compose.yml restart backend_prod
   docker-compose -f infrastructure/local/docker-compose.yml restart frontend_prod
   ```

This simplified process ensures that updates to the production environment can be made quickly and reliably with minimal steps.

## Requirements Gap Analysis

Before updating the production environment, it's important to identify potential gaps between the local development environment and the cloud production environment. This analysis helps ensure compatibility and prevent deployment issues.

### Local Environment Requirements Check

To check the requirements installed on your local machine (C:\TRISNA\learning-platform), run these commands:

1. **Check Node.js version**:
   ```bash
   node --version
   # Expected: Node.js 18.x or higher for Next.js 14
   ```

2. **Check npm version**:
   ```bash
   npm --version
   # Expected: npm 8.x or higher
   ```

3. **Check Python version**:
   ```bash
   python --version
   # Expected: Python 3.9 or higher for FastAPI
   ```

4. **Check Docker version**:
   ```bash
   docker --version
   # Expected: Docker 20.x or higher
   ```

5. **Check Docker Compose version**:
   ```bash
   docker-compose --version
   # Expected: Docker Compose v2.x
   ```

6. **Check installed Python packages**:
   ```bash
   pip list
   # Compare with backend/requirements.txt
   ```

7. **Check installed Node packages**:
   ```bash
   # In the frontend directory
   cd frontend
   npm list
   # Compare with frontend/package.json
   ```

### Cloud Environment Requirements Check

To check the requirements installed on the cloud server, run these commands:

1. **Check Node.js version on cloud**:
   ```bash
   # SSH to cloud server
   ssh user@your-server-ip
   
   # Navigate to frontend directory
   cd ~/apps/frontend
   
   # Check Node.js version
   node --version
   ```

2. **Check Python version on cloud**:
   ```bash
   # In the backend container
   docker exec -it backend_prod python --version
   ```

3. **Check Docker version on cloud**:
   ```bash
   docker --version
   ```

4. **Check installed Python packages on cloud**:
   ```bash
   docker exec -it backend_prod pip list
   # Compare with backend/requirements.txt
   ```

5. **Check installed Node packages on cloud**:
   ```bash
   docker exec -it frontend_prod npm list
   # Compare with frontend/package.json
   ```

### Common Requirement Gaps and Solutions

| Requirement | Local Version | Cloud Version | Action Required |
|-------------|---------------|---------------|-----------------|
| Node.js | 20.10.0 | 18.17.0 | Update cloud Node.js version in Dockerfile |
| Python | 3.11.5 | 3.9.16 | Update cloud Python version in Dockerfile |
| PostgreSQL | 16.0 | 16.0 | ✅ No action needed |
| Docker | 24.0.5 | 24.0.5 | ✅ No action needed |

### Version Compatibility Check

1. **Check Node.js compatibility**:
   ```bash
   # In your local frontend directory
   cd C:\TRISNA\learning-platform\frontend
   node -e "console.log('Node.js version:', process.version)"
   ```

2. **Check Python compatibility**:
   ```bash
   # In your local backend directory
   cd C:\TRISNA\learning-platform\backend
   python -c "import sys; print('Python version:', sys.version)"
   ```

3. **Compare package.json dependencies**:
   ```bash
   # Local
   cd C:\TRISNA\learning-platform\frontend
   type package.json | findstr version
   
   # Cloud (from container)
   docker exec frontend_prod cat package.json | grep version
   ```

4. **Compare requirements.txt dependencies**:
   ```bash
   # Local
   type C:\TRISNA\learning-platform\backend\requirements.txt
   
   # Cloud
   docker exec backend_prod cat requirements.txt
   ```

### Environment Variables Gap Analysis

Check for missing or different environment variables between local and cloud:

1. **Local environment variables**:
   ```bash
   # In your local directories
   cd C:\TRISNA\learning-platform
   type .envs\local\.env
   ```

2. **Cloud environment variables**:
   ```bash
   # Check cloud environment variables
   docker exec backend_prod env
   docker exec frontend_prod env
   ```

3. **Compare environment variables**:
   ```bash
   # Check specific variables
   docker exec backend_prod printenv | grep -E "(DATABASE_URL|JWT_SECRET|OAUTH)"
   ```

### Verification Commands

Run these commands to verify both environments are aligned:

1. **Local verification**:
   ```bash
   # Check local Docker services
   cd C:\TRISNA\learning-platform
   docker-compose -f infrastructure/local/docker-compose.yml ps
   
   # Test local API
   curl -X GET http://localhost:8000/health
   ```

2. **Cloud verification**:
   ```bash
   # Check cloud Docker services
   docker-compose -f infrastructure/local/docker-compose.yml ps
   
   # Test cloud API
   curl -X GET http://localhost:8000/health
   ```

### Update Strategy for Requirement Gaps

If there are requirement gaps between local and cloud environments:

1. **Minor version differences**: Usually safe to proceed with updates
2. **Major version differences**: Update Dockerfiles to align versions
3. **Missing dependencies**: Add to requirements.txt or package.json
4. **Environment variable differences**: Update cloud environment configuration

### Step-by-Step Requirements Gap Analysis Process

To systematically check for requirements gaps between local and cloud environments:

1. **Document Current Versions**:
   - Create a table listing all technology versions in both environments
   - Include Node.js, Python, Docker, database versions, etc.
   - Note any differences between local and cloud

   **Local Commands:**
   ```bash
   # Check all versions locally
   echo "=== Local Environment Versions ==="
   echo "Node.js: $(node --version)"
   echo "NPM: $(npm --version)"
   echo "Python: $(python --version)"
   echo "Docker: $(docker --version)"
   echo "Docker Compose: $(docker-compose --version)"
   echo "Git: $(git --version)"
   
   # Check backend dependencies
   cd backend
   echo "Python packages:"
   pip list
   cd ..
   
   # Check frontend dependencies
   cd frontend
   echo "Node packages:"
   npm list --depth=0
   cd ..
   ```

   **Cloud Commands:**
   ```bash
   # SSH to cloud server and check versions
   ssh user@your-server-ip
   
   echo "=== Cloud Environment Versions ==="
   echo "Node.js: $(node --version)"
   echo "NPM: $(npm --version)"
   echo "Python: $(python --version)"
   echo "Docker: $(docker --version)"
   echo "Docker Compose: $(docker-compose --version)"
   echo "Git: $(git --version)"
   
   # Check backend container versions
   docker exec -it backend_prod bash -c "python --version && pip list"
   
   # Check frontend container versions
   docker exec -it frontend_prod bash -c "node --version && npm list --depth=0"
   ```

2. **Compare Dependencies**:
   - Compare package.json versions between local and cloud
   - Compare requirements.txt versions between local and cloud
   - Identify any missing or different dependencies

   **Local Commands:**
   ```bash
   # Navigate to project root
   cd C:\TRISNA\learning-platform
   
   # Compare backend requirements
   echo "Local backend requirements:"
   type backend\requirements.txt
   
   # Compare frontend package.json
   echo "Local frontend package.json:"
   type frontend\package.json
   
   # Check specific dependency versions
   cd backend
   pip show fastapi uvicorn sqlalchemy psycopg2-binary python-multipart python-jose[cryptography] passlib[bcrypt] python-dotenv
   cd ..
   
   cd frontend
   npm list next react react-dom typescript @types/react @types/node
   cd ..
   ```

   **Cloud Commands:**
   ```bash
   # SSH to cloud server
   ssh user@your-server-ip
   
   # Navigate to project directory
   cd ~/apps
   
   # Check backend dependencies in container
   docker exec -it backend_prod pip list
   docker exec -it backend_prod pip show fastapi uvicorn sqlalchemy psycopg2-binary python-multipart python-jose[cryptography] passlib[bcrypt] python-dotenv
   
   # Check frontend dependencies in container
   docker exec -it frontend_prod npm list --depth=0
   docker exec -it frontend_prod npm list next react react-dom typescript @types/react @types/node
   
   # Compare with files in the project
   cat backend/requirements.txt
   cat frontend/package.json
   ```

3. **Test Compatibility**:
   - Run the same test commands in both environments
   - Verify that the application starts correctly in both environments
   - Check for any version-related errors

   **Local Commands:**
   ```bash
   # Navigate to project root
   cd C:\TRISNA\learning-platform
   
   # Start services using docker-compose
   docker-compose -f infrastructure/local/docker-compose.yml up -d
   
   # Wait for services to start
   timeout 30
   
   # Test backend health
   curl -X GET http://localhost:8000/health
   
   # Test frontend accessibility
   curl -X GET http://localhost:3000/
   
   # Check service logs
   docker-compose -f infrastructure/local/docker-compose.yml logs
   
   # Run backend tests if available
   docker-compose -f infrastructure/local/docker-compose.yml run backend python -m pytest
   
   # Stop services
   docker-compose -f infrastructure/local/docker-compose.yml down
   ```

   **Cloud Commands:**
   ```bash
   # SSH to cloud server
   ssh user@your-server-ip
   
   # Navigate to project directory
   cd ~/apps
   
   # Check running services
   docker-compose -f infrastructure/local/docker-compose.yml ps
   
   # Test backend health
   curl -X GET http://localhost:8000/health
   
   # Test frontend accessibility
   curl -X GET http://localhost:3000/
   
   # Check service logs
   docker-compose -f infrastructure/local/docker-compose.yml logs
   
   # Test database connectivity from backend container
   docker exec -it backend_prod python -c "
   import psycopg2
   import os
   try:
       conn = psycopg2.connect(
           host=os.getenv('DB_HOST', 'postgres_prod'),
           database=os.getenv('DB_NAME', 'learning_platform'),
           user=os.getenv('DB_USER', 'learning_user'),
           password=os.getenv('DB_PASSWORD', 'MulaiBeraksi2024')
       )
       print('Database connection successful')
       conn.close()
   except Exception as e:
       print(f'Database connection failed: {e}')
   "
   ```

4. **Validate Environment Variables**:
   - Compare all environment variables between local and cloud
   - Ensure all required variables are present in both environments
   - Verify that sensitive variables are properly secured

   **Local Commands:**
   ```bash
   # Navigate to project root
   cd C:\TRISNA\learning-platform
   
   # Check local environment files
   echo "Local .env files:"
   type .envs\local\.env
   type backend\.env
   type frontend\.env
   
   # Check environment variables in running containers
   # First, start the services
   docker-compose -f infrastructure/local/docker-compose.yml up -d
   
   # Check backend environment variables
   docker exec -it backend_prod env | grep -E "(DB_|JWT_|OAUTH_|SECRET_|API_)"
   
   # Check frontend environment variables
   docker exec -it frontend_prod env | grep -E "(NEXT_|API_|OAUTH_)"
   
   # Stop services
   docker-compose -f infrastructure/local/docker-compose.yml down
   ```

   **Cloud Commands:**
   ```bash
   # SSH to cloud server
   ssh user@your-server-ip
   
   # Navigate to project directory
   cd ~/apps
   
   # Check environment variables in running containers
   docker exec -it backend_prod env | grep -E "(DB_|JWT_|OAUTH_|SECRET_|API_)"
   docker exec -it frontend_prod env | grep -E "(NEXT_|API_|OAUTH_)"
   
   # Check environment files
   ls -la .env*
   cat .env 2>/dev/null || echo "No .env file found"
   
   # Check docker-compose environment configurations
   cat docker-compose.yml | grep -A 10 -B 10 environment
   ```

5. **Run Integration Tests**:
   - Execute API tests in both environments
   - Verify database connectivity in both environments
   - Test all critical functionality in both environments

   **Local Commands:**
   ```bash
   # Navigate to project root
   cd C:\TRISNA\learning-platform
   
   # Start all services
   docker-compose -f infrastructure/local/docker-compose.yml up -d
   
   # Wait for services to be ready
   timeout 30
   
   # Test API endpoints
   echo "Testing health endpoint:"
   curl -X GET http://localhost:8000/health
   
   echo "Testing API documentation:"
   curl -X GET http://localhost:8000/docs
   
   # Test database migration
   docker-compose -f infrastructure/local/docker-compose.yml run backend alembic check
   
   # Test user registration flow (if applicable)
   curl -X POST http://localhost:8000/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"testpassword","first_name":"Test","last_name":"User"}'
   
   # Check all service logs for errors
   docker-compose -f infrastructure/local/docker-compose.yml logs --tail=50
   
   # Stop services
   docker-compose -f infrastructure/local/docker-compose.yml down
   ```

   **Cloud Commands:**
   ```bash
   # SSH to cloud server
   ssh user@your-server-ip
   
   # Navigate to project directory
   cd ~/apps
   
   # Check service status
   docker-compose -f infrastructure/local/docker-compose.yml ps
   
   # Test API endpoints
   echo "Testing health endpoint:"
   curl -X GET http://localhost:8000/health
   
   echo "Testing API documentation:"
   curl -X GET http://localhost:8000/docs
   
   # Test database connectivity
   docker exec -it backend_prod python -c "
   from sqlalchemy import create_engine
   import os
   
   DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://learning_user:MulaiBeraksi2024@postgres_prod:5432/learning_platform')
   try:
       engine = create_engine(DATABASE_URL)
       conn = engine.connect()
       print('Database connection successful')
       conn.close()
   except Exception as e:
       print(f'Database connection failed: {e}')
   "
   
   # Check logs for errors
   docker-compose -f infrastructure/local/docker-compose.yml logs --tail=50
   
   # Run any pending migrations
   docker-compose -f infrastructure/local/docker-compose.yml run backend alembic check
   ```

6. **Document Findings**:
   - List all identified gaps
   - Prioritize gaps by severity
   - Plan remediation steps for each gap

   **Local Commands:**
   ```bash
   # Create a requirements gap report
   cd C:\TRISNA\learning-platform
   
   # Create report directory if it doesn't exist
   mkdir -p reports
   
   # Generate local environment report
   echo "Requirements Gap Analysis Report - Local Environment" > reports\requirements_gap_report.txt
   echo "Generated on: $(date)" >> reports\requirements_gap_report.txt
   echo "" >> reports\requirements_gap_report.txt
   
   echo "Local Versions:" >> reports\requirements_gap_report.txt
   echo "Node.js: $(node --version)" >> reports\requirements_gap_report.txt
   echo "NPM: $(npm --version)" >> reports\requirements_gap_report.txt
   echo "Python: $(python --version)" >> reports\requirements_gap_report.txt
   echo "Docker: $(docker --version)" >> reports\requirements_gap_report.txt
   echo "Docker Compose: $(docker-compose --version)" >> reports\requirements_gap_report.txt
   echo "" >> reports\requirements_gap_report.txt
   
   echo "Backend Requirements:" >> reports\requirements_gap_report.txt
   type backend\requirements.txt >> reports\requirements_gap_report.txt
   echo "" >> reports\requirements_gap_report.txt
   
   echo "Frontend Dependencies:" >> reports\requirements_gap_report.txt
   cd frontend
   npm list --depth=0 >> ../reports\requirements_gap_report.txt
   cd ..
   echo "" >> reports\requirements_gap_report.txt
   
   echo "Local Environment Variables:" >> reports\requirements_gap_report.txt
   type .envs\local\.env >> reports\requirements_gap_report.txt
   echo "" >> reports\requirements_gap_report.txt
   
   echo "Report saved to: reports\requirements_gap_report.txt"
   ```

   **Cloud Commands:**
   ```bash
   # SSH to cloud server
   ssh user@your-server-ip
   
   # Navigate to project directory
   cd ~/apps
   
   # Create report directory if it doesn't exist
   mkdir -p reports
   
   # Generate cloud environment report
   echo "Requirements Gap Analysis Report - Cloud Environment" > reports/requirements_gap_report.txt
   echo "Generated on: $(date)" >> reports/requirements_gap_report.txt
   echo "" >> reports/requirements_gap_report.txt
   
   echo "Cloud Versions:" >> reports/requirements_gap_report.txt
   echo "Node.js: $(node --version)" >> reports/requirements_gap_report.txt
   echo "NPM: $(npm --version)" >> reports/requirements_gap_report.txt
   echo "Python: $(python --version)" >> reports/requirements_gap_report.txt
   echo "Docker: $(docker --version)" >> reports/requirements_gap_report.txt
   echo "Docker Compose: $(docker-compose --version)" >> reports/requirements_gap_report.txt
   echo "" >> reports/requirements_gap_report.txt
   
   echo "Backend Container Versions:" >> reports/requirements_gap_report.txt
   docker exec -it backend_prod bash -c "python --version" >> reports/requirements_gap_report.txt
   docker exec -backend_prod pip list >> reports/requirements_gap_report.txt
   echo "" >> reports/requirements_gap_report.txt
   
   echo "Frontend Container Versions:" >> reports/requirements_gap_report.txt
   docker exec -it frontend_prod bash -c "node --version" >> reports/requirements_gap_report.txt
   docker exec -it frontend_prod npm list --depth=0 >> reports/requirements_gap_report.txt
   echo "" >> reports/requirements_gap_report.txt
   
   echo "Cloud Environment Variables:" >> reports/requirements_gap_report.txt
   docker exec -it backend_prod env | grep -E "(DB_|JWT_|OAUTH_|SECRET_|API_)" >> reports/requirements_gap_report.txt
   docker exec -it frontend_prod env | grep -E "(NEXT_|API_|OAUTH_)" >> reports/requirements_gap_report.txt
   echo "" >> reports/requirements_gap_report.txt
   
   echo "Report saved to: ~/apps/reports/requirements_gap_report.txt"
   ```

This analysis helps ensure smooth updates between local and cloud environments by identifying potential compatibility issues before deployment.

### Solutions for Missing Requirements

When validation identifies missing requirements, follow these solutions to address them:

1. **Missing Node.js**:
   - **Local (Windows)**:
     ```bash
     # Execute from: C:\ (or any directory)
     # Download and install Node.js from https://nodejs.org/
     # Or using Chocolatey (execute from: C:\):
     choco install nodejs
     # Verify installation (execute from: C:\TRISNA\learning-platform):
     cd C:\TRISNA\learning-platform
     node --version
     npm --version
     ```
   - **Cloud (Linux)**:
     ```bash
     # Execute from: SSH session on cloud server
     # Update package list
     sudo apt update
     # Install NodeSource repository
     curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
     # Install Node.js
     sudo apt install -y nodejs
     # Verify installation (execute from: ~/apps directory):
     cd ~/apps
     node --version
     npm --version
     ```

2. **Missing Python**:
   - **Local (Windows)**:
     ```bash
     # Execute from: C:\ (or any directory)
     # Download and install from https://www.python.org/
     # Or using Chocolatey (execute from: C:\):
     choco install python
     # Verify installation (execute from: C:\TRISNA\learning-platform):
     cd C:\TRISNA\learning-platform
     python --version
     pip --version
     ```
   - **Cloud (Linux)**:
     ```bash
     # Execute from: SSH session on cloud server
     # Update package list
     sudo apt update
     # Install Python and pip
     sudo apt install -y python3 python3-pip
     # Create python alias
     sudo ln -sf python3 /usr/bin/python
     sudo ln -sf pip3 /usr/bin/pip
     # Verify installation (execute from: ~/apps directory):
     cd ~/apps
     python --version
     pip --version
     ```

3. **Missing Docker**:
   - **Local (Windows)**:
     ```bash
     # Execute from: C:\ (or any directory)
     # Install Docker Desktop for Windows from https://www.docker.com/products/docker-desktop
     # Or using Chocolatey (execute from: C:\):
     choco install docker-desktop
     # Start Docker Desktop
     # Verify installation (execute from: C:\TRISNA\learning-platform):
     cd C:\TRISNA\learning-platform
     docker --version
     docker-compose --version
     ```
   - **Cloud (Linux)**:
     ```bash
     # Execute from: SSH session on cloud server
     # Update package list
     sudo apt update
     # Install Docker prerequisites
     sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
     # Add Docker's official GPG key
     curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
     # Set up the repository
     echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
     # Update package list again
     sudo apt update
     # Install Docker Engine
     sudo apt install -y docker-ce docker-ce-cli containerd.io
     # Install Docker Compose
     sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
     sudo chmod +x /usr/local/bin/docker-compose
     # Add current user to docker group
     sudo usermod -aG docker $USER
     # Verify installation (execute from: ~/apps directory):
     cd ~/apps
     docker --version
     docker-compose --version
     # Log out and log back in for group changes to take effect
     ```

4. **Missing Dependencies in package.json**:
   - **Local**:
     ```bash
     # Execute from: C:\TRISNA\learning-platform
     # Navigate to frontend directory
     cd C:\TRISNA\learning-platform\frontend
     # Install missing dependencies
     npm install
     # Or install specific missing package
     npm install package-name
     # Update package-lock.json
     npm install
     ```
   - **Cloud**:
     ```bash
     # Execute from: SSH session on cloud server
     # Navigate to project directory
     cd ~/apps/frontend
     # Install missing dependencies
     npm install
     # Or install specific missing package
     npm install package-name
     # If using Docker containers, install in the container
     docker exec -it frontend_prod npm install
     ```

5. **Missing Dependencies in requirements.txt**:
   - **Local**:
     ```bash
     # Execute from: C:\TRISNA\learning-platform
     # Navigate to backend directory
     cd C:\TRISNA\learning-platform\backend
     # Install missing dependencies
     pip install -r requirements.txt
     # Or install specific missing package
     pip install package-name
     # If using virtual environment
     python -m venv .venv
     .venv\Scripts\activate
     pip install -r requirements.txt
     ```
   - **Cloud**:
     ```bash
     # Execute from: SSH session on cloud server
     # Navigate to project directory
     cd ~/apps/backend
     # Install missing dependencies
     pip install -r requirements.txt
     # Or install specific missing package
     pip install package-name
     # If using Docker containers, install in the container
     docker exec -it backend_prod pip install -r requirements.txt
     ```

6. **Missing Environment Variables**:
   - **Local**:
     ```bash
     # Execute from: C:\TRISNA\learning-platform
     # Create .env file in the appropriate directory
     cd C:\TRISNA\learning-platform
     # Create or update .env file
     echo "DATABASE_URL=postgresql://user:password@localhost:5432/dbname" > .env
     echo "JWT_SECRET_KEY=your-secret-key" >> .env
     echo "OAUTH_GOOGLE_CLIENT_ID=your-client-id" >> .env
     echo "OAUTH_GOOGLE_CLIENT_SECRET=your-client-secret" >> .env
     # For backend specifically (execute from: C:\TRISNA\learning-platform\backend)
     cd backend
     echo "DATABASE_URL=postgresql://user:password@localhost:5432/dbname" > .env
     # For frontend specifically (execute from: C:\TRISNA\learning-platform\frontend)
     cd ../frontend
     echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env
     ```
   - **Cloud**:
     ```bash
     # Execute from: SSH session on cloud server
     # Navigate to project directory
     cd ~/apps
     # Create or update .env file with production values
     cat >> .env << EOF
     DATABASE_URL=postgresql://learning_user:MulaiBeraksi2024@postgres_prod:5432/learning_platform
     JWT_SECRET_KEY=your-production-secret-key
     OAUTH_GOOGLE_CLIENT_ID=your-production-client-id
     OAUTH_GOOGLE_CLIENT_SECRET=your-production-client-secret
     EOF
     # For Docker containers, update docker-compose.yml
     # Add environment variables to the services section
     # Then restart services
     docker-compose -f infrastructure/local/docker-compose.yml down
     docker-compose -f infrastructure/local/docker-compose.yml up -d
     ```

7. **Missing Database**:
   - **Local**:
     ```bash
     # Execute from: C:\TRISNA\learning-platform
     # Install PostgreSQL locally
     # Using Chocolatey on Windows (execute from: C:\):
     choco install postgresql
     # Start PostgreSQL service
     # Create database (execute from: C:\TRISNA\learning-platform)
     psql -U postgres -c "CREATE DATABASE learning_platform;"
     psql -U postgres -c "CREATE USER learning_user WITH PASSWORD 'MulaiBeraksi2024';"
     psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE learning_platform TO learning_user;"
     # Run database migrations (execute from: C:\TRISNA\learning-platform)
     cd C:\TRISNA\learning-platform
     docker-compose -f infrastructure/local/docker-compose.yml run backend alembic upgrade head
     ```
   - **Cloud**:
     ```bash
     # Execute from: SSH session on cloud server
     # If using Docker container (recommended) (execute from: ~/apps)
     cd ~/apps
     # Ensure PostgreSQL container is running
     docker-compose -f infrastructure/local/docker-compose.yml up -d postgres_prod
     # Run database migrations
     docker-compose -f infrastructure/local/docker-compose.yml run backend alembic upgrade head
     # If setting up a new database instance on cloud provider
     # Follow your cloud provider's documentation for PostgreSQL setup
     # Update connection strings accordingly
     ```

8. **Missing Redis**:
   - **Local**:
     ```bash
     # Execute from: C:\TRISNA\learning-platform
     # Install Redis locally
     # Using Chocolatey on Windows (execute from: C:\):
     choco install redis
     # Start Redis service
     # Or using Docker (execute from: C:\TRISNA\learning-platform):
     docker run -d -p 6379:6379 --name redis_local redis:latest
     # Update application configuration to point to local Redis
     ```
   - **Cloud**:
     ```bash
     # Execute from: SSH session on cloud server
     # Add Redis service to docker-compose if not present (execute from: ~/apps)
     cd ~/apps
     # Update docker-compose.yml to include Redis
     # Or use cloud provider's Redis service (e.g., AWS ElastiCache, Azure Cache)
     # Update application configuration to point to cloud Redis
     # Restart services
     docker-compose -f infrastructure/local/docker-compose.yml down
     docker-compose -f infrastructure/local/docker-compose.yml up -d
     ```

9. **Missing Git**:
   - **Local (Windows)**:
     ```bash
     # Execute from: C:\ (or any directory)
     # Download and install from https://git-scm.com/
     # Or using Chocolatey (execute from: C:\):
     choco install git
     # Verify installation (execute from: C:\TRISNA\learning-platform):
     cd C:\TRISNA\learning-platform
     git --version
     ```
   - **Cloud (Linux)**:
     ```bash
     # Execute from: SSH session on cloud server
     # Update package list
     sudo apt update
     # Install Git
     sudo apt install -y git
     # Configure Git (optional but recommended) (execute from: ~)
     git config --global user.name "Your Name"
     git config --global user.email "your.email@example.com"
     # Verify installation (execute from: ~/apps):
     cd ~/apps
     git --version
     ```

10. **Permission Issues**:
    - **Local**:
      ```bash
      # Execute from: C:\TRISNA\learning-platform
      # For Windows, run command prompt as administrator when needed
      # For file permissions, ensure you have write access to the project directory
      # Check current user permissions (execute from: C:\TRISNA\learning-platform)
      cd C:\TRISNA\learning-platform
      icacls C:\TRISNA\learning-platform /T
      ```
    - **Cloud**:
      ```bash
      # Execute from: SSH session on cloud server
      # Fix ownership of project directory (execute from: ~)
      sudo chown -R $USER:$USER ~/apps
      # Fix permissions if needed (execute from: ~)
      chmod -R 755 ~/apps
      # For Docker group access (if Docker commands fail)
      sudo usermod -aG docker $USER
      # Log out and log back in for changes to take effect
      ```

### Verification and Alignment of Dependencies

After running the requirements gap analysis, you may find discrepancies between the expected dependencies in your project files and what's actually installed in the containers. Based on the cloud logs you provided, there are some missing packages that should be installed according to the requirements.txt file.

To ensure all dependencies and requirements are aligned between your local environment and the cloud environment:

1. **Identify Missing Dependencies**:
   Based on your cloud logs, the following packages from requirements.txt are missing in the backend container:
   - python-multipart
   - passlib[bcrypt] (showing as just passlib)
   - python-jose[cryptography] (showing as just python-jose)

2. **Install Missing Dependencies in Backend Container**:
   Execute from: SSH session on cloud server
   ```bash
   # Navigate to the project directory
   cd ~/apps
   
   # Install missing dependencies directly in the backend container
   docker exec -it backend_prod pip install python-multipart passlib[bcrypt] python-jose[cryptography]
   
   # Verify the installation
   docker exec -it backend_prod pip show python-multipart passlib python-jose
   ```

3. **Rebuild Backend Container with Updated Dependencies**:
   Execute from: SSH session on cloud server
   ```bash
   # Navigate to the project directory
   cd ~/apps
   
   # Stop the current backend container
   docker-compose -f infrastructure/local/docker-compose.yml stop backend_prod
   
   # Rebuild the backend container to ensure all dependencies from requirements.txt are installed
   docker-compose -f infrastructure/local/docker-compose.yml build --no-cache backend_prod
   
   # Start the services again
   docker-compose -f infrastructure/local/docker-compose.yml up -d
   ```

4. **Verify All Dependencies Are Present**:
   Execute from: SSH session on cloud server
   ```bash
   # Check all installed packages in backend container
   docker exec -it backend_prod pip list
   
   # Verify specific packages needed for your application
   docker exec -it backend_prod pip show fastapi uvicorn sqlalchemy psycopg2-binary python-multipart python-jose passlib bcrypt
   
   # Check frontend dependencies as well
   docker exec -it frontend_prod npm list --depth=0
   ```

5. **Compare with Local Environment**:
   Execute from: C:\TRISNA\learning-platform
   ```bash
   # Check local backend requirements
   cd C:\TRISNA\learning-platform\backend
   pip list | findstr -i "fastapi uvicorn sqlalchemy psycopg2-binary python-multipart python-jose passlib bcrypt"
   
   # Check local frontend requirements
   cd C:\TRISNA\learning-platform\frontend
   npm list --depth=0 | findstr -i "next react react-dom typescript"
   ```

6. **Update Docker Images if Needed**:
   Execute from: SSH session on cloud server
   ```bash
   # Navigate to the project directory
   cd ~/apps
   
   # If dependencies are still not aligned, rebuild both containers
   docker-compose -f infrastructure/local/docker-compose.yml down
   docker-compose -f infrastructure/local/docker-compose.yml build --no-cache
   docker-compose -f infrastructure/local/docker-compose.yml up -d
   
   # Verify the services are running properly after rebuild
   docker-compose -f infrastructure/local/docker-compose.yml ps
   docker-compose -f infrastructure/local/docker-compose.yml logs --tail=20
   ```

7. **Run Application Tests to Confirm Alignment**:
   Execute from: SSH session on cloud server
   ```bash
   # Navigate to the project directory
   cd ~/apps
   
   # Test the backend health endpoint
   curl -X GET http://localhost:8000/health
   
   # Check backend logs for any dependency-related errors
   docker-compose -f infrastructure/local/docker-compose.yml logs backend_prod | grep -i error
   
   # Test basic API functionality
   curl -X GET http://localhost:8000/docs
   ```

By following these steps, you can ensure that all dependencies and requirements are properly aligned between your local development environment and the cloud deployment. This is especially important when you notice discrepancies like the missing packages identified in your cloud logs.

### Environment Variable (.env) Configuration and Adjustment

Proper configuration of environment variables is crucial for both local development and cloud deployment. Here's how to properly adjust .env files for each environment:

1. **Local Environment (.env) Setup**:
   Execute from: C:\TRISNA\learning-platform
   ```bash
   # Navigate to the project root
   cd C:\TRISNA\learning-platform
   
   # Create or update the local .env file
   echo "DATABASE_URL=postgresql://learning_user:MulaiBeraksi2024@localhost:5432/learning_platform" > .env
   echo "JWT_SECRET_KEY=your-local-jwt-secret-key" >> .env
   echo "JWT_ALGORITHM=HS256" >> .env
   echo "JWT_EXPIRATION=3600" >> .env
   echo "OAUTH_GOOGLE_CLIENT_ID=your-local-google-client-id" >> .env
   echo "OAUTH_GOOGLE_CLIENT_SECRET=your-local-google-client-secret" >> .env
   echo "OAUTH_MICROSOFT_CLIENT_ID=your-local-microsoft-client-id" >> .env
   echo "OAUTH_MICROSOFT_CLIENT_SECRET=your-local-microsoft-client-secret" >> .env
   echo "FRONTEND_URL=http://localhost:3000" >> .env
   echo "REDIS_URL=redis://localhost:6379" >> .env
   ```

2. **Cloud Environment (.env) Setup**:
   Execute from: SSH session on cloud server
   ```bash
   # Navigate to the project directory
   cd ~/apps
   
   # Create or update the cloud .env file with production values
   cat > .env << EOF
   DATABASE_URL=postgresql://learning_user:MulaiBeraksi2024@postgres_prod:5432/learning_platform
   JWT_SECRET_KEY=your-production-jwt-secret-key
   JWT_ALGORITHM=HS256
   JWT_EXPIRATION=3600
   OAUTH_GOOGLE_CLIENT_ID=your-production-google-client-id
   OAUTH_GOOGLE_CLIENT_SECRET=your-production-google-client-secret
   OAUTH_MICROSOFT_CLIENT_ID=your-production-microsoft-client-id
   OAUTH_MICROSOFT_CLIENT_SECRET=your-production-microsoft-client-secret
   FRONTEND_URL=https://your-domain.com
   REDIS_URL=redis://redis_prod:6379
   EOF
   ```

3. **Backend-Specific Environment Variables**:
   Execute from: C:\TRISNA\learning-platform (for local) or ~/apps (for cloud)
   ```bash
   # For local backend
   cd C:\TRISNA\learning-platform\backend
   echo "DATABASE_URL=postgresql://learning_user:MulaiBeraksi2024@localhost:5432/learning_platform" > .env
   echo "JWT_SECRET_KEY=your-local-jwt-secret-key" >> .env
   
   # For cloud backend
   cd ~/apps/backend
   cat > .env << EOF
   DATABASE_URL=postgresql://learning_user:MulaiBeraksi2024@postgres_prod:5432/learning_platform
   JWT_SECRET_KEY=your-production-jwt-secret-key
   EOF
   ```

4. **Frontend-Specific Environment Variables**:
   Execute from: C:\TRISNA\learning-platform (for local) or ~/apps (for cloud)
   ```bash
   # For local frontend
   cd C:\TRISNA\learning-platform\frontend
   echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env
   echo "NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000" >> .env
   
   # For cloud frontend
   cd ~/apps/frontend
   cat > .env << EOF
   NEXT_PUBLIC_API_URL=https://your-domain.com/api
   NEXT_PUBLIC_FRONTEND_URL=https://your-domain.com
   EOF
   ```

5. **Security Considerations for Production**:
   When deploying to production, never store sensitive credentials directly in .env files that might be committed to version control. Instead:
   
   - Use cloud-specific secret management services (e.g., AWS Secrets Manager, Azure Key Vault, or Alibaba Cloud Parameter Store)
   - Store sensitive environment variables in your cloud platform's secure configuration system
   - For Docker containers, use Docker secrets or environment variables passed at runtime
   - Ensure that .env files are included in .gitignore to prevent committing secrets to the repository

6. **Verification of Environment Variables**:
   Execute from: SSH session on cloud server
   ```bash
   # Check environment variables in backend container
   docker exec -it backend_prod env | grep -E "(DATABASE_URL|JWT_SECRET_KEY|OAUTH)"
   
   # Check environment variables in frontend container
   docker exec -it frontend_prod env | grep -E "(NEXT_PUBLIC_API_URL|NEXT_PUBLIC_FRONTEND_URL)"
   
   # Verify that sensitive variables are properly set
   docker exec -it backend_prod printenv | grep -E "(DB_|JWT_|OAUTH_|SECRET_)"
   ```

7. **Updating Environment Variables After Changes**:
   Execute from: SSH session on cloud server
   ```bash
   # After updating .env files, restart services to apply changes
   cd ~/apps
   docker-compose -f infrastructure/local/docker-compose.yml down
   docker-compose -f infrastructure/local/docker-compose.yml up -d
   
   # Verify the new environment variables are loaded
   docker-compose -f infrastructure/local/docker-compose.yml logs backend_prod | head -20
   ```

8. **OAuth Credentials Configuration**:
   For OAuth integration, ensure the following environment variables are properly configured:
   
   - Google OAuth: OAUTH_GOOGLE_CLIENT_ID and OAUTH_GOOGLE_CLIENT_SECRET
   - Microsoft OAuth: OAUTH_MICROSOFT_CLIENT_ID and OAUTH_MICROSOFT_CLIENT_SECRET
   - Make sure the redirect URIs in your OAuth provider settings match your deployment domain
   
   Execute from: C:\TRISNA\learning-platform (for local) or ~/apps (for cloud)
   ```bash
   # Verify OAuth credentials are set correctly
   # For local:
   cd C:\TRISNA\learning-platform
   type .envs\local\.env | findstr OAUTH
   
   # For cloud:
   cd ~/apps
   cat .env | grep OAUTH
   ```

Remember to always use strong, unique values for production environment variables, especially for JWT secrets and OAuth credentials. Never commit production secrets to version control systems.

### Cloud Environment Variable Management (No .env Files)

In cloud deployments, environment variables are managed differently than in local development. There is typically no .env file in the cloud environment. Instead, environment variables are handled through:

1. **Docker Compose Environment Configuration**:
   Execute from: SSH session on cloud server
   ```bash
   # Navigate to the project directory
   cd ~/apps
   
   # Check the current environment configuration in docker-compose.yml
   grep -A 20 -B 5 "environment:" docker-compose.yml
   
   # Example of how environment variables should be configured in docker-compose.yml
   # (This would be in your infrastructure/local/docker-compose.yml file)
   # services:
   #   backend:
   #     environment:
   #       - DATABASE_URL=postgresql://learning_user:MulaiBeraksi2024@postgres_prod:5432/learning_platform
   #       - JWT_SECRET_KEY=your-production-jwt-secret-key
   #       - OAUTH_GOOGLE_CLIENT_ID=your-production-google-client-id
   #       - OAUTH_GOOGLE_CLIENT_SECRET=your-production-google-client-secret
   #       - OAUTH_MICROSOFT_CLIENT_ID=your-production-microsoft-client-id
   #       - OAUTH_MICROSOFT_CLIENT_SECRET=your-production-microsoft-client-secret
   ```

2. **Cloud Provider Environment Management**:
   Execute from: SSH session on cloud server
   ```bash
   # For Alibaba Cloud, use Parameter Store or Environment Manager
   # Example of checking environment variables in the running container
   docker exec -it backend_prod env | grep -E "(DATABASE_URL|JWT_SECRET_KEY|OAUTH)"
   
   # Verify environment variables are properly set
   docker exec -it backend_prod printenv | grep -E "(DB_|JWT_|OAUTH_|SECRET_)"
   ```

3. **Docker Secrets (Alternative Approach)**:
   Execute from: SSH session on cloud server
   ```bash
   # Create Docker secrets for sensitive data (if using Docker Swarm)
   # This is an alternative to environment variables for sensitive data
   echo "your-production-jwt-secret-key" | docker secret create jwt_secret -
   echo "your-production-google-client-id" | docker secret create google_client_id -
   echo "your-production-google-client-secret" | docker secret create google_client_secret -
   
   # Note: This approach requires modifying docker-compose.yml to use secrets instead of environment variables
   ```

4. **Environment Variables in Docker Run Commands**:
   Execute from: SSH session on cloud server
   ```bash
   # Check how containers were started with environment variables
   docker inspect backend_prod | grep -i env
   
   # Example of how to recreate a container with specific environment variables
   docker run -d \
     --name backend_prod_updated \
     -e DATABASE_URL=postgresql://learning_user:MulaiBeraksi2024@postgres_prod:5432/learning_platform \
     -e JWT_SECRET_KEY=your-production-jwt-secret-key \
     -e OAUTH_GOOGLE_CLIENT_ID=your-production-google-client-id \
     -e OAUTH_GOOGLE_CLIENT_SECRET=your-production-google-client-secret \
     docker-backend:latest
   ```

5. **Updating Environment Variables in Cloud**:
   Execute from: SSH session on cloud server
   ```bash
   # To update environment variables, modify the docker-compose.yml file
   cd ~/apps
   
   # Stop the current services
   docker-compose -f infrastructure/local/docker-compose.yml down
   
   # After updating the docker-compose.yml file with new environment variables
   # Start the services again
   docker-compose -f infrastructure/local/docker-compose.yml up -d
   
   # Verify the environment variables are loaded correctly
   docker-compose -f infrastructure/local/docker-compose.yml logs backend_prod | head -20
   ```

6. **Best Practices for Cloud Environment Management**:
   - Never store .env files in the cloud file system
   - Use cloud provider's secure parameter management systems
   - Encrypt sensitive environment variables
   - Use separate environment configurations for different deployment stages (dev, staging, production)
   - Regularly rotate sensitive credentials
   - Ensure sensitive data is not logged or exposed in error messages

The key difference in cloud environments is that environment variables are managed through the deployment configuration (like docker-compose.yml) or cloud provider services rather than .env files.

### Production Environment Configuration Analysis

Based on the production configuration files in `C:\TRISNA\learning-platform\infrastructure\docker\`, here's how the cloud environment is actually configured:

1. **Docker Compose Production Configuration** (`docker-compose.prod.yml`):
   Execute from: SSH session on cloud server
   ```bash
   # The production compose file shows:
   # - Backend service uses an env_file to load variables from backend/.env
   # - Database service has environment variables defined directly in the compose file
   # - Frontend service does not have explicit environment variables defined
   
   # Check the actual production compose file
   cat ~/apps/docker-compose.yml  # or the actual deployed file
   
   # The backend service specifically references:
   # env_file:
   #   - ../../backend/.env
   ```

2. **Backend Dockerfile Configuration** (`Dockerfile.backend`):
   Execute from: C:\TRISNA\learning-platform (local) or SSH session on cloud server
   ```dockerfile
   FROM python:3.12-slim

   WORKDIR /app

   COPY backend/requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt

   COPY backend/app ./app
   COPY backend/alembic ./alembic
   COPY backend/alembic.ini .

   CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
   ```
   
   This Dockerfile copies the backend application files but does not explicitly handle environment variables within the image itself.

3. **Frontend Dockerfile Configuration** (`Dockerfile.frontend`):
   Execute from: C:\TRISNA\learning-platform (local) or SSH session on cloud server
   ```dockerfile
   FROM node:20-alpine

   WORKDIR /app

   COPY frontend/package*.json ./
   RUN npm install

   COPY frontend .
   RUN npm run build

   EXPOSE 3000
   CMD ["npm", "run", "start"]
   ```
   
   This Dockerfile builds the frontend application but does not handle environment variables at build time.

4. **Actual Environment Variable Loading in Production**:
   Execute from: SSH session on cloud server
   ```bash
   # In the production setup, environment variables are loaded via:
   # 1. The env_file directive in docker-compose.prod.yml for the backend
   #    which loads variables from ../../backend/.env
   
   # 2. Direct environment variables in the docker-compose.prod.yml for the database:
   #    environment:
   #      POSTGRES_DB: learning_platform
   #      POSTGRES_USER: learning_user
   #      POSTGRES_PASSWORD: MulaiBeraksi2024
   
   # Check what environment variables are actually available in the containers:
   docker exec -it backend_prod env
   docker exec -it postgres_prod env
   ```

5. **Proper Production Environment Variable Setup**:
   Execute from: SSH session on cloud server
   ```bash
   # For the production environment, you need to ensure the backend .env file exists
   # Navigate to the project root directory (where the compose file expects the .env file)
   cd ~/apps  # or wherever your compose file is located
   
   # Create the backend .env file that the compose file references
   cat > backend/.env << EOF
   DATABASE_URL=postgresql://learning_user:MulaiBeraksi2024@postgres_prod:5432/learning_platform
   JWT_SECRET_KEY=your-production-jwt-secret-key
   JWT_ALGORITHM=HS256
   JWT_EXPIRATION=3600
   OAUTH_GOOGLE_CLIENT_ID=your-production-google-client-id
   OAUTH_GOOGLE_CLIENT_SECRET=your-production-google-client-secret
   OAUTH_MICROSOFT_CLIENT_ID=your-production-microsoft-client-id
   OAUTH_MICROSOFT_CLIENT_SECRET=your-production-microsoft-client-secret
   FRONTEND_URL=https://your-domain.com
   REDIS_URL=redis://redis_prod:6379
   EOF
   
   # For security, set appropriate file permissions
   chmod 600 backend/.env
   ```

6. **Verification of Production Configuration**:
   Execute from: SSH session on cloud server
   ```bash
   # After setting up the environment variables, restart the services
   cd ~/apps
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.yml up -d
   
   # Verify that the backend can access the environment variables
   docker exec -it backend_prod env | grep -E "(DATABASE_URL|JWT_SECRET_KEY|OAUTH)"
   
   # Test that the backend can connect to the database
   docker exec -it backend_prod python -c "
   import os
   import psycopg2
   try:
       conn = psycopg2.connect(os.getenv('DATABASE_URL').replace('postgresql://', 'postgresql://', 1))
       print('Database connection successful')
       conn.close()
   except Exception as e:
       print(f'Database connection failed: {e}')
   "
   ```

The production environment uses the `env_file` directive in the docker-compose.prod.yml to load environment variables from a .env file, specifically referencing `../../backend/.env`. This is different from the local development approach and follows the security best practice of managing environment variables externally to the container image.

## Development Workflow: Local to Cloud

### Configuration Adjustments for Cloud Deployment

Before pushing local changes to the cloud environment, several configuration adjustments must be made to ensure the application works properly in the cloud environment:

1. **Environment Variables Configuration**:
   - Update `docker-compose.yml` to use production-ready settings
   - Adjust database connection strings to point to cloud RDS instance
   - Update Redis connection settings to point to cloud Redis instance
   - Modify API endpoints to reflect cloud URLs

2. **OAuth Provider Configuration**:
   - Update redirect URLs in OAuth provider settings (Google, Microsoft)
   - Ensure OAuth callback URLs match cloud domain
   - Update CORS settings to allow cloud domain

3. **Database Connection Settings**:
   - Update PostgreSQL connection parameters for cloud RDS
   - Ensure proper SSL settings for secure connection
   - Adjust connection pooling settings for production

4. **Security Settings**:
   - Update JWT secret keys for production
   - Ensure HTTPS-only settings for production
   - Configure proper session management for cloud environment

### Step-by-Step GitHub Workflow

#### 1. Local Development Process

1. Make changes to the codebase in your local development environment
2. Test the changes locally to ensure they work as expected
3. Commit changes to your local repository:
   ```bash
   git add .
   git commit -m "Description of changes made"
   ```

4. Push changes to the central GitHub repository:
   ```bash
   git push origin main
   ```

   **If you encounter the error `error: src refspec main does not match any`, it means your local repository is on a different branch (likely `master`) than the remote branch (`main`). To fix this issue:
   
   ```bash
   # Check current branch
   git branch
   
   # First, lets rename your local master branch to main:
   git branch -M main

   # If on master branch, switch to main
   git checkout -b main
   
   # Or if main branch already exists locally but is not checked out
   git checkout main
   
   # Set upstream to track the remote main branch
   git push -u origin main
   ```

#### 2. Cloud Environment Update Process

1. On the cloud server, navigate to the project directory:
   ```bash
   cd ~/apps
   ```

2. Pull the latest changes from GitHub:
   ```bash
   git pull origin main
   ```

3. If there are new dependencies or changes to Docker images:
   ```bash
   # Rebuild Docker images if needed
   docker-compose -f infrastructure/local/docker-compose.yml build --no-cache
   
   # Or pull latest images from container registry
   docker-compose -f infrastructure/local/docker-compose.yml pull
   ```

4. Apply any necessary database migrations:
   ```bash
   docker-compose -f infrastructure/local/docker-compose.yml run backend alembic upgrade head
   ```

5. Restart the services:
   ```bash
   docker-compose -f infrastructure/local/docker-compose.yml down
   docker-compose -f infrastructure/local/docker-compose.yml up -d
   ```

#### 3. Configuration Adjustments in Cloud

When pulling code from GitHub to the cloud environment, ensure the following configurations are properly set:

1. **Environment Variables**:
   - Ensure `.env` files in the cloud contain the correct production settings
   - Verify database URLs point to the cloud RDS instance
   - Confirm OAuth credentials are properly configured for production

2. **Database Migrations**:
   - Run any pending database migrations after code updates
   - Verify database schema is up-to-date with the application code

3. **Service Health Checks**:
   - Verify all services are running properly after updates
   - Check logs for any errors or warnings
   - Test API endpoints to ensure functionality

### Commands for Local-to-Cloud Deployment

#### Commands for Local Development:
```bash
# Test the application locally
docker-compose -f infrastructure/local/docker-compose.yml up -d

# Run database migrations locally
docker-compose -f infrastructure/local/docker-compose.yml run backend alembic upgrade head

# Check service logs
docker-compose -f infrastructure/local/docker-compose.yml logs -f

# Build and push Docker images to container registry
docker build -t learning-platform-backend:latest -f backend/Dockerfile .
docker build -t learning-platform-frontend:latest -f frontend/Dockerfile .
```

#### Commands for Cloud Deployment:
```bash
# Pull latest code from GitHub
git pull origin main

# Build updated Docker images
docker-compose -f infrastructure/local/docker-compose.yml build

# Apply database migrations
docker-compose -f infrastructure/local/docker-compose.yml run backend alembic upgrade head

# Restart services with new code
docker-compose -f infrastructure/local/docker-compose.yml down
docker-compose -f infrastructure/local/docker-compose.yml up -d

# Verify services are running
docker-compose -f infrastructure/local/docker-compose.yml ps

# Check logs for any issues
docker-compose -f infrastructure/local/docker-compose.yml logs
```

### Verification Steps

After deploying changes from local to cloud:

1. **Verify Service Status**:
   ```bash
   docker-compose -f infrastructure/local/docker-compose.yml ps
   ```

2. **Check Application Logs**:
   ```bash
   docker-compose -f infrastructure/local/docker-compose.yml logs backend
   docker-compose -f infrastructure/local/docker-compose.yml logs frontend
   ```

3. **Test API Endpoints**:
   ```bash
   curl -X GET http://localhost:8000/health
   curl -X GET http://localhost:8000/api/users/me
   ```

4. **Verify Database Connectivity**:
   ```bash
   docker-compose -f infrastructure/local/docker-compose.yml exec backend python -c "from app.db.session import get_db; next(get_db())"
   ```

5. **Test Authentication Flow**:
   - Test user registration and login
   - Verify OAuth integration works properly
   - Confirm session management functions correctly

This workflow ensures that changes made locally can be safely deployed to the cloud environment while maintaining the production-ready state of the application. The GitHub repository serves as the central source of truth, enabling consistent deployments across environments.

### Security Best Practices for Git Operations

When working with sensitive information like OAuth credentials, API keys, and database passwords, follow these security practices:

1. **Never Commit Sensitive Information**:
   Execute from: C:\TRISNA\learning-platform
   ```bash
   # If you've accidentally committed sensitive information, remove it from the repository history
   # First, ensure the sensitive files are in .gitignore
   git rm --cached .envs/local/.env backend/.env
   
   # Commit the removal
   git commit -m "Remove sensitive environment files from index"
   
   # If the sensitive information was committed in previous commits, use git filter-branch or BFG Repo-Cleaner
   # For .env files specifically:
   git filter-branch --force --index-filter "git rm --cached --ignore-unmatch .envs/local/.env backend/.env" --prune-empty --tag-name-filter cat -- --all
   ```

2. **Update .gitignore to Prevent Future Accidents**:
   Execute from: C:\TRISNA\learning-platform
   ```bash
   # Verify sensitive files are properly ignored
   cat .gitignore | findstr -i ".env\|\.envs\|\.env.*"
   
   # Add patterns to .gitignore if missing
   echo "# Environment files" >> .gitignore
   echo ".env" >> .gitignore
   echo ".envs/" >> .gitignore
   echo "backend/.env" >> .gitignore
   echo "frontend/.env" >> .gitignore
   ```

3. **Handle GitHub Secret Scanning Violations**:
   Execute from: C:\TRISNA\learning-platform
   ```bash
   # If you receive a secret scanning violation error like:
   # "Repository rule violations found for refs/heads/main"
   # "Push cannot contain secrets"
   # 
   # First, remove the sensitive information from the current commit
   git reset --soft HEAD~1
   
   # Add the sensitive files to .gitignore
   echo "# Environment files" >> .gitignore
   echo ".env" >> .gitignore
   echo ".envs/" >> .gitignore
   
   # Add files to git while respecting .gitignore
   git add .
   git commit -m "Add changes without sensitive environment files"
   
   # If the sensitive data was in previous commits, you may need to rewrite history
   # Use git filter-branch to remove the files from all commits:
   git filter-branch --force --tree-filter "rm -f .envs/local/.env backend/.env" --prune-empty HEAD
   ```

4. **Proper Management of Environment Variables**:
   Execute from: C:\TRISNA\learning-platform
   ```bash
   # Create a template for environment variables instead of actual values
   # Create .env.example as a template
   echo "# Database Configuration" > .env.example
   echo "DATABASE_URL=postgresql://username:password@localhost:5432/dbname" >> .env.example
   echo "# JWT Configuration" >> .env.example
   echo "JWT_SECRET_KEY=your_jwt_secret_key_here" >> .env.example
   echo "# OAuth Configuration" >> .env.example
   echo "OAUTH_GOOGLE_CLIENT_ID=your_google_client_id_here" >> .env.example
   echo "OAUTH_GOOGLE_CLIENT_SECRET=your_google_client_secret_here" >> .env.example
   echo "OAUTH_MICROSOFT_CLIENT_ID=your_microsoft_client_id_here" >> .env.example
   echo "OAUTH_MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret_here" >> .env.example
   
   # Add .env.example to version control (not the actual .env files)
   git add .env.example
   ```

5. **Recovering from Blocked Push**:
   Execute from: C:\TRISNA\learning-platform
   ```bash
   # If your push is blocked due to detected secrets:
   # 1. Remove sensitive files from git tracking
   git rm --cached .envs/local/.env backend/.env 2>/dev/null || echo "Files not tracked, continuing..."
   
   # 2. Update .gitignore to prevent future tracking
   echo ".env" >> .gitignore
   echo ".envs/" >> .gitignore
   
   # 3. Amend the last commit without the sensitive files
   git add .
   git commit --amend --no-edit
   
   # 4. Force push with lease (safer than plain force push)
   git push --force-with-lease origin main
   
   # 5. If the sensitive data is in older commits, you may need to use:
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .envs/local/.env backend/.env" \
     --prune-empty --tag-name-filter cat -- --all
   
   # 6. If you get a 'stale info' or 'rejected' error, first pull the remote changes
   git pull origin main --allow-unrelated-histories
   
   # 7. Then push the rewritten history
   git push --force-with-lease origin main
   ```

Remember: Never commit actual environment files with sensitive credentials to version control. Use the .env.example pattern and document how to set up environment variables separately for each deployment environment.