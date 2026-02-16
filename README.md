# AnimeHeaven Backend API

Node.js/Express REST API anime adatbázis kezeléséhez MySQL-lel, Sequelize ORM-el!

## Technológiák

- Node.js + Express
- MySQL (XAMPP)
- CORS, dotenv

## Gyors Telepítés

### 1. Előfeltételek
- [Node.js](https://nodejs.org/) (v14+)
- [XAMPP](https://www.apachefriends.org/) (MySQL)

### 2. Adatbázis
1. Indítsd el a XAMPP-et → MySQL Start
2. Nyisd meg: http://localhost/phpmyadmin
3. Hozz létre adatbázist: https://github.com/Rent-A-Dev-RAD/AnimeHeaven-Database

### 3. Backend Telepítés

```powershell
# Függőségek telepítése
npm install

# .env fájl létrehozása
copy .env.example .env
```

### 4. .env Konfiguráció

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=animeheaven_database
DB_PORT=3306

PORT=3001
FRONTEND_URL=http://localhost:3000
```

### 5. Indítás

```powershell
# Fejlesztői mód (auto-reload)
npm run dev

# Vagy normál mód
npm start
```

## API Végpontok

**Base URL:** `http://localhost:3001/api`

| Metódus | Végpont | Leírás |
|---------|---------|--------|
| GET | `/health` | Szerverállapot |
| GET | `/animes` | Összes anime listázása |
| GET | `/animes/:id` | Egy anime adatai |
| POST | `/animes` | Új anime létrehozása |
| PUT | `/animes/:id` | Anime frissítése |
| DELETE | `/animes/:id` | Anime törlése |

### Példák

```bash
# Összes anime
GET http://localhost:3001/api/animes

# Keresés
GET http://localhost:3001/api/animes?search=naruto

# Egy anime
GET http://localhost:3001/api/animes/1
```

## Gyakori Hibák

**Adatbázis hiba:**
- Ellenőrizd, hogy fut-e a MySQL a XAMPP-ben
- Nézd meg a `.env` fájlt

**Port foglalt:**
```powershell
# Port felszabadítása
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```


## Tesztelés

Böngészőben nyisd meg:
- http://localhost:3001/api/health
- http://localhost:3001/api/animes

---

**Készítette: Rent-A-Dev**
