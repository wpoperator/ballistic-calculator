@echo off
REM Deployment - Build and Push Images
cd /d "%~dp0\..\..\.."
docker build -t ballistics-backend:latest ./backend
docker build -t ballistics-frontend:latest ./frontend
echo Images built successfully!
