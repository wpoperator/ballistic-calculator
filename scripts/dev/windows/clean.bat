@echo off
REM Development Environment - Clean Reset
cd /d "%~dp0\..\..\.."
docker-compose -f docker-compose.dev.yml down --volumes --remove-orphans
docker system prune -f
docker-compose -f docker-compose.dev.yml build --no-cache
