@echo off
echo ========================================
echo Testing Deployment Configuration
echo ========================================
echo.

echo Testing Backend API...
echo URL: https://web-production-5b48e.up.railway.app/api
curl -s https://web-production-5b48e.up.railway.app/api 2>NUL
if %errorlevel% neq 0 (
    echo ❌ Backend is not responding
    echo Please check Railway deployment
) else (
    echo ✅ Backend is reachable
)
echo.

echo Testing Frontend...
echo URL: https://harbi.benmina.com
curl -s -o NUL -w "Status: %%{http_code}\n" https://harbi.benmina.com 2>NUL
if %errorlevel% neq 0 (
    echo ❌ Frontend is not responding
    echo Please check Hostinger deployment
) else (
    echo ✅ Frontend is reachable
)
echo.

echo ========================================
echo Configuration Summary
echo ========================================
echo Frontend URL: https://harbi.benmina.com
echo Backend URL:  https://web-production-5b48e.up.railway.app/api
echo.
echo Check browser console at https://harbi.benmina.com
echo You should see API connection logs
echo ========================================
pause
