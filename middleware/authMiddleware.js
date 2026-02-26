const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'animeheaven_titkos_kulcs_2026';

/**
 * Middleware a JWT token ellenőrzéséhez
 * A token-t a request Authorization header-ében várja: "Bearer <token>"
 */
const authMiddleware = (req, res, next) => {
    try {
        // Token kinyerése a header-ből
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Nincs token megadva! Kérjük, jelentkezzen be!'
            });
        }

        const token = authHeader.substring(7); // "Bearer " eltávolítása

        // Token ellenőrzése és dekódolása
        const decoded = jwt.verify(token, JWT_SECRET);

        // Felhasználó adatok hozzáadása a request-hez
        req.user = {
            id: decoded.id,
            email: decoded.email,
            jogosultsag: decoded.jogosultsag
        };

        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'A token lejárt! Kérjük, jelentkezzen be újra!'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: 'Érvénytelen token!'
            });
        }

        return res.status(500).json({
            success: false,
            error: 'Token ellenőrzési hiba',
            details: error.message
        });
    }
};

/**
 * Middleware csak admin jogosultságú felhasználóknak
 * Használat: authMiddleware után kell használni
 */
const adminMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'Nincs bejelentkezve!'
        });
    }

    // Jogosultság ellenőrzése (5 = tulajdonos/admin)
    if (req.user.jogosultsag < 4) {
        return res.status(403).json({
            success: false,
            error: 'Nincs jogosultsága ehhez a művelethez! Csak adminok számára elérhető.'
        });
    }

    next();
};

module.exports = {
    authMiddleware,
    adminMiddleware
};
