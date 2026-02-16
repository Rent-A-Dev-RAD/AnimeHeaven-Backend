const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return lista_tipus.init(sequelize, DataTypes);
}

class lista_tipus extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    tipus: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: "tipus"
    }
  }, {
    sequelize,
    tableName: 'lista_tipus',
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
        name: "tipus",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "tipus" },
        ]
      },
    ]
  });
  }
}
