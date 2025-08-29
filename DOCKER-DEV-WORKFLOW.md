# Ballistics Calculator - Development Docker Workflow

## 🚀 Development Commands

### Start Development Environment
```bash
# Start all services in development mode
docker-compose -f docker-compose.dev.yml up

# Start with build (use when Dockerfile changes)
docker-compose -f docker-compose.dev.yml up --build

# Start in background (detached mode)
docker-compose -f docker-compose.dev.yml up -d
```

### Stop Development Environment
```bash
# Stop all services
docker-compose -f docker-compose.dev.yml down

# Stop and remove volumes (clean slate)
docker-compose -f docker-compose.dev.yml down -v

# Stop and remove everything (containers, networks, volumes)
docker-compose -f docker-compose.dev.yml down --volumes --remove-orphans
```

### View Logs
```bash
# View all logs (live tail)
docker-compose -f docker-compose.dev.yml logs -f

# View specific service logs
docker-compose -f docker-compose.dev.yml logs -f backend
docker-compose -f docker-compose.dev.yml logs -f frontend

# View last 50 lines of logs
docker-compose -f docker-compose.dev.yml logs --tail=50
```

### Restart Services
```bash
# Restart all services
docker-compose -f docker-compose.dev.yml restart

# Restart specific service
docker-compose -f docker-compose.dev.yml restart backend
docker-compose -f docker-compose.dev.yml restart frontend

# Rebuild and restart (when code changes don't auto-reload)
docker-compose -f docker-compose.dev.yml up --build --force-recreate
```

### Check Status
```bash
# Check running services
docker-compose -f docker-compose.dev.yml ps

# Check detailed status
docker-compose -f docker-compose.dev.yml ps -a
```

### Execute Commands in Containers
```bash
# Open bash in backend container
docker-compose -f docker-compose.dev.yml exec backend bash

# Open shell in frontend container
docker-compose -f docker-compose.dev.yml exec frontend sh

# Run one-off commands
docker-compose -f docker-compose.dev.yml exec backend python -m pytest
docker-compose -f docker-compose.dev.yml exec frontend npm test
```

### Development Debugging
```bash
# Install new packages in backend
docker-compose -f docker-compose.dev.yml exec backend pip install package-name

# Install new packages in frontend
docker-compose -f docker-compose.dev.yml exec frontend npm install package-name

# Run flake8 checks
docker-compose -f docker-compose.dev.yml exec backend python -m flake8 app/

# Run database migrations (if you add DB later)
docker-compose -f docker-compose.dev.yml exec backend python -m alembic upgrade head
```

### Complete Clean Rebuild
```bash
# Nuclear option - clean everything and start fresh
docker-compose -f docker-compose.dev.yml down --volumes --remove-orphans
docker system prune -f
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up
```

## 🌐 Development URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/health
