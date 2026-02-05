# 🚀 Backend Gyors Kezdés - Lépésről Lépésre

## Adatbázis Létrehozás

### phpMyAdmin

1. **XAMPP Control Panel** → MySQL
2. http://localhost/phpmyadmin
- Adatbázis neve: `animeheaven_database`
3. **"SQL"** fül
4. Nyisd meg és másold ki: `database/setup.sql` tartalmát
5. Illeszd be és **"Go"**
6. Ismételd meg a `database/sample-data.sql` fájllal (tesztadatok)

## Backend Konfiguráció

1. **Nyisd meg PowerShell-t (VS Code terminál)**
2. **Navigálj a backend mappába:**
   ```powershell
   cd C:\Users\????\Documents\animeheavenrepo\backend
   ```

3. **Hozd létre a .env fájlt:**
   ```powershell
   copy .env.example .env
   ```

4. **Ellenőrizd a .env fájlt** (alapértelmezett XAMPP beállítások):
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=animeheaven_db
   DB_PORT=3306
   
   PORT=3001
   NODE_ENV=development
   
   FRONTEND_URL=http://localhost:3000
   ```

## Függőségek Telepítése

```powershell
npm install
```

Várj, míg települ (1-2 perc). Telepített package-ek:
- express (szerver)
- mysql2 (adatbázis kapcsolat)
- cors (frontend kapcsolat)
- dotenv (környezeti változók)
- nodemon (auto-restart development-ben)

## Backend Indítás

```powershell
npm run dev
```

### Mit kell látnod:

```
✅ Database connected successfully
=================================
🚀 Server running on port 3001
📍 Health check: http://localhost:3001/api/health
📍 API endpoint: http://localhost:3001/api/animes
🌐 Frontend URL (persze ha elindítod a frontendet): http://localhost:3000
=================================
```

## Tesztelés

### Böngészőben:
Nyisd meg ezeket az URL-eket:

1. **Health check:**
   - http://localhost:3001/api/health
   - Válasz: `{"success": true, "message": "AnimeHeaven Backend API is running"...}`

2. **Összes anime:**
   - http://localhost:3001/api/animes
   - Válasz: JSON lista 5 animéből

3. **Egy anime (ID=1):**
   - http://localhost:3001/api/animes/1
   - Válasz: Chainsaw Man adatai


## Frontend-el hogyan tudom tesztelni?

Ha a backend fut és működik:

1. **Nyiss egy ÚJ terminált** (hagyd a backend futni!)
2. **Navigálj a frontend mappába:**
   ```powershell
   cd C:\Users\????\Documents\animeheavenrepo\frontend\AnimeHeaven-Frontend
   ```

3. **Hozd létre a .env.local fájlt | ⚠ FONTOS ez ha nem működik akkor @botea16 discordon FONTOS ⚠**
   ```powershell
   @"
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   NEXT_PUBLIC_USE_REAL_API=true
   "@ | Out-File -FilePath .env.local -Encoding utf8
   ```

4. **Indítsd újra/Indítsd el a frontend-et:**
   ```powershell
   npm run dev
   ```

5. **Nyisd meg a böngészőt:**
   - http://localhost:3000
   - Most már az adatbázisból jönnek az animék! 🎉

## 🎯 Ellenőrző Lista

Backend működik, ha:
- ✅ `npm run dev` elindult hibátlanul
- ✅ http://localhost:3001/api/health válaszol
- ✅ http://localhost:3001/api/animes visszaadja az animékat

Frontend integrálva, ha:
- ✅ `.env.local` fájl létezik `USE_REAL_API=true`-val
- ✅ Frontend újraindítva
- ✅ Főoldalon az animék megjelennek
- ✅ Konzolban nincs CORS vagy API hiba, ignore youtube CORS anime adatlapokon

---

**Készítette:** AnimeHeaven Team  
**Verzió:** 1.0  
**Utolsó frissítés:** 2026.02.05
