# ===============================================
# AnimeHeaven Backend API Teszt Script
# Frissítve: Új adatbázis sémához (v2.0)
# ===============================================
# Használat: Futtasd PowerShell-ben
# .\test-api.ps1
# ===============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AnimeHeaven Backend API Tesztelés" -ForegroundColor Cyan
Write-Host "  Verzió: 2.0 (Új séma)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$API_URL = "http://localhost:3001"
$success = 0
$failed = 0

# Teszt 1: Health Check
Write-Host "1. Health Check teszt..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/api/health" -Method Get
    if ($response.success -eq $true) {
        Write-Host "   ✅ SIKERES - Backend fut!" -ForegroundColor Green
        Write-Host "   Message: $($response.message)" -ForegroundColor Gray
        $success++
    } else {
        Write-Host "   ❌ HIBA - Nem várt válasz" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "   ❌ HIBA - Backend nem elérhető!" -ForegroundColor Red
    Write-Host "   Ellenőrizd: npm run dev fut?" -ForegroundColor Gray
    $failed++
}
Write-Host ""

# Teszt 2: Összes anime lekérése
Write-Host "2. Összes anime lekérése (ÚJ SÉMA)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/api/animes" -Method Get
    if ($response.success -eq $true) {
        if ($response.data.Count -gt 0) {
            Write-Host "   ✅ SIKERES - $($response.count) anime találva" -ForegroundColor Green
            $firstAnime = $response.data[0]
            Write-Host "   Első anime: $($firstAnime.angol_cim)" -ForegroundColor Gray
            Write-Host "   Címkék: $($firstAnime.cimkek)" -ForegroundColor Gray
            Write-Host "   Stúdiók: $($firstAnime.studiok)" -ForegroundColor Gray
            $success++
        } else {
            Write-Host "   ⚠️  FIGYELEM - Nincs adat az adatbázisban" -ForegroundColor Yellow
            Write-Host "   Futtasd: database/sample-data.sql (várjuk mintaadatokat)" -ForegroundColor Gray
            $failed++
        }
    } else {
        Write-Host "   ❌ HIBA - API válasz sikertelen" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "   ❌ HIBA - Nem sikerült lekérni az animéket" -ForegroundColor Red
    Write-Host "   Hiba: $($_.Exception.Message)" -ForegroundColor Gray
    $failed++
}
Write-Host ""

# Teszt 3: Egy anime lekérése (ID=1)
Write-Host "3. Egy anime lekérése (ID=1) epizódokkal..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/api/animes/1" -Method Get
    if ($response.success -eq $true) {
        Write-Host "   ✅ SIKERES - Anime: $($response.data.angol_cim)" -ForegroundColor Green
        Write-Host "   Értékelés: $($response.data.ertekeles)" -ForegroundColor Gray
        Write-Host "   Epizódok: $($response.data.reszek.Count) db" -ForegroundColor Gray
        $success++
    } else {
        Write-Host "   ❌ HIBA - Anime nem található" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "   ⚠️  FIGYELEM - ID=1 nem létezik (várható)" -ForegroundColor Yellow
    Write-Host "   Várjuk a mintaadatokat..." -ForegroundColor Gray
    $failed++
}
Write-Host ""

# Teszt 4: Keresés teszt (angol cím)
Write-Host "4. Keresés teszt (search=...)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/api/animes?search=One" -Method Get
    if ($response.success -eq $true) {
        Write-Host "   ✅ SIKERES - $($response.count) találat" -ForegroundColor Green
        $success++
    } else {
        Write-Host "   ❌ HIBA - Keresés sikertelen" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "   ❌ HIBA - Keresés sikertelen" -ForegroundColor Red
    $failed++
}
Write-Host ""

# Teszt 5: Szűrés címke alapján (ÚJ!)
Write-Host "5. Szűrés teszt (cimke=Action)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/api/animes?cimke=Action" -Method Get
    if ($response.success -eq $true) {
        Write-Host "   ✅ SIKERES - $($response.count) Action anime" -ForegroundColor Green
        $success++
    } else {
        Write-Host "   ❌ HIBA - Szűrés sikertelen" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "   ⚠️  FIGYELEM - Nincs Action címkével anime" -ForegroundColor Yellow
    $failed++
}
Write-Host ""

# Teszt 6: Szűrés státusz alapján (ÚJ ENUM!)
Write-Host "6. Szűrés teszt (statusz=Fut)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/api/animes?statusz=Fut" -Method Get
    if ($response.success -eq $true) {
        Write-Host "   ✅ SIKERES - $($response.count) futó anime" -ForegroundColor Green
        $success++
    } else {
        Write-Host "   ❌ HIBA - Szűrés sikertelen" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "   ⚠️  FIGYELEM - Nincs Fut státuszú anime" -ForegroundColor Yellow
    $failed++
}
Write-Host ""

# Összegzés
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Tesztek Összegzése" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Sikeres: $success" -ForegroundColor Green
Write-Host "❌ Sikertelen: $failed" -ForegroundColor Red

if ($failed -eq 0) {
    Write-Host ""
    Write-Host "🎉 Minden teszt sikeres! Backend tökéletesen működik!" -ForegroundColor Green
    Write-Host ""
} elseif ($failed -le 2) {
    Write-Host ""
    Write-Host "⚠️  Néhány teszt sikertelen (várható, ha nincs mintaadat)" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Sok a baj! Ellenőrizd:" -ForegroundColor Red
    Write-Host "1. XAMPP MySQL fut?" -ForegroundColor White
    Write-Host "2. Backend szerver fut? (npm run dev)" -ForegroundColor White
    Write-Host "3. Adatbázis neve: animeheaven_database" -ForegroundColor White
    Write-Host "4. .env fájl helyes?" -ForegroundColor White
}
Write-Host ""
