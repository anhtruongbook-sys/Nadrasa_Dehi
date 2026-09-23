@echo off
chcp 65001 >nul
echo ========================================================
echo   NETA LIGHT - KHOI CHAY ONLINE QUA CLOUDFLARE
echo ========================================================
echo.
echo [1] Dang khoi dong may chu cuc bo tren cong 8080...
start /B python -m http.server 8080 >nul 2>&1
timeout /t 2 >nul

echo [2] Dang mo duong ham Cloudflare Tunnel ra toan cau...
echo.
cloudflared.exe tunnel --url http://localhost:8080
pause
