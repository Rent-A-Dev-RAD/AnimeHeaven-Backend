const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();

// Modellek és Sequelize példány importálása
const { sequelize } = require('./models');
const animeRoutes = require('./routes/animeRoutes');
const userRoutes = require('./routes/userRoutes');
const episodeRoutes = require('./routes/episodeRoutes');

const app = express();
const PORT = process.env.PORT || 3001;
const serverStartTime = new Date();

// --- Swagger Konfiguráció ---
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'AnimeHeaven API',
            version: '1.0.0',
            description: 'Sequelize ORM alapú Anime adatbázis kezelő API',
        },
        servers: [{ url: `http://localhost:${PORT}` }],
        components: {
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        error: { type: 'string', example: 'Hibaüzenet helye' }
                    }
                },
                Anime: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        japan_cim: { type: 'string' },
                        angol_cim: { type: 'string' },
                        ertekeles: { type: 'number' }
                        // Itt sorolhatod fel a többi mezőt is
                    }
                }
            }
        }
    },
    apis: ['./routes/*.js', './controllers/*.js'],
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
// Health check route
app.get('/api/health', async (req, res) => {
    let dbStatus = false;
    try {
        await sequelize.authenticate();
        dbStatus = true;
    } catch (e) {
        dbStatus = false;
    }

    const uptimeMs = new Date() - serverStartTime;

    res.json({
        success: true,
        status: dbStatus ? 'Aktív' : 'Adatbázis hiba',
        uptimeMs: uptimeMs,
        database: {
            connected: dbStatus,
            status: dbStatus ? 'Csatlakozva' : 'Kapcsolat hiba'
        },
        version: '1.0.0'
    });
});

app.use(express.urlencoded({ extended: true }));


// Swagger UI útvonal
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});


app.use('/api/animes', animeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/episodes', episodeRoutes);

// Error handlers
app.use((req, res) => res.status(404).json({ success: false, error: 'Route not found' }));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Internal server error' });
});

// Szerver indítása
const startServer = async () => {
    try {
        // Kapcsolat ellenőrzése
        await sequelize.authenticate();
        console.log('✅ Sikeres adatbázis kapcsolat (Sequelize)');

        // Opcionális: Táblák szinkronizálása (Csak ha módosítottad a modelleket és akarod a változást a DB-ben)
        // await sequelize.sync({ alter: false }); 

        app.listen(PORT, () => {
            console.log('=================================');
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📖 Swagger: http://localhost:${PORT}/swagger`);
            console.log(`📍 Health: http://localhost:${PORT}/api/health`);
            console.log('=================================');

        });
    } catch (error) {
        console.error('❌ Nem sikerült csatlakozni az adatbázishoz (xampp fut?):', error);
        console.warn('⚠️  jajjj moretti hat nincs szerohoz csatlakozasom');

        // Elindítjuk a szervert DB nélkül is, hogy legalább az API hibaüzenetet tudjon adni
        app.listen(PORT, () => {
            console.log(`🚀 Server started but database is OFFLINE on port ${PORT}`);
        });
    }
};

startServer();