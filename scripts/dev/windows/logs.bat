@echo off
REM Development Environment - Logs
cd /d "%~dp0\..\..\.."
docker-compose -f docker-compose.dev.yml logs -f
