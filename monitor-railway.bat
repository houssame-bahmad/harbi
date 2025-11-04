@echo off
title Railway Backend Monitor
color 0A
echo.
echo ================================================
echo    Railway Backend Health Monitor
echo ================================================
echo.
echo Target: https://harbi-production.up.railway.app
echo.
echo This will check every 10 seconds until backend responds
echo Press Ctrl+C to stop
echo.
echo ================================================
echo.

:loop
echo [%TIME%] Checking backend status...

curl -s -o response.txt -w "%%{http_code}" https://harbi-production.up.railway.app/health > status.txt 2>nul
set /p STATUS=<status.txt

if "%STATUS%"=="200" (
    color 0A
    echo.
    echo ================================================
    echo    SUCCESS! Backend is responding!
    echo ================================================
    echo.
    type response.txt
    echo.
    echo.
    echo ================================================
    echo CORS Test: Opening test page in browser...
    echo ================================================
    start test-cors.html
    del response.txt status.txt 2>nul
    pause
    exit /b 0
) else if "%STATUS%"=="502" (
    color 0E
    echo [%TIME%] Status: 502 Bad Gateway - Backend not started yet
) else if "%STATUS%"=="000" (
    color 0E
    echo [%TIME%] Status: Connection failed - Waiting for deployment...
) else (
    color 0C
    echo [%TIME%] Status: %STATUS% - Unexpected response
)

del response.txt status.txt 2>nul
timeout /t 10 /nobreak >nul
goto loop
