.PHONY: help install dev test clean build docker-dev docker-prod

# Default target
help:
	@echo "Available targets:"
	@echo "  install     - Install all dependencies"
	@echo "  dev         - Start development servers"
	@echo "  test        - Run all tests"
	@echo "  clean       - Clean up build artifacts"
	@echo "  build       - Build for production"
	@echo "  docker-dev  - Start with Docker (development)"
	@echo "  docker-prod - Start with Docker (production)"
	@echo "  lint        - Run linting on all code"
	@echo "  format      - Format all code"

# Install dependencies
install:
	@echo "Installing backend dependencies..."
	cd backend && pip install -r requirements-dev.txt
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

# Start development servers
dev:
	@echo "Starting development servers..."
	@echo "Backend will run on http://localhost:8000"
	@echo "Frontend will run on http://localhost:3000"
	@start /B cmd /c "cd backend && uvicorn app.main:app --reload --port 8000"
	@timeout /t 3
	cd frontend && npm run dev

# Run tests
test:
	@echo "Running backend tests..."
	cd backend && pytest tests/ -v
	@echo "Running frontend type check..."
	cd frontend && npm run type-check
	@echo "Running frontend linting..."
	cd frontend && npm run lint

# Clean up
clean:
	@echo "Cleaning up..."
	cd backend && if exist __pycache__ rmdir /s /q __pycache__
	cd backend && if exist .pytest_cache rmdir /s /q .pytest_cache
	cd backend && if exist htmlcov rmdir /s /q htmlcov
	cd frontend && if exist .next rmdir /s /q .next
	cd frontend && if exist node_modules rmdir /s /q node_modules

# Build for production
build:
	@echo "Building backend..."
	cd backend && pip install -r requirements.txt
	@echo "Building frontend..."
	cd frontend && npm run build

# Docker development
docker-dev:
	@echo "Starting Docker development environment..."
	docker-compose up --build

# Docker production
docker-prod:
	@echo "Starting Docker production environment..."
	docker-compose -f docker-compose.prod.yml up --build

# Linting
lint:
	@echo "Running backend linting..."
	cd backend && flake8 app/ tests/
	cd backend && black --check app/ tests/
	cd backend && isort --check-only app/ tests/
	@echo "Running frontend linting..."
	cd frontend && npm run lint

# Formatting
format:
	@echo "Formatting backend code..."
	cd backend && black app/ tests/
	cd backend && isort app/ tests/
	@echo "Formatting frontend code..."
	cd frontend && npm run lint --fix
