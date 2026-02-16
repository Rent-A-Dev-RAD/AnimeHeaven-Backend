const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return profil_adatlap.init(sequelize, DataTypes);
}

class profil_adatlap extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "email"
    },
    felhasznalonev: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    jelszo: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    salt: {
      type: DataTypes.STRING(64),
      allowNull: false,
      comment: "Csak egyedi hash algoritmus esetén! Bcrypt\/Argon2 nem igényli."
    },
    profilkep: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    jogosultsag: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'profil_adatlap',
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
        name: "email",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "email" },
        ]
      },
    ]
  });
  }
}
