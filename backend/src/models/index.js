const sequelize = require("../db");
const Usuario = require("./Usuario");
const Atividade = require("./Atividade");
const Inscricao = require("./Inscricao");
const AtividadeResponsavel = require("./atividadeResponsavel");
const Categoria = require("./Categoria");
const AtividadeCategoria = require("./AtividadeCategoria");

Usuario.hasMany(Atividade, {
  foreignKey: "criador_id",
  as: "atividadesCriadas",
});
Atividade.belongsTo(Usuario, {
  foreignKey: "criador_id",
  as: "criador",
});

Usuario.hasMany(Inscricao, {
  foreignKey: "usuario_id",
  as: "inscricoes",
  onDelete: "CASCADE",
});
Inscricao.belongsTo(Usuario, {
  foreignKey: "usuario_id",
  as: "usuario",
});

Atividade.hasMany(Inscricao, {
  foreignKey: "atividade_id",
  as: "inscricoes",
  onDelete: "CASCADE",
});
Inscricao.belongsTo(Atividade, {
  foreignKey: "atividade_id",
  as: "atividade",
});

Usuario.belongsToMany(Atividade, {
  through: AtividadeResponsavel,
  foreignKey: "usuario_id",
  as: "atividadesResponsaveis",
});

Atividade.belongsToMany(Usuario, {
  through: AtividadeResponsavel,
  foreignKey: "atividade_id",
  as: "responsaveis",
});

Atividade.hasMany(AtividadeResponsavel, {
  foreignKey: "atividade_id",
  onDelete: "CASCADE",
});
AtividadeResponsavel.belongsTo(Atividade, { foreignKey: "atividade_id" });
Usuario.hasMany(AtividadeResponsavel, {
  foreignKey: "usuario_id",
  onDelete: "CASCADE",
});
AtividadeResponsavel.belongsTo(Usuario, { foreignKey: "usuario_id" });

Atividade.belongsToMany(Categoria, {
  through: AtividadeCategoria,
  foreignKey: "atividade_id",
  as: "categorias",
});

Categoria.belongsToMany(Atividade, {
  through: AtividadeCategoria,
  foreignKey: "atividades",
});

Atividade.hasMany(AtividadeCategoria, {
  foreignKey: "atividade_id",
  onDelete: "CASCADE",
});
AtividadeCategoria.belongsTo(Atividade, { foreignKey: "atividade_id" });
Categoria.hasMany(AtividadeCategoria, {
  foreignKey: "categoria_id",
  onDelete: "CASCADE",
});
AtividadeCategoria.belongsTo(Categoria, { foreignKey: "categoria_id" });

module.exports = {
  sequelize,
  Usuario,
  Atividade,
  Inscricao,
  AtividadeResponsavel,
  Categoria,
  AtividadeCategoria,
};
