const express = require('express');
const router = express.Router();
const {
    getAllAnimes,
    getAnimeById,
    createAnime,
    updateAnime,
    deleteAnime
} = require('../controllers/animeController');

// GET all animes
router.get('/', getAllAnimes);

// GET anime by ID
router.get('/:id', getAnimeById);

// POST create new anime
router.post('/', createAnime);

// PUT update anime
router.put('/:id', updateAnime);

// DELETE anime
router.delete('/:id', deleteAnime);

module.exports = router;
