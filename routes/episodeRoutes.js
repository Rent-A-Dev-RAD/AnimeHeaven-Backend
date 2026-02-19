const express = require('express');
const router = express.Router();
const {
    getEpisodesByAnimeId
} = require('../controllers/episodeController');

// GET episodes by anime ID
router.get('/anime/:animeId', getEpisodesByAnimeId);

module.exports = router;
