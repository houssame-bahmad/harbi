@echo off
echo ========================================
echo DEPLOYING BACKEND UPDATES TO RAILWAY
echo ========================================
echo.

echo This will:
echo 1. Add all new backend files
echo 2. Commit changes
echo 3. Push to GitHub (Railway will auto-deploy)
echo.

pause

echo.
echo [1/3] Staging changes...
git add .

echo.
echo [2/3] Committing changes...
git commit -m "Add e-commerce endpoints: products, orders, users + database schema"

echo.
echo [3/3] Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo DONE!
echo ========================================
echo.
echo Railway will automatically detect and deploy these changes.
echo.
echo NEXT STEPS:
echo 1. Go to Railway Dashboard: https://railway.app
echo 2. Wait for deployment to complete (2-3 minutes)
echo 3. Click on MySQL service
echo 4. Go to "Data" or "Connect" tab
echo 5. Run the SQL from: server/migrations/ecommerce_schema.sql
echo.
echo After database setup:
echo - Test: https://web-production-5b48e.up.railway.app/api/products
echo - Should see products JSON (or empty array)
echo.
pause
