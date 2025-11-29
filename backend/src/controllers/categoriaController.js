const { Categoria } = require("../models/index");

exports.criar = async (req, res) => {
  try {
    const { nome, descricao } = req.body;
    if (!nome) {
      return res.status(400).json({ message: "O nome é obrigatório" });
    }
    const novaCategoria = await Categoria.create({ nome, descricao });
    res.status(201).json(novaCategoria);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao criar categoria", error: error.message });
  }
};

exports.listar = async (req, res) => {
  try {
    const categorias = await Categoria.findAll();
    res.json(categorias);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao listar categorias", error: error.message });
  }
};

exports.deletar = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      return res.status(404).json({ message: "Categoria não encontrada" });
    }
    await categoria.destroy();
    res.status(204).send();
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao apagar categoria", error: error.message });
  }
};
