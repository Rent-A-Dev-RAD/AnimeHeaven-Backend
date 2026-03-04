const express = require('express');
const router = express.Router();
const {
    getProfile,
    updateProfile,
    updateProfilePicture
} = require('../controllers/profileController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Minden profil endpoint védett (csak bejelentkezett felhasználóknak)

// GET profile - Saját profil adatok
router.get('/', authMiddleware, getProfile);

// PUT profile - Teljes profil frissítése
router.put('/', authMiddleware, updateProfile);

// PUT profile picture - Csak profilkép frissítése
router.put('/picture', authMiddleware, updateProfilePicture);

module.exports = router;
