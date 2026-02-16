const { profil_adatlap } = require('../models');
const bcrypt = require('bcrypt');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         email:
 *           type: string
 *           example: "user@example.com"
 *         felhasznalonev:
 *           type: string
 *           example: "AnimeFan123"
 *         profilkep:
 *           type: string
 *           example: "https://example.com/profile.jpg"
 *         jogosultsag:
 *           type: integer
 *           example: 0
 *       required:
 *         - email
 *         - felhasznalonev
 *         - jelszo
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Összes felhasználó lekérése
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Visszaadott elemek száma
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Kihagyott elemek száma
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
 *                 count:
 *                   type: integer
 *                   example: 10
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       500:
 *         description: Server hiba
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const getAllUsers = async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;

        const users = await profil_adatlap.findAll({
            limit: parseInt(limit),
            offset: parseInt(offset),
            attributes: { exclude: ['jelszo', 'salt'] }, // Ne adjuk vissza a jelszót
            order: [['id', 'ASC']]
        });

        res.json({
            success: true,
            count: users.length,
            data: users
        });

    } catch (error) {
        console.error("Felhasználók lekérdezési hiba:", error);
        res.status(500).json({
            success: false,
            error: 'Hiba a lekérdezés során',
            details: error.message
        });
    }
};

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Egy felhasználó lekérése ID alapján
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Felhasználó azonosítója
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
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: Felhasználó nem található
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
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await profil_adatlap.findByPk(id, {
            attributes: { exclude: ['jelszo', 'salt'] }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Felhasználó nem található'
            });
        }

        res.json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error("Felhasználó lekérdezési hiba:", error);
        res.status(500).json({
            success: false,
            error: 'Hiba a lekérdezés során',
            details: error.message
        });
    }
};

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Új felhasználó hozzáadása
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - felhasznalonev
 *               - jelszo
 *             properties:
 *               email:
 *                 type: string
 *                 example: "newuser@example.com"
 *               felhasznalonev:
 *                 type: string
 *                 example: "NewUser123"
 *               jelszo:
 *                 type: string
 *                 example: "securePassword123"
 *               profilkep:
 *                 type: string
 *                 example: "https://example.com/avatar.jpg"
 *               jogosultsag:
 *                 type: integer
 *                 example: 0
 *     responses:
 *       201:
 *         description: Felhasználó sikeresen létrehozva
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Hibás kérés
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
const createUser = async (req, res) => {
    try {
        const { email, felhasznalonev, jelszo, profilkep, jogosultsag } = req.body;

        if (!email || !felhasznalonev || !jelszo) {
            return res.status(400).json({
                success: false,
                error: 'Email, felhasználónév és jelszó megadása kötelező!'
            });
        }

        // Bcrypt saltRounds (10-12 ajánlott)
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(jelszo, saltRounds);

        // Salt generálás (opcionális extra biztonsághoz)
        const salt = await bcrypt.genSalt(saltRounds);

        const newUser = await profil_adatlap.create({
            email,
            felhasznalonev,
            jelszo: hashedPassword,
            salt,
            profilkep: profilkep || null,
            jogosultsag: jogosultsag || 0
        });

        // Ne küldjük vissza a jelszót
        const userData = newUser.toJSON();
        delete userData.jelszo;
        delete userData.salt;

        res.status(201).json({
            success: true,
            data: userData
        });

    } catch (error) {
        console.error("Felhasználó létrehozási hiba:", error);
        res.status(500).json({
            success: false,
            error: 'Hiba a felhasználó létrehozása során',
            details: error.message
        });
    }
};

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Felhasználó teljes adatainak frissítése
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Felhasználó azonosítója
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "updated@example.com"
 *               felhasznalonev:
 *                 type: string
 *                 example: "UpdatedUser"
 *               jelszo:
 *                 type: string
 *                 example: "newPassword123"
 *               profilkep:
 *                 type: string
 *                 example: "https://example.com/newavatar.jpg"
 *               jogosultsag:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Felhasználó sikeresen frissítve
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: Felhasználó nem található
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
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const user = await profil_adatlap.findByPk(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Felhasználó nem található'
            });
        }

        // Ha új jelszót adnak meg, hash-eld és generálj új salt-ot
        if (updateData.jelszo) {
            const saltRounds = 10;
            updateData.jelszo = await bcrypt.hash(updateData.jelszo, saltRounds);
            updateData.salt = await bcrypt.genSalt(saltRounds);
        }

        await user.update(updateData);

        // Ne küldjük vissza a jelszót
        const userData = user.toJSON();
        delete userData.jelszo;
        delete userData.salt;

        res.json({
            success: true,
            data: userData
        });

    } catch (error) {
        console.error("Felhasználó frissítési hiba:", error);
        res.status(500).json({
            success: false,
            error: 'Hiba a frissítés során',
            details: error.message
        });
    }
};

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Felhasználó törlése
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Felhasználó azonosítója
 *     responses:
 *       200:
 *         description: Felhasználó sikeresen törölve
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Felhasználó sikeresen törölve"
 *       404:
 *         description: Felhasználó nem található
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
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await profil_adatlap.findByPk(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Felhasználó nem található'
            });
        }

        await user.destroy();

        res.json({
            success: true,
            message: 'Felhasználó sikeresen törölve'
        });

    } catch (error) {
        console.error("Felhasználó törlési hiba:", error);
        res.status(500).json({
            success: false,
            error: 'Hiba a törlés során',
            details: error.message
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};
