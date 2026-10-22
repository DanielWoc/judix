@echo off
cd /d "%~dp0"
echo JUDIX: abriendo http://localhost:8000 (cierre esta ventana para detener el servidor)
start "" http://localhost:8000
where py >nul 2>nul
if %errorlevel%==0 (py -m http.server 8000) else (python -m http.server 8000)
pause
