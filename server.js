const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/database');
const animeRoutes = require('./routes/animeRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Server start time
const serverStartTime = new Date();

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
app.get('/api/health', async (req, res) => {
    // Check database connection (silent mode to avoid log spam)
    const dbStatus = await testConnection(true);

    // Calculate uptime
    const now = new Date();
    const uptimeMs = now - serverStartTime;
    const uptimeSeconds = Math.floor(uptimeMs / 1000);
    const uptimeMinutes = Math.floor(uptimeSeconds / 60);
    const uptimeHours = Math.floor(uptimeMinutes / 60);
    const uptimeDays = Math.floor(uptimeHours / 24);

    let uptimeString = '';
    if (uptimeDays > 0) {
        uptimeString = `${uptimeDays} nap, ${uptimeHours % 24} óra`;
    } else if (uptimeHours > 0) {
        uptimeString = `${uptimeHours} óra, ${uptimeMinutes % 60} perc`;
    } else if (uptimeMinutes > 0) {
        uptimeString = `${uptimeMinutes} perc, ${uptimeSeconds % 60} másodperc`;
    } else {
        uptimeString = `${uptimeSeconds} másodperc`;
    }

    res.json({
        success: true,
        status: dbStatus ? 'Aktív' : 'Adatbázis hiba',
        message: 'AnimeHeaven Backend API is running',
        timestamp: now.toISOString(),
        startTime: serverStartTime.toISOString(),
        uptime: uptimeString,
        uptimeMs: uptimeMs,
        database: {
            connected: dbStatus,
            status: dbStatus ? 'Csatlakozva' : 'Kapcsolat hiba'
        },
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
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
