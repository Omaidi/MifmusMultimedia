@echo off
cd /d "%~dp0"
echo Memulai Server Twibbon di folder: %CD%
echo Pastikan Anda terhubung ke internet agar npx dapat berjalan.
call npx -y http-server . -o -c-1
pause
