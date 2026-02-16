const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return anime_studio.init(sequelize, DataTypes);
}

class anime_studio extends Sequelize.Model {
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
    studio_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'studio_lista',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'anime_studio',
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
        name: "studio_id",
        using: "BTREE",
        fields: [
          { name: "studio_id" },
        ]
      },
    ]
  });
  }
}
