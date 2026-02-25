# AnimeHeaven Backend API

## Technológiák

- Node.js + Express
- MySQL (XAMPP)
- Sequelize ORM
- Swagger UI (API dokumentáció)
- CORS, dotenv, bcrypt

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

**API Dokumentáció (Swagger UI):** `http://localhost:3001/swagger`

### Health Check
| Metódus | Végpont | Leírás |
|---------|---------|--------|
| GET | `/health` | Szerverállapot és adatbázis kapcsolat |

### Anime végpontok
| Metódus | Végpont | Leírás |
|---------|---------|--------|
| GET | `/animes` | Összes anime listázása |
| GET | `/animes/:id` | Egy anime adatai |
| POST | `/animes` | Új anime létrehozása |
| PUT | `/animes/:id` | Anime frissítése |
| DELETE | `/animes/:id` | Anime törlése |

### User végpontok
| Metódus | Végpont | Leírás |
|---------|---------|--------|
| GET | `/users` | Összes felhasználó listázása |
| GET | `/users/:id` | Egy felhasználó adatai |
| POST | `/users` | Új felhasználó létrehozása |
| PUT | `/users/:id` | Felhasználó frissítése |
| DELETE | `/users/:id` | Felhasználó törlése |

### Episode végpontok
| Metódus | Végpont | Leírás |
|---------|---------|--------|
| GET | `/episodes/anime/:animeId` | Egy anime összes epizódja |

### Példák

```bash
# Health check
GET http://localhost:3001/api/health

# Összes anime
GET http://localhost:3001/api/animes

# Keresés
GET http://localhost:3001/api/animes?search=naruto

# Egy anime
GET http://localhost:3001/api/animes/1

# Összes felhasználó
GET http://localhost:3001/api/users

# Egy felhasználó
GET http://localhost:3001/api/users/1

# Anime epizódjai
GET http://localhost:3001/api/episodes/anime/1

# Swagger UI dokumentáció
http://localhost:3001/swagger
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
- http://localhost:3001/api/users
- http://localhost:3001/swagger (Interaktív API dokumentáció)

---

**Készítette: Rent-A-Dev**
