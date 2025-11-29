const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const AtividadeResponsavel = sequelize.define("AtividadeResponsavel", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
});

module.exports = AtividadeResponsavel;
