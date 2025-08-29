@echo off
REM Development Environment - Start
cd /d "%~dp0\..\..\.."
docker-compose -f docker-compose.dev.yml up --build
