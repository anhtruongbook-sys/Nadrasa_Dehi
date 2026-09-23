@echo off
chcp 65001 >nul
echo ========================================================
echo   NETA LIGHT - APPS BOC BAI PHAP MON NADRASA DEHI
echo ========================================================
echo.
echo [1] Dang khoi dong Web Server cuc bo...
echo [2] Dia chi truy cap tren may tinh (PC):
echo     http://localhost:8080
echo.
echo [3] Dia chi truy cap tren dien thoai (cung mang Wi-Fi):
echo     http://192.168.1.15:8080
echo.
echo Ban co the mo trinh duyet Safari (iPhone) hoac Chrome (Android)
echo va chon "Them vao man hinh chinh" (Add to Home Screen) de dung nhu App!
echo.
echo Nhan Ctrl + C de dung server khi khong su dung.
echo ========================================================
python -m http.server 8080
