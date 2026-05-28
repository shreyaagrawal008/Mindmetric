@echo off
setlocal
cd /d "%~dp0"

echo Checking Docker...
where docker >nul 2>nul
if errorlevel 1 (
  echo Docker Desktop is not installed or not on PATH.
  echo Install Docker Desktop and start it.
  pause
  exit /b 1
)

echo.
echo Docker will install Node, React, Maven, Java, and MySQL inside containers.
echo Run run-mindmetric.bat or docker-compose up --build to start.
pause
