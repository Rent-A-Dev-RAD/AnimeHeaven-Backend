const DataTypes = require("sequelize").DataTypes;
const _anime_adatlap = require("./anime_adatlap");
const _anime_cimke = require("./anime_cimke");
const _anime_studio = require("./anime_studio");
const _cimke_lista = require("./cimke_lista");
const _elozmeny = require("./elozmeny");
const _forras_elem = require("./forras_elem");
const _forras_tipus = require("./forras_tipus");
const _lista_elem = require("./lista_elem");
const _lista_tipus = require("./lista_tipus");
const _profil_adatlap = require("./profil_adatlap");
const _reszek = require("./reszek");
const _studio_lista = require("./studio_lista");

function initModels(sequelize) {
  const anime_adatlap = _anime_adatlap(sequelize, DataTypes);
  const anime_cimke = _anime_cimke(sequelize, DataTypes);
  const anime_studio = _anime_studio(sequelize, DataTypes);
  const cimke_lista = _cimke_lista(sequelize, DataTypes);
  const elozmeny = _elozmeny(sequelize, DataTypes);
  const forras_elem = _forras_elem(sequelize, DataTypes);
  const forras_tipus = _forras_tipus(sequelize, DataTypes);
  const lista_elem = _lista_elem(sequelize, DataTypes);
  const lista_tipus = _lista_tipus(sequelize, DataTypes);
  const profil_adatlap = _profil_adatlap(sequelize, DataTypes);
  const reszek = _reszek(sequelize, DataTypes);
  const studio_lista = _studio_lista(sequelize, DataTypes);

  anime_cimke.belongsTo(anime_adatlap, { as: "anime", foreignKey: "anime_id"});
  anime_adatlap.hasMany(anime_cimke, { as: "anime_cimkes", foreignKey: "anime_id"});
  anime_studio.belongsTo(anime_adatlap, { as: "anime", foreignKey: "anime_id"});
  anime_adatlap.hasMany(anime_studio, { as: "anime_studios", foreignKey: "anime_id"});
  elozmeny.belongsTo(anime_adatlap, { as: "anime", foreignKey: "anime_id"});
  anime_adatlap.hasMany(elozmeny, { as: "elozmenies", foreignKey: "anime_id"});
  lista_elem.belongsTo(anime_adatlap, { as: "anime", foreignKey: "anime_id"});
  anime_adatlap.hasMany(lista_elem, { as: "lista_elems", foreignKey: "anime_id"});
  reszek.belongsTo(anime_adatlap, { as: "anime", foreignKey: "anime_id"});
  anime_adatlap.hasMany(reszek, { as: "reszeks", foreignKey: "anime_id"});
  anime_cimke.belongsTo(cimke_lista, { as: "cimke", foreignKey: "cimke_id"});
  cimke_lista.hasMany(anime_cimke, { as: "anime_cimkes", foreignKey: "cimke_id"});
  forras_elem.belongsTo(forras_tipus, { as: "forra", foreignKey: "forras_id"});
  forras_tipus.hasMany(forras_elem, { as: "forras_elems", foreignKey: "forras_id"});
  lista_elem.belongsTo(lista_tipus, { as: "tipu", foreignKey: "tipus_id"});
  lista_tipus.hasMany(lista_elem, { as: "lista_elems", foreignKey: "tipus_id"});
  elozmeny.belongsTo(profil_adatlap, { as: "profil", foreignKey: "profil_id"});
  profil_adatlap.hasMany(elozmeny, { as: "elozmenies", foreignKey: "profil_id"});
  lista_elem.belongsTo(profil_adatlap, { as: "profil", foreignKey: "profil_id"});
  profil_adatlap.hasMany(lista_elem, { as: "lista_elems", foreignKey: "profil_id"});
  elozmeny.belongsTo(reszek, { as: "resz", foreignKey: "resz_id"});
  reszek.hasMany(elozmeny, { as: "elozmenies", foreignKey: "resz_id"});
  forras_elem.belongsTo(reszek, { as: "resz", foreignKey: "resz_id"});
  reszek.hasMany(forras_elem, { as: "forras_elems", foreignKey: "resz_id"});
  anime_studio.belongsTo(studio_lista, { as: "studio", foreignKey: "studio_id"});
  studio_lista.hasMany(anime_studio, { as: "anime_studios", foreignKey: "studio_id"});

  return {
    anime_adatlap,
    anime_cimke,
    anime_studio,
    cimke_lista,
    elozmeny,
    forras_elem,
    forras_tipus,
    lista_elem,
    lista_tipus,
    profil_adatlap,
    reszek,
    studio_lista,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
