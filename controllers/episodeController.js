const { reszek, forras_elem, forras_tipus } = require('../models');

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

module.exports = {
    getEpisodesByAnimeId
};
