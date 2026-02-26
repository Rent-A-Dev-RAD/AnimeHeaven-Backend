const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getMe
} = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

// POST register - Regisztráció
router.post('/register', register);

// POST login - Bejelentkezés
router.post('/login', login);

// GET me - Bejelentkezett felhasználó adatai (védett endpoint)
router.get('/me', authMiddleware, getMe);

module.exports = router;
