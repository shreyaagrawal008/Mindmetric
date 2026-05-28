@echo off
setlocal
cd /d "%~dp0"

echo Starting Mindmetric locally without Docker...
echo.
echo Backend:  http://localhost:8081
echo Frontend: http://localhost:5173
echo.

start "Mindmetric Backend" cmd /k call "%~dp0run-backend.bat"
timeout /t 5 /nobreak >nul
start "Mindmetric Frontend" cmd /k call "%~dp0run-frontend.bat"

echo Mindmetric is starting in two local windows.
echo Open http://localhost:5173 after Vite finishes loading.
echo.
pause
