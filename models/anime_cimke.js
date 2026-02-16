const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return anime_cimke.init(sequelize, DataTypes);
}

class anime_cimke extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    anime_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'anime_adatlap',
        key: 'id'
      }
    },
    cimke_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'cimke_lista',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'anime_cimke',
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
        name: "anime_id",
        using: "BTREE",
        fields: [
          { name: "anime_id" },
        ]
      },
      {
        name: "cimke_id",
        using: "BTREE",
        fields: [
          { name: "cimke_id" },
        ]
      },
    ]
  });
  }
}
