const { lista_elem, lista_tipus, anime_adatlap, profil_adatlap } = require('../models');

/**
 * @swagger
 * components:
 *   schemas:
 *     ListItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         profil_id:
 *           type: integer
 *           example: 6
 *         anime_id:
 *           type: integer
 *           example: 1
 *         tipus_id:
 *           type: integer
 *           example: 1
 *         hozzaadva:
 *           type: string
 *           format: date-time
 *           example: "2026-02-18 13:22:02"
 *         anime:
 *           type: object
 *         tipus:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             tipus:
 *               type: string
 *               example: "Kedvenc"
 */

/**
 * @swagger
 * /api/list/my:
 *   get:
 *     summary: Saját anime listám lekérése
 *     tags: [List]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tipus_id
 *         schema:
 *           type: integer
 *         description: Lista típus szűrés (1=Kedvenc, 2=Megnézendő, 3=Teszelt, 4=Nem tetszett, 5=Droppolt)
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
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ListItem'
 *       401:
 *         description: Nincs bejelentkezve
 *       500:
 *         description: Server hiba
 */
const getMyList = async (req, res) => {
    try {
        const { tipus_id } = req.query;
        const whereClause = { profil_id: req.user.id };

        // Ha megadtak típus szűrést
        if (tipus_id) {
            whereClause.tipus_id = parseInt(tipus_id);
        }

        const listItems = await lista_elem.findAll({
            where: whereClause,
            order: [['hozzaadva', 'DESC']],
            include: [
                {
                    model: anime_adatlap,
                    as: 'anime'
                },
                {
                    model: lista_tipus,
                    as: 'tipu'
                }
            ]
        });

        res.json({
            success: true,
            count: listItems.length,
            data: listItems
        });

    } catch (error) {
        console.error("Lista lekérdezési hiba:", error);
        res.status(500).json({
            success: false,
            error: 'Hiba a lista lekérdezése során',
            details: error.message
        });
    }
};

/**
 * @swagger
 * /api/list/types:
 *   get:
 *     summary: Lista típusok lekérése (Kedvenc, Megnézendő, stb.)
 *     tags: [List]
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       tipus:
 *                         type: string
 *                         example: "Kedvenc"
 *       500:
 *         description: Server hiba
 */
const getListTypes = async (req, res) => {
    try {
        const types = await lista_tipus.findAll({
            order: [['id', 'ASC']]
        });

        res.json({
            success: true,
            data: types
        });

    } catch (error) {
        console.error("Lista típusok lekérdezési hiba:", error);
        res.status(500).json({
            success: false,
            error: 'Hiba a lista típusok lekérdezése során',
            details: error.message
        });
    }
};

/**
 * @swagger
 * /api/list:
 *   post:
 *     summary: Anime hozzáadása a listához
 *     tags: [List]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - anime_id
 *               - tipus_id
 *             properties:
 *               anime_id:
 *                 type: integer
 *                 example: 1
 *               tipus_id:
 *                 type: integer
 *                 example: 1
 *                 description: "1=Kedvenc, 2=Megnézendő, 3=Teszelt, 4=Nem tetszett, 5=Droppolt"
 *     responses:
 *       201:
 *         description: Anime sikeresen hozzáadva
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
 *                   example: "Anime hozzáadva a listához"
 *                 data:
 *                   $ref: '#/components/schemas/ListItem'
 *       400:
 *         description: Hiányzó adatok vagy anime már a listában
 *       401:
 *         description: Nincs bejelentkezve
 *       500:
 *         description: Server hiba
 */
const addToList = async (req, res) => {
    try {
        const { anime_id, tipus_id } = req.body;

        if (!anime_id || !tipus_id) {
            return res.status(400).json({
                success: false,
                error: 'Anime ID és típus ID megadása kötelező!'
            });
        }

        // Ellenőrizzük, hogy létezik-e az anime
        const anime = await anime_adatlap.findByPk(anime_id);
        if (!anime) {
            return res.status(404).json({
                success: false,
                error: 'Az anime nem található!'
            });
        }

        // Ellenőrizzük, hogy létezik-e a típus
        const type = await lista_tipus.findByPk(tipus_id);
        if (!type) {
            return res.status(404).json({
                success: false,
                error: 'Érvénytelen lista típus!'
            });
        }

        // Ellenőrizzük, hogy már benne van-e a listában
        const existing = await lista_elem.findOne({
            where: {
                profil_id: req.user.id,
                anime_id: anime_id,
                tipus_id: tipus_id
            }
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'Ez az anime már benne van ebben a listában!'
            });
        }

        // Hozzáadás a listához
        const newListItem = await lista_elem.create({
            profil_id: req.user.id,
            anime_id,
            tipus_id
        });

        // Teljes adatok lekérése
        const fullListItem = await lista_elem.findByPk(newListItem.id, {
            include: [
                {
                    model: anime_adatlap,
                    as: 'anime'
                },
                {
                    model: lista_tipus,
                    as: 'tipu'
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Anime hozzáadva a listához',
            data: fullListItem
        });

    } catch (error) {
        console.error("Lista hozzáadási hiba:", error);
        res.status(500).json({
            success: false,
            error: 'Hiba az anime hozzáadása során',
            details: error.message
        });
    }
};

/**
 * @swagger
 * /api/list/{id}:
 *   put:
 *     summary: Lista elem típusának módosítása (pl. Megnézendő -> Kedvenc)
 *     tags: [List]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lista elem azonosítója
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipus_id
 *             properties:
 *               tipus_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Lista elem sikeresen frissítve
 *       401:
 *         description: Nincs bejelentkezve vagy nincs jogosultság
 *       404:
 *         description: Lista elem nem található
 *       500:
 *         description: Server hiba
 */
const updateListItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { tipus_id } = req.body;

        if (!tipus_id) {
            return res.status(400).json({
                success: false,
                error: 'Típus ID megadása kötelező!'
            });
        }

        const listItem = await lista_elem.findByPk(id);

        if (!listItem) {
            return res.status(404).json({
                success: false,
                error: 'Lista elem nem található'
            });
        }

        // Ellenőrizzük, hogy a felhasználó sajátja-e
        if (listItem.profil_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'Nincs jogosultsága ehhez a művelethez!'
            });
        }

        await listItem.update({ tipus_id });

        // Teljes adatok lekérése
        const updatedItem = await lista_elem.findByPk(id, {
            include: [
                {
                    model: anime_adatlap,
                    as: 'anime'
                },
                {
                    model: lista_tipus,
                    as: 'tipu'
                }
            ]
        });

        res.json({
            success: true,
            message: 'Lista elem sikeresen frissítve',
            data: updatedItem
        });

    } catch (error) {
        console.error("Lista frissítési hiba:", error);
        res.status(500).json({
            success: false,
            error: 'Hiba a lista elem frissítése során',
            details: error.message
        });
    }
};

/**
 * @swagger
 * /api/list/{id}:
 *   delete:
 *     summary: Anime eltávolítása a listából
 *     tags: [List]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lista elem azonosítója
 *     responses:
 *       200:
 *         description: Anime sikeresen eltávolítva
 *       401:
 *         description: Nincs bejelentkezve vagy nincs jogosultság
 *       404:
 *         description: Lista elem nem található
 *       500:
 *         description: Server hiba
 */
const removeFromList = async (req, res) => {
    try {
        const { id } = req.params;

        const listItem = await lista_elem.findByPk(id);

        if (!listItem) {
            return res.status(404).json({
                success: false,
                error: 'Lista elem nem található'
            });
        }

        // Ellenőrizzük, hogy a felhasználó sajátja-e
        if (listItem.profil_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'Nincs jogosultsága ehhez a művelethez!'
            });
        }

        await listItem.destroy();

        res.json({
            success: true,
            message: 'Anime eltávolítva a listából'
        });

    } catch (error) {
        console.error("Lista törlési hiba:", error);
        res.status(500).json({
            success: false,
            error: 'Hiba az anime eltávolítása során',
            details: error.message
        });
    }
};

module.exports = {
    getMyList,
    getListTypes,
    addToList,
    updateListItem,
    removeFromList
};
