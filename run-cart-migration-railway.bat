@echo off
echo ============================================
echo RAILWAY CART MIGRATION
echo ============================================
echo.
echo This will create the cart_items table in Railway database
echo.
pause

railway run node server/migrations/run-cart-migration.js

echo.
echo ============================================
echo Migration complete! Check Railway logs.
echo ============================================
pause
