const { Op } = require('sequelize');
const { sequelize, anime_adatlap, reszek, cimke_lista, studio_lista, anime_cimke, anime_studio } = require('../models');
/**
 * @swagger
 * components:
 *   schemas:
 *     Anime:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         cim:
 *           type: string
 *           example: "Attack on Titan"
 *         statusz:
 *           type: string
 *           example: "folyamatban"
 *         cimkek:
 *           type: array
 *           items:
 *             type: string
 *           example: ["akció", "dráma"]
 *       required:
 *         - id
 *         - cim
 */

/**
 * @swagger
 * /api/animes:
 *   get:
 *     summary: Összes anime lekérése
 *     tags: [Animes]
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
 *                   items:
 *                     $ref: '#/components/schemas/Anime'
 *       500:
 *         description: Server hiba
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const getAllAnimes = async (req, res) => {
    try {
        // Csak a lapozást hagyjuk meg, hogy ne omoljon össze a szerver 1 millió rekordnál
        const { limit = 50, offset = 0 } = req.query;

        const animes = await anime_adatlap.findAll({
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['ertekeles', 'DESC']], // Legjobbak elöl
            include: [
                {
                    model: anime_cimke,
                    as: 'anime_cimkes',
                    include: [{
                        model: cimke_lista,
                        as: 'cimke'
                    }]
                },
                {
                    model: anime_studio,
                    as: 'anime_studios',
                    include: [{
                        model: studio_lista,
                        as: 'studio'
                    }]
                }
            ]
        });

        res.json({ 
            success: true, 
            count: animes.length, 
            data: animes 
        });

    } catch (error) {
        console.error("Lekérdezési hiba:", error);
        res.status(500).json({ 
            success: false, 
            error: 'Hiba a lekérdezés során',
            details: error.message 
        });
    }
};
/**
 * @swagger
 * /api/animes/{id}:
 *   get:
 *     summary: Egy anime lekérése ID alapján
 *     tags: [Animes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Az anime egyedi azonosítója
 *         example: 1
 *     responses:
 *       200:
 *         description: Sikeres lekérdezés!
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Anime'
 *       404:
 *         description: Anime nem található
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Anime not found with id: 999"
 *       400:
 *         description: Érvénytelen ID formátum
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid ID format"
 */
const getAnimeById = async (req, res) => {
    try {
        const { id } = req.params;
        const anime = await anime_adatlap.findByPk(id, {
            include: [
                {
                    model: anime_cimke,
                    as: 'anime_cimkes',
                    include: [{
                        model: cimke_lista,
                        as: 'cimke'
                    }]
                },
                {
                    model: anime_studio,
                    as: 'anime_studios',
                    include: [{
                        model: studio_lista,
                        as: 'studio'
                    }]
                }
            ]
        });

        if (!anime) {
            return res.status(404).json({ success: false, message: 'Anime nem található' });
        }

        res.json({ success: true, data: anime });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
};
/**
 * @swagger
 * /api/animes:
 *   post:
 *     summary: Új anime hozzáadása
 *     tags: [Animes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - japan_cim
 *             properties:
 *               japan_cim:
 *                 type: string
 *                 description: Japán cím
 *                 example: "進撃の巨人"
 *               angol_cim:
 *                 type: string
 *                 description: Angol cím
 *                 example: "Attack on Titan"
 *               cimkek:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Anime címkék/műfajok
 *                 example: ["akció", "dráma", "fantasy"]
 *               studiok:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Animációs stúdiók
 *                 example: ["Wit Studio", "MAPPA"]
 *               leiras:
 *                 type: string
 *                 description: Anime leírása
 *                 example: "Az emberiség utolsó reménysége..."
 *               statusz:
 *                 type: string
 *                 enum: [folyamatban, befejezett, szunetel]
 *                 default: folyamatban
 *                 description: Anime státusza
 *               evad:
 *                 type: integer
 *                 minimum: 2000
 *                 maximum: 2024
 *                 description: Megjelenés éve
 *                 example: 2013
 *     responses:
 *       201:
 *         description: Anime sikeresen létrehozva
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Anime'
 *       400:
 *         description: Érvénytelen adatok
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Már létezik ilyen anime
 */
const createAnime = async (req, res) => {
    try {
        const { japan_cim, angol_cim, leiras, statusz, cimkek, studiok } = req.body;

        // 1. Létrehozzuk az alap Anime rekordot
        const newAnime = await anime_adatlap.create({
            japan_cim,
            angol_cim,
            leiras,
            statusz,
            lathatosag: 1 // Alapértelmezett érték
        });

        // 2. Címkék összekötése (ha vannak)
        if (cimkek && cimkek.length > 0) {
            for (const cimkeNev of cimkek) {
                // Megkeressük vagy létrehozzuk a címkét a listában
                const [cimkeRecord] = await cimke_lista.findOrCreate({
                    where: { cimke_nev: cimkeNev }
                });
                
                // Manuálisan mentünk a KAPCSOLÓTÁBLÁBA
                await anime_cimke.create({
                    anime_id: newAnime.id,
                    cimke_id: cimkeRecord.id
                });
            }
        }

        // 3. Stúdiók összekötése (ha vannak)
        if (studiok && studiok.length > 0) {
            for (const studioNev of studiok) {
                const [studioRecord] = await studio_lista.findOrCreate({
                    where: { studio_nev: studioNev }
                });

                await anime_studio.create({
                    anime_id: newAnime.id,
                    studio_id: studioRecord.id
                });
            }
        }

        res.status(201).json({
            success: true,
            message: "Anime sikeresen létrehozva!",
            data: newAnime
        });

    } catch (error) {
        console.error("POST Hiba:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};
/**
 * @swagger
 * /api/animes/{id}:
 *   put:
 *     summary: Anime teljes adatainak frissítése
 *     tags: [Animes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: A frissítendő anime azonosítója
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - japan_cim
 *               - angol_cim
 *               - leiras
 *             properties:
 *               japan_cim:
 *                 type: string
 *                 description: Japán cím
 *                 example: "進撃の巨人"
 *               angol_cim:
 *                 type: string
 *                 description: Angol cím
 *                 example: "Attack on Titan"
 *               leiras:
 *                 type: string
 *                 description: Anime leírása
 *                 example: "Az emberiség utolsó városában az óriások elleni küzdelem..."
 *               cimkek:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Műfajok/címkék
 *                 example: ["akció", "dráma", "fantasy"]
 *               studiok:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Gyártó stúdiók
 *                 example: ["Wit Studio", "MAPPA"]
 *               statusz:
 *                 type: string
 *                 enum: [folyamatban, befejezett, szunetel]
 *                 description: Anime státusza
 *                 example: "befejezett"
 *               evad:
 *                 type: integer
 *                 description: Megjelenés éve
 *                 example: 2013
 *     responses:
 *       200:
 *         description: Anime sikeresen frissítve
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 japan_cim:
 *                   type: string
 *                   example: "進撃の巨人"
 *                 angol_cim:
 *                   type: string
 *                   example: "Attack on Titan"
 *                 leiras:
 *                   type: string
 *                 cimkek:
 *                   type: array
 *                   items:
 *                     type: string
 *                 studiok:
 *                   type: array
 *                   items:
 *                     type: string
 *                 statusz:
 *                   type: string
 *                 evad:
 *                   type: integer
 *                 frissitve:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:30:00Z"
 *       400:
 *         description: Érvénytelen adatok vagy hiányzó kötelező mezők
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "japan_cim is required"
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *       404:
 *         description: Anime nem található
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Anime not found with id: 99"
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *       500:
 *         description: Szerverhiba
 */
const updateAnime = async (req, res) => {
    try {
        const { id } = req.params;
        const { japan_cim, angol_cim, leiras, statusz, cimkek, studiok } = req.body;

        // 1. Megkeressük az animét
        const anime = await anime_adatlap.findByPk(id);
        if (!anime) {
            return res.status(404).json({ success: false, message: 'Anime nem található' });
        }

        // 2. Alapadatok frissítése
        await anime.update({ japan_cim, angol_cim, leiras, statusz });

        // 3. Címkék frissítése (Töröljük a régieket, és hozzáadjuk az újakat)
        if (cimkek) {
            // Régi kapcsolatok törlése ehhez az animéhez
            await anime_cimke.destroy({ where: { anime_id: id } });

            // Újak felvétele
            for (const cimkeNev of cimkek) {
                const [cimkeRecord] = await cimke_lista.findOrCreate({
                    where: { cimke_nev: cimkeNev }
                });
                await anime_cimke.create({
                    anime_id: id,
                    cimke_id: cimkeRecord.id
                });
            }
        }

        // 4. Stúdiók frissítése
        if (studiok) {
            await anime_studio.destroy({ where: { anime_id: id } });

            for (const studioNev of studiok) {
                const [studioRecord] = await studio_lista.findOrCreate({
                    where: { studio_nev: studioNev }
                });
                await anime_studio.create({
                    anime_id: id,
                    studio_id: studioRecord.id
                });
            }
        }

        res.json({ success: true, message: "Anime adatai sikeresen frissítve!" });

    } catch (error) {
        console.error("UPDATE Hiba:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};
/**
 * @swagger
 * /api/animes/{id}:
 *   delete:
 *     summary: Anime törlése
 *     description: Eltávolít egy anime rekordot az adatbázisból azonosító alapján
 *     tags: [Animes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: A törlendő anime egyedi azonosítója
 *         example: 1
 *     responses:
 *       200:
 *         description: Anime sikeresen törölve
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Anime successfully deleted"
 *                 id:
 *                   type: integer
 *                   example: 1
 *       404:
 *         description: Anime nem található
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Anime not found with id: 99"
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *       500:
 *         description: Szerverhiba
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
const deleteAnime = async (req, res) => {
    try {
        const result = await anime_adatlap.destroy({ where: { id: req.params.id } });
        if (!result) return res.status(404).json({ success: false, error: 'Nem található' });
        res.json({ success: true, message: 'Törölve' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { getAllAnimes, getAnimeById, createAnime, updateAnime, deleteAnime };