@echo off
REM Production Environment - Start
cd /d "%~dp0\..\..\.."
docker-compose -f docker-compose.yml up -d --build
