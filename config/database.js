const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('animeheaven_database', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false, // Ne szemetelje tele a konzolt
});

<<<<<<< HEAD
// FONTOS: Közvetlenül a példányt kell exportálni!
module.exports = sequelize;
=======
// Get promise-based pool
const promisePool = pool.promise();

// Test connection (silent mode for health checks)
const testConnection = async (silent = false) => {
    try {
        const [rows] = await promisePool.query('SELECT 1');
        if (!silent) {
            console.log('✅ Database connected successfully');
        }
        return true;
    } catch (error) {
        if (!silent) {
            console.error('❌ Database connection failed:', error.message);
        }
        return false;
    }
};

module.exports = {
    pool: promisePool,
    testConnection
};
>>>>>>> a89f4ffecdca6481134253c29d694c8a65713415
