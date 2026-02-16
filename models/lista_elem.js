const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return lista_elem.init(sequelize, DataTypes);
}

class lista_elem extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    profil_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'profil_adatlap',
        key: 'id'
      }
    },
    anime_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'anime_adatlap',
        key: 'id'
      }
    },
    tipus_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'lista_tipus',
        key: 'id'
      }
    },
    hozzaadva: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'lista_elem',
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
        name: "profil_id",
        using: "BTREE",
        fields: [
          { name: "profil_id" },
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
        name: "tipus_id",
        using: "BTREE",
        fields: [
          { name: "tipus_id" },
        ]
      },
    ]
  });
  }
}
