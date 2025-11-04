# Railway Deployment Verification Script
# Run this to check if everything is configured correctly

Write-Host "`n╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🔍 RAILWAY DEPLOYMENT VERIFICATION                      ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$errors = 0
$warnings = 0

# Check 1: Backend builds successfully
Write-Host "📦 Checking backend build..." -ForegroundColor Yellow
Push-Location backend
try {
    $buildOutput = npm run build 2>&1 | Out-String
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Backend builds successfully" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Backend build failed" -ForegroundColor Red
        Write-Host "   Error: $buildOutput" -ForegroundColor Red
        $errors++
    }
} catch {
    Write-Host "   ❌ Backend build failed: $_" -ForegroundColor Red
    $errors++
}
Pop-Location

# Check 2: Database schema exists
Write-Host "`n📊 Checking database schema..." -ForegroundColor Yellow
if (Test-Path "backend/db/schema.mysql.sql") {
    Write-Host "   ✅ schema.mysql.sql exists" -ForegroundColor Green
} else {
    Write-Host "   ❌ schema.mysql.sql not found" -ForegroundColor Red
    $errors++
}

# Check 3: Seed data exists
if (Test-Path "backend/db/seed.mysql.sql") {
    Write-Host "   ✅ seed.mysql.sql exists" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  seed.mysql.sql not found (optional)" -ForegroundColor Yellow
    $warnings++
}

# Check 4: Railway configuration files
Write-Host "`n🚂 Checking Railway configuration..." -ForegroundColor Yellow
if (Test-Path "nixpacks.toml") {
    Write-Host "   ✅ nixpacks.toml exists" -ForegroundColor Green
} else {
    Write-Host "   ❌ nixpacks.toml not found" -ForegroundColor Red
    $errors++
}

if (Test-Path "railway.json") {
    Write-Host "   ✅ railway.json exists" -ForegroundColor Green
} else {
    Write-Host "   ❌ railway.json not found" -ForegroundColor Red
    $errors++
}

# Check 5: Frontend API configuration
Write-Host "`n🌐 Checking frontend configuration..." -ForegroundColor Yellow
if (Test-Path "services/api.ts") {
    $apiContent = Get-Content "services/api.ts" -Raw
    if ($apiContent -match "houssame-production\.up\.railway\.app") {
        Write-Host "   ✅ Frontend configured for Railway backend" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Frontend may not be pointing to correct backend" -ForegroundColor Yellow
        $warnings++
    }
} else {
    Write-Host "   ❌ services/api.ts not found" -ForegroundColor Red
    $errors++
}

# Check 6: Frontend build
Write-Host "`n🏗️  Checking frontend build..." -ForegroundColor Yellow
if (Test-Path "dist/index.html") {
    Write-Host "   ✅ Frontend is built (dist folder exists)" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Frontend not built yet. Run: npm run build" -ForegroundColor Yellow
    $warnings++
}

# Check 7: Test backend endpoint
Write-Host "`n🔗 Testing backend endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://houssame-production.up.railway.app/health" -Method Get -TimeoutSec 10 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Backend is running and healthy!" -ForegroundColor Green
        $content = $response.Content | ConvertFrom-Json
        Write-Host "      Status: $($content.status)" -ForegroundColor Gray
        Write-Host "      Database: $($content.database)" -ForegroundColor Gray
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 502) {
        Write-Host "   ❌ Backend returns 502 - Not starting properly" -ForegroundColor Red
        Write-Host "      → Check Railway environment variables" -ForegroundColor Yellow
        Write-Host "      → Check Railway deployment logs" -ForegroundColor Yellow
        $errors++
    } elseif ($statusCode -eq 503) {
        Write-Host "   ⚠️  Backend is deploying... wait a moment and try again" -ForegroundColor Yellow
        $warnings++
    } else {
        Write-Host "   ❌ Backend not accessible: $_" -ForegroundColor Red
        $errors++
    }
}

# Summary
Write-Host "`n╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  📊 VERIFICATION SUMMARY                                  ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "🎉 ALL CHECKS PASSED!" -ForegroundColor Green
    Write-Host "`nYour project is ready for deployment!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "1. Ensure MySQL is set up in Hostinger (see HOSTINGER-MYSQL-INFO.md)" -ForegroundColor White
    Write-Host "2. Set environment variables in Railway (see COMPLETE-FIX-GUIDE.md)" -ForegroundColor White
    Write-Host "3. Upload frontend to Hostinger" -ForegroundColor White
} elseif ($errors -eq 0) {
    Write-Host "✅ No critical errors found" -ForegroundColor Green
    Write-Host "⚠️  $warnings warning(s) - review above" -ForegroundColor Yellow
} else {
    Write-Host "❌ $errors error(s) found - fix them before deploying" -ForegroundColor Red
    if ($warnings -gt 0) {
        Write-Host "⚠️  $warnings warning(s) - review above" -ForegroundColor Yellow
    }
    Write-Host "`nRefer to COMPLETE-FIX-GUIDE.md for solutions`n" -ForegroundColor Cyan
}

Write-Host ""
