@echo off
echo ========================================
echo Building for Hostinger Deployment
echo ========================================
echo.
echo Frontend URL: https://harbi.benmina.com
echo Backend URL: https://web-production-5b48e.up.railway.app/api
echo.

REM Install dependencies if needed
echo [1/3] Installing dependencies...
call npm install

REM Build the project
echo.
echo [2/3] Building production bundle...
call npm run build

echo.
echo [3/3] Build complete!
echo.
echo ========================================
echo NEXT STEPS:
echo ========================================
echo 1. Go to your Hostinger File Manager
echo 2. Navigate to public_html/harbi (or your subdomain folder)
echo 3. Delete all existing files in that folder
echo 4. Upload ALL files from the 'dist' folder
echo 5. Make sure .htaccess is uploaded for SPA routing
echo.
echo Build folder: dist/
echo ========================================
pause
