const mysql = require('mysql2');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'animeheaven_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

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
