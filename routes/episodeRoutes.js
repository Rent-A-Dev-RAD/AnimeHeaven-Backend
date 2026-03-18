const express = require('express');
const router = express.Router();
const {
    getEpisodesByAnimeId,
    createEpisode,
    updateEpisode,
    deleteEpisode
} = require('../controllers/episodeController');

// GET episodes by anime ID
router.get('/anime/:animeId', getEpisodesByAnimeId);

// POST create new episode
router.post('/', createEpisode);

// PUT update episode
router.put('/:id', updateEpisode);

// DELETE episode
router.delete('/:id', deleteEpisode);

module.exports = router;
