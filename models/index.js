const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Ellenőrizd, hogy itt van-e a db configod!
const _initModels = require('./init-models'); // Ez a sequelize-auto által generált fájl

// Inicializáljuk a modelleket
const models = _initModels(sequelize);

if (!sequelize) {
    console.error("HIBA: A Sequelize példány nem jött létre! Ellenőrizd a config/database.js fájlt.");
}
// Exportáljuk a sequelize példányt és az összes modellt
module.exports = {
    sequelize,
    Sequelize,
    ...models
};