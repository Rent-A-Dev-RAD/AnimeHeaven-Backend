const { profil_adatlap } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// JWT secret - .env fájlban tárold, vagy itt hardcode-olt érték fejlesztéshez
const JWT_SECRET = process.env.JWT_SECRET || 'animeheaven_titkos_kulcs_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * @swagger
 * components:
 *   schemas:
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         token:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             email:
 *               type: string
 *             felhasznalonev:
 *               type: string
 *             profilkep:
 *               type: string
 *             jogosultsag:
 *               type: integer
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - jelszo
 *       properties:
 *         email:
 *           type: string
 *           example: "tulaj@animeheaven.hu"
 *         jelszo:
 *           type: string
 *           example: "password123"
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - felhasznalonev
 *         - jelszo
 *       properties:
 *         email:
 *           type: string
 *           example: "newuser@example.com"
 *         felhasznalonev:
 *           type: string
 *           example: "UjFelhasznalo"
 *         jelszo:
 *           type: string
 *           example: "securePassword123"
 *         profilkep:
 *           type: string
 *           example: "https://example.com/avatar.jpg"
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Új felhasználó regisztrációja
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Sikeres regisztráció
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Hibás adatok vagy az email már létezik
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server hiba
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const register = async (req, res) => {
    try {
        const { email, felhasznalonev, jelszo, profilkep } = req.body;

        // Validáció
        if (!email || !felhasznalonev || !jelszo) {
            return res.status(400).json({
                success: false,
                error: 'Email, felhasználónév és jelszó megadása kötelező!'
            });
        }

        // Email formátum ellenőrzés
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Érvénytelen email formátum!'
            });
        }

        // Jelszó hossz ellenőrzés
        if (jelszo.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'A jelszónak legalább 6 karakter hosszúnak kell lennie!'
            });
        }

        // Ellenőrizzük, hogy létezik-e már az email
        const existingUser = await profil_adatlap.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Ez az email cím már regisztrálva van!'
            });
        }

        // Jelszó hash-elése
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(jelszo, saltRounds);
        const salt = await bcrypt.genSalt(saltRounds);

        // Új felhasználó létrehozása
        const newUser = await profil_adatlap.create({
            email,
            felhasznalonev,
            jelszo: hashedPassword,
            salt,
            profilkep: profilkep || null,
            jogosultsag: 1 // Alapértelmezett jogosultság: normál felhasználó
        });

        // JWT token generálása
        const token = jwt.sign(
            {
                id: newUser.id,
                email: newUser.email,
                jogosultsag: newUser.jogosultsag
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Felhasználói adatok előkészítése (jelszó nélkül)
        const userData = {
            id: newUser.id,
            email: newUser.email,
            felhasznalonev: newUser.felhasznalonev,
            profilkep: newUser.profilkep,
            jogosultsag: newUser.jogosultsag
        };

        res.status(201).json({
            success: true,
            message: 'Sikeres regisztráció!',
            token,
            user: userData
        });

    } catch (error) {
        console.error("Regisztrációs hiba:", error);
        res.status(500).json({
            success: false,
            error: 'Hiba a regisztráció során',
            details: error.message
        });
    }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Felhasználó bejelentkezése
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Sikeres bejelentkezés
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Hibás email vagy jelszó
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server hiba
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const login = async (req, res) => {
    try {
        const { email, jelszo } = req.body;

        // Validáció
        if (!email || !jelszo) {
            return res.status(400).json({
                success: false,
                error: 'Email és jelszó megadása kötelező!'
            });
        }

        // Felhasználó keresése email alapján
        const user = await profil_adatlap.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Hibás email vagy jelszó!'
            });
        }

        // Jelszó ellenőrzése
        const isPasswordValid = await bcrypt.compare(jelszo, user.jelszo);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Hibás email vagy jelszó!'
            });
        }

        // JWT token generálása
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                jogosultsag: user.jogosultsag
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Felhasználói adatok előkészítése (jelszó nélkül)
        const userData = {
            id: user.id,
            email: user.email,
            felhasznalonev: user.felhasznalonev,
            profilkep: user.profilkep,
            jogosultsag: user.jogosultsag
        };

        res.json({
            success: true,
            message: 'Sikeres bejelentkezés!',
            token,
            user: userData
        });

    } catch (error) {
        console.error("Bejelentkezési hiba:", error);
        res.status(500).json({
            success: false,
            error: 'Hiba a bejelentkezés során',
            details: error.message
        });
    }
};

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Bejelentkezett felhasználó adatainak lekérése
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sikeres lekérdezés
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Nincs bejelentkezve vagy érvénytelen token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server hiba
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const getMe = async (req, res) => {
    try {
        // A middleware-ből jön a req.user
        const user = await profil_adatlap.findByPk(req.user.id, {
            attributes: { exclude: ['jelszo', 'salt'] }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Felhasználó nem található!'
            });
        }

        res.json({
            success: true,
            user
        });

    } catch (error) {
        console.error("Felhasználó lekérdezési hiba:", error);
        res.status(500).json({
            success: false,
            error: 'Hiba a felhasználó lekérdezése során',
            details: error.message
        });
    }
};

module.exports = {
    register,
    login,
    getMe
};
