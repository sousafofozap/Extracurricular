const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Atividade = sequelize.define("Atividade", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descricao: {
    type: DataTypes.TEXT,
  },
  horario_inicio: {
    type: DataTypes.DATE,    //ex: 2025-11-15T12:41:00Z
    allowNull: false,
  },
  duracao_horas: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  vagas_total: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  pago: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  checkin_token: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  checkin_token_expires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

module.exports = Atividade;
