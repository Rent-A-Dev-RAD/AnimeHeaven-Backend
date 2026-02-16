const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return forras_tipus.init(sequelize, DataTypes);
}

class forras_tipus extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nev: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: "nev"
    }
  }, {
    sequelize,
    tableName: 'forras_tipus',
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
        name: "nev",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "nev" },
        ]
      },
    ]
  });
  }
}
