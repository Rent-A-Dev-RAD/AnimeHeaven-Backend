const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return forras_elem.init(sequelize, DataTypes);
}

class forras_elem extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    forras_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'forras_tipus',
        key: 'id'
      }
    },
    resz_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'reszek',
        key: 'id'
      }
    },
    link: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'forras_elem',
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
        name: "forras_id",
        using: "BTREE",
        fields: [
          { name: "forras_id" },
        ]
      },
      {
        name: "resz_id",
        using: "BTREE",
        fields: [
          { name: "resz_id" },
        ]
      },
    ]
  });
  }
}
