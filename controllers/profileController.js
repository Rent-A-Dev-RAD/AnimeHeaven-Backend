const { profil_adatlap, lista_elem, lista_tipus, anime_adatlap } = require('../models');
const bcrypt = require('bcrypt');

/**
 * @swagger
 * components:
 *   schemas:
 *     ProfileUpdate:
 *       type: object
 *       properties:
 *         felhasznalonev:
 *           type: string
 *           example: "UjFelhasznalonev"
 *         profilkep:
 *           type: string
 *           example: "/profiles/user123.jpg"
 *         jelszo:
 *           type: string
 *           example: "newPassword123"
 */

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Saját profil adatok lekérése
 *     tags: [Profile]
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
 *         description: Nincs bejelentkezve
 *       500:
 *         description: Server hiba
 */
const getProfile = async (req, res) => {
    try {
        const user = await profil_adatlap.findByPk(req.user.id, {
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
            user
        });

    } catch (error) {
        console.error("Profil lekérdezési hiba:", error);
        res.status(500).json({
            success: false,
            error: 'Hiba a profil lekérdezése során',
            details: error.message
        });
    }
};

/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: Saját profil frissítése
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileUpdate'
 *     responses:
 *       200:
 *         description: Sikeres frissítés
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
 *                   example: "Profil sikeresen frissítve"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Nincs bejelentkezve
 *       500:
 *         description: Server hiba
 */
const updateProfile = async (req, res) => {
    try {
        const { felhasznalonev, profilkep, jelszo } = req.body;

        const user = await profil_adatlap.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Felhasználó nem található'
            });
        }

        const updateData = {};

        // Felhasználónév frissítése
        if (felhasznalonev) {
            updateData.felhasznalonev = felhasznalonev;
        }

        // Profilkép frissítése
        if (profilkep) {
            updateData.profilkep = profilkep;
        }

        // Jelszó frissítése (ha meg van adva)
        if (jelszo) {
            if (jelszo.length < 6) {
                return res.status(400).json({
                    success: false,
                    error: 'A jelszónak legalább 6 karakter hosszúnak kell lennie!'
                });
            }
            const saltRounds = 10;
            updateData.jelszo = await bcrypt.hash(jelszo, saltRounds);
            updateData.salt = await bcrypt.genSalt(saltRounds);
        }

        await user.update(updateData);

        // Ne küldjük vissza a jelszót
        const userData = user.toJSON();
        delete userData.jelszo;
        delete userData.salt;

        res.json({
            success: true,
            message: 'Profil sikeresen frissítve',
            user: userData
        });

    } catch (error) {
        console.error("Profil frissítési hiba:", error);
        res.status(500).json({
            success: false,
            error: 'Hiba a profil frissítése során',
            details: error.message
        });
    }
};

/**
 * @swagger
 * /api/profile/picture:
 *   put:
 *     summary: Profilkép frissítése
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - profilkep
 *             properties:
 *               profilkep:
 *                 type: string
 *                 example: "/profiles/user123.jpg"
 *     responses:
 *       200:
 *         description: Profilkép sikeresen frissítve
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
 *                   example: "Profilkép sikeresen frissítve"
 *                 profilkep:
 *                   type: string
 *                   example: "/profiles/user123.jpg"
 *       400:
 *         description: Hiányzó profilkep
 *       401:
 *         description: Nincs bejelentkezve
 *       500:
 *         description: Server hiba
 */
const updateProfilePicture = async (req, res) => {
    try {
        const { profilkep } = req.body;

        if (!profilkep) {
            return res.status(400).json({
                success: false,
                error: 'Profilkép megadása kötelező!'
            });
        }

        const user = await profil_adatlap.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Felhasználó nem található'
            });
        }

        await user.update({ profilkep });

        res.json({
            success: true,
            message: 'Profilkép sikeresen frissítve',
            profilkep: user.profilkep
        });

    } catch (error) {
        console.error("Profilkép frissítési hiba:", error);
        res.status(500).json({
            success: false,
            error: 'Hiba a profilkép frissítése során',
            details: error.message
        });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    updateProfilePicture
};
