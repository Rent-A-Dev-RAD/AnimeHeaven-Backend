const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return cimke_lista.init(sequelize, DataTypes);
}

class cimke_lista extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    cimke_nev: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: "cimke_nev"
    }
  }, {
    sequelize,
    tableName: 'cimke_lista',
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
        name: "cimke_nev",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "cimke_nev" },
        ]
      },
    ]
  });
  }
}
