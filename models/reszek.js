const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return reszek.init(sequelize, DataTypes);
}

class reszek extends Sequelize.Model {
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
    sorrend: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    resz: {
      type: DataTypes.STRING(25),
      allowNull: true
    },
    lathatosag: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'reszek',
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
    ]
  });
  }
}
