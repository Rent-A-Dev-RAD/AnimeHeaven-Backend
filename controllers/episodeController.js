const { reszek, forras_elem, forras_tipus, anime_adatlap } = require('../models');

const parseEpisodeSourcePayload = (body) => {
    const rawSources = [];
    let hasSourcePayload = false;

    if (Array.isArray(body.forrasok)) {
        hasSourcePayload = true;
        rawSources.push(...body.forrasok);
    }

    if (Array.isArray(body.sources)) {
        hasSourcePayload = true;
        rawSources.push(...body.sources);
    }

    const objectSourceCollections = [body.forrasok, body.sources]
        .filter((value) => value && typeof value === 'object' && !Array.isArray(value));

    for (const collection of objectSourceCollections) {
        hasSourcePayload = true;
        for (const [key, value] of Object.entries(collection)) {
            rawSources.push({ nev: key, link: value });
        }
    }

    const directSourceFieldMap = {
        inda: 'INDA',
        inda_link: 'INDA',
        inda_url: 'INDA',
        indaUrl: 'INDA',
        videa: 'VIDEA',
        videa_link: 'VIDEA',
        videa_url: 'VIDEA',
        videaUrl: 'VIDEA'
    };

    for (const [field, sourceName] of Object.entries(directSourceFieldMap)) {
        if (Object.prototype.hasOwnProperty.call(body, field)) {
            hasSourcePayload = true;
            rawSources.push({ nev: sourceName, link: body[field] });
        }
    }

    return {
        hasSourcePayload,
        rawSources
    };
};

const upsertEpisodeSources = async (episodeId, rawSources) => {
    if (!rawSources || rawSources.length === 0) {
        return;
    }

    const sourceTypes = await forras_tipus.findAll({
        attributes: ['id', 'nev']
    });

    const sourceTypesById = new Map();
    const sourceTypesByName = new Map();

    for (const sourceType of sourceTypes) {
        sourceTypesById.set(Number(sourceType.id), sourceType.id);
        sourceTypesByName.set(String(sourceType.nev).trim().toLowerCase(), sourceType.id);
    }

    for (const rawSource of rawSources) {
        if (!rawSource || typeof rawSource !== 'object') {
            continue;
        }

        const sourceIdCandidate = rawSource.forras_id ?? rawSource.source_id ?? rawSource.forrasId ?? rawSource.sourceTypeId ?? rawSource.type_id;
        const sourceNameCandidate = rawSource.nev ?? rawSource.name ?? rawSource.type;
        const sourceLinkCandidate = rawSource.link ?? rawSource.url ?? rawSource.href;

        let sourceTypeId = null;

        if (sourceIdCandidate !== undefined && sourceIdCandidate !== null && sourceIdCandidate !== '') {
            const numericSourceId = Number(sourceIdCandidate);
            if (!Number.isInteger(numericSourceId) || !sourceTypesById.has(numericSourceId)) {
                const error = new Error(`Érvénytelen forrás típus ID: ${sourceIdCandidate}`);
                error.status = 400;
                throw error;
            }
            sourceTypeId = sourceTypesById.get(numericSourceId);
        } else if (sourceNameCandidate !== undefined && sourceNameCandidate !== null) {
            const normalizedSourceName = String(sourceNameCandidate).trim().toLowerCase();
            if (!sourceTypesByName.has(normalizedSourceName)) {
                const error = new Error(`Ismeretlen forrás típus: ${sourceNameCandidate}`);
                error.status = 400;
                throw error;
            }
            sourceTypeId = sourceTypesByName.get(normalizedSourceName);
        } else {
            continue;
        }

        const existingSource = await forras_elem.findOne({
            where: {
                resz_id: episodeId,
                forras_id: sourceTypeId
            }
        });

        const normalizedLink = sourceLinkCandidate === null || sourceLinkCandidate === undefined
            ? null
            : String(sourceLinkCandidate).trim();

        if (!normalizedLink) {
            if (existingSource) {
                await existingSource.destroy();
            }
            continue;
        }

        if (existingSource) {
            await existingSource.update({ link: normalizedLink });
        } else {
            await forras_elem.create({
                forras_id: sourceTypeId,
                resz_id: episodeId,
                link: normalizedLink
            });
        }
    }
};

/**
 * @swagger
 * components:
 *   schemas:
 *     Episode:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         anime_id:
 *           type: integer
 *           example: 5
 *         sorrend:
 *           type: integer
 *           example: 1
 *         resz:
 *           type: string
 *           example: "1. rész"
 *         lathatosag:
 *           type: boolean
 *           example: true
 *         forras_elems:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               link:
 *                 type: string
 *               forra:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nev:
 *                     type: string
 */

/**
 * @swagger
 * /api/episodes/anime/{animeId}:
 *   get:
 *     summary: Anime részek lekérése anime ID alapján
 *     tags: [Episodes]
 *     parameters:
 *       - in: path
 *         name: animeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Anime azonosítója
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
 *                   example: 12
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Episode'
 *       404:
 *         description: Nem található részek ehhez az animéhez
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
const getEpisodesByAnimeId = async (req, res) => {
    try {
        const { animeId } = req.params;

        const episodes = await reszek.findAll({
            where: { anime_id: animeId },
            order: [['sorrend', 'ASC']],
            include: [
                {
                    model: forras_elem,
                    as: 'forras_elems',
                    include: [
                        {
                            model: forras_tipus,
                            as: 'forra'
                        }
                    ]
                }
            ]
        });

        if (!episodes || episodes.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Nem található részek ehhez az animéhez'
            });
        }

        res.json({
            success: true,
            count: episodes.length,
            data: episodes
        });

    } catch (error) {
        console.error("Részek lekérdezési hiba:", error);
        res.status(500).json({
            success: false,
            error: 'Hiba a részek lekérdezése során',
            details: error.message
        });
    }
};

/**
 * @swagger
 * /api/episodes:
 *   post:
 *     summary: Új epizód hozzáadása
 *     tags: [Episodes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - anime_id
 *               - sorrend
 *             properties:
 *               anime_id:
 *                 type: integer
 *                 example: 5
 *               sorrend:
 *                 type: integer
 *                 example: 1
 *               resz:
 *                 type: string
 *                 example: "1. rész"
 *               lathatosag:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Epizód sikeresen létrehozva
 *       400:
 *         description: Hiányzó vagy hibás adatok
 *       404:
 *         description: Az anime nem található
 *       500:
 *         description: Server hiba
 */
const createEpisode = async (req, res) => {
    try {
        const { anime_id, sorrend, resz, lathatosag } = req.body;
        const { hasSourcePayload, rawSources } = parseEpisodeSourcePayload(req.body);

        if (!anime_id || sorrend === undefined || sorrend === null) {
            return res.status(400).json({
                success: false,
                error: 'Anime ID és sorrend megadása kötelező!'
            });
        }

        if (!Number.isInteger(Number(anime_id)) || !Number.isInteger(Number(sorrend))) {
            return res.status(400).json({
                success: false,
                error: 'Az anime_id és sorrend egész szám kell legyen!'
            });
        }

        const anime = await anime_adatlap.findByPk(anime_id);
        if (!anime) {
            return res.status(404).json({
                success: false,
                error: 'Az anime nem található!'
            });
        }

        const episode = await reszek.create({
            anime_id: Number(anime_id),
            sorrend: Number(sorrend),
            resz: resz || null,
            lathatosag: lathatosag === undefined ? true : Boolean(lathatosag)
        });

        if (hasSourcePayload) {
            await upsertEpisodeSources(episode.id, rawSources);
        }

        const fullEpisode = await reszek.findByPk(episode.id, {
            include: [
                {
                    model: forras_elem,
                    as: 'forras_elems',
                    include: [
                        {
                            model: forras_tipus,
                            as: 'forra'
                        }
                    ]
                }
            ]
        });

        return res.status(201).json({
            success: true,
            message: 'Epizód sikeresen létrehozva',
            data: fullEpisode
        });
    } catch (error) {
        console.error('Epizód létrehozási hiba:', error);
        const statusCode = error.status || 500;
        return res.status(statusCode).json({
            success: false,
            error: 'Hiba az epizód létrehozása során',
            details: error.message
        });
    }
};

/**
 * @swagger
 * /api/episodes/{id}:
 *   put:
 *     summary: Epizód szerkesztése
 *     tags: [Episodes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Epizód azonosítója
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               anime_id:
 *                 type: integer
 *               sorrend:
 *                 type: integer
 *               resz:
 *                 type: string
 *               lathatosag:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Epizód sikeresen frissítve
 *       400:
 *         description: Érvénytelen adatok
 *       404:
 *         description: Epizód vagy anime nem található
 *       500:
 *         description: Server hiba
 */
const updateEpisode = async (req, res) => {
    try {
        const { id } = req.params;
        const { anime_id, sorrend, resz, lathatosag } = req.body;
        const { hasSourcePayload, rawSources } = parseEpisodeSourcePayload(req.body);

        const episode = await reszek.findByPk(id);

        if (!episode) {
            return res.status(404).json({
                success: false,
                error: 'Epizód nem található'
            });
        }

        const updateData = {};

        if (anime_id !== undefined) {
            if (!Number.isInteger(Number(anime_id))) {
                return res.status(400).json({
                    success: false,
                    error: 'Az anime_id egész szám kell legyen!'
                });
            }

            const anime = await anime_adatlap.findByPk(anime_id);
            if (!anime) {
                return res.status(404).json({
                    success: false,
                    error: 'Az anime nem található!'
                });
            }
            updateData.anime_id = Number(anime_id);
        }

        if (sorrend !== undefined) {
            if (!Number.isInteger(Number(sorrend))) {
                return res.status(400).json({
                    success: false,
                    error: 'A sorrend egész szám kell legyen!'
                });
            }
            updateData.sorrend = Number(sorrend);
        }

        if (resz !== undefined) {
            updateData.resz = resz;
        }

        if (lathatosag !== undefined) {
            updateData.lathatosag = Boolean(lathatosag);
        }

        if (Object.keys(updateData).length === 0 && !hasSourcePayload) {
            return res.status(400).json({
                success: false,
                error: 'Nincs frissíthető mező a kérésben!'
            });
        }

        if (Object.keys(updateData).length > 0) {
            await episode.update(updateData);
        }

        if (hasSourcePayload) {
            await upsertEpisodeSources(episode.id, rawSources);
        }

        const updatedEpisode = await reszek.findByPk(id, {
            include: [
                {
                    model: forras_elem,
                    as: 'forras_elems',
                    include: [
                        {
                            model: forras_tipus,
                            as: 'forra'
                        }
                    ]
                }
            ]
        });

        return res.json({
            success: true,
            message: 'Epizód sikeresen frissítve',
            data: updatedEpisode
        });
    } catch (error) {
        console.error('Epizód frissítési hiba:', error);
        const statusCode = error.status || 500;
        return res.status(statusCode).json({
            success: false,
            error: 'Hiba az epizód frissítése során',
            details: error.message
        });
    }
};

/**
 * @swagger
 * /api/episodes/{id}:
 *   delete:
 *     summary: Epizód törlése
 *     tags: [Episodes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Epizód azonosítója
 *     responses:
 *       200:
 *         description: Epizód sikeresen törölve
 *       404:
 *         description: Epizód nem található
 *       500:
 *         description: Server hiba
 */
const deleteEpisode = async (req, res) => {
    try {
        const { id } = req.params;

        const episode = await reszek.findByPk(id);

        if (!episode) {
            return res.status(404).json({
                success: false,
                error: 'Epizód nem található'
            });
        }

        await episode.destroy();

        return res.json({
            success: true,
            message: 'Epizód sikeresen törölve'
        });
    } catch (error) {
        console.error('Epizód törlési hiba:', error);
        return res.status(500).json({
            success: false,
            error: 'Hiba az epizód törlése során',
            details: error.message
        });
    }
};

module.exports = {
    getEpisodesByAnimeId,
    createEpisode,
    updateEpisode,
    deleteEpisode
};
