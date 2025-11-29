const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const AtividadeCategoria = sequelize.define("AtividadeCategoria", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
});

module.exports = AtividadeCategoria;
