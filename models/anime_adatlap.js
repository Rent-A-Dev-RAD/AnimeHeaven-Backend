const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return anime_adatlap.init(sequelize, DataTypes);
}

class anime_adatlap extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    mal_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: "mal_id"
    },
    borito: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    hatter: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    japan_cim: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    angol_cim: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    leiras: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    megjelenes: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    besorolas: {
      type: DataTypes.ENUM('G','PG','PG-13','R-17+','R+-18+','Besorolás alatt'),
      allowNull: true,
      defaultValue: "Besorolás alatt"
    },
    statusz: {
      type: DataTypes.ENUM('Hamarosan','Fut','Befejezett','Felfüggesztett'),
      allowNull: true,
      defaultValue: "Hamarosan"
    },
    tipus: {
      type: DataTypes.ENUM('TV','Film','OVA','ONA','Special'),
      allowNull: true,
      defaultValue: "TV"
    },
    szezon: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    keszito: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    ertekeles: {
      type: DataTypes.DECIMAL(3,1),
      allowNull: true
    },
    feltoltes_ido: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('curdate')
    },
    lathatosag: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
    },
    osszes_epizod: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    jelenlegi_epizod: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    trailer: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'anime_adatlap',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "mal_id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "mal_id" },
        ]
      },
    ]
  });
  }
}
