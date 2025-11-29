const { Usuario, Inscricao, Atividade } = require("../models/index");

exports.getMe = async (req, res) => {
  const usuario = req.usuario;

  if (!usuario) {
    return res.status(404).json({ message: "Utilizador não encontrado" });
  }

  res.json(usuario);
};

exports.getMinhasInscricoes = async (req, res) => {
  try {
    const alunoId = req.usuario.id;

    const inscricoes = await Inscricao.findAll({
      where: { usuario_id: alunoId },
      include: {
        model: Atividade,
        as: "atividade",
        attributes: ["id", "nome", "horario_inicio", "duracao_horas"],
      },
      order: [["atividade", "horario_inicio", "DESC"]],
    });

    res.json(inscricoes);
  } catch (error) {
    res.status(500).json({
      message: "Erro ao buscar minhas inscrições",
      error: error.message,
    });
  }
};

exports.atualizarPerfil = async (req, res) => {
  try {
    const { nome } = req.body;
    const alunoId = req.usuario.id;

    if (!nome) {
      return res.status(400).json({ message: "O nome é obrigatório" });
    }

    const usuario = await Usuario.findByPk(alunoId);
    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    await usuario.update({ nome });

    res.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
      horas_acumuladas: usuario.horas_acumuladas,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao atualizar perfil", error: error.message });
  }
};

exports.alterarSenha = async (req, res) => {
  try {
    const { senhaAtual, novaSenha } = req.body;
    const alunoId = req.usuario.id;

    if (!senhaAtual || !novaSenha) {
      return res
        .status(400)
        .json({ message: "Senha atual e nova senha são obrigatórias" });
    }

    const usuario = await Usuario.findByPk(alunoId);
    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const senhaValida = await usuario.validarSenha(senhaAtual);
    if (!senhaValida) {
      return res.status(401).json({ message: "Senha atual inválida" });
    }

    usuario.senha = novaSenha;
    await usuario.save();

    res.json({ message: "Senha alterada com sucesso!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao alterar senha", error: error.message });
  }
};
