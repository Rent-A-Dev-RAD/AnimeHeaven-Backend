const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('animeheaven_database', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false, // Ne szemetelje tele a konzolt
});

// FONTOS: Közvetlenül a példányt kell exportálni!
module.exports = sequelize;