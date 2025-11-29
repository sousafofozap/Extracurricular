const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Inscricao = sequelize.define("Inscricao", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  status_presenca: {
    type: DataTypes.ENUM("INSCRITO", "PRESENTE", "AUSENTE"),
    defaultValue: "INSCRITO",
  },
});

module.exports = Inscricao;
