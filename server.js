const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/database');
const animeRoutes = require('./routes/animeRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'AnimeHeaven Backend API is running',
        timestamp: new Date().toISOString()
    });
});

app.use('/api/animes', animeRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

const startServer = async () => {
    try {
        const dbConnected = await testConnection();

        if (!dbConnected) {
            console.warn('⚠️  jajjj moretti hat nincs szerohoz csatlakozasom');
            console.warn('⚠️  inditsd el a xampp-ot battyam');
        }

        app.listen(PORT, () => {
            console.log('=================================');
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
            console.log(`📍 API endpoint: http://localhost:${PORT}/api/animes`);
            console.log(`🌐 Frontend URL (persze ha elindítod a frontendet): ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
            console.log('=================================');
        });
    } catch (error) {
        console.error('❌ Gatya rotty, Nem sikerült elindítani a szervert:', error);
        process.exit(1);
    }
};

startServer();
