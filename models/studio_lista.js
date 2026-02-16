const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return studio_lista.init(sequelize, DataTypes);
}

class studio_lista extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    studio_nev: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "studio_nev"
    }
  }, {
    sequelize,
    tableName: 'studio_lista',
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
        name: "studio_nev",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "studio_nev" },
        ]
      },
    ]
  });
  }
}
