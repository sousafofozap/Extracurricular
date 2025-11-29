const {
  Atividade,
  Usuario,
  Inscricao,
  AtividadeResponsavel,
  Categoria,
} = require("../models/index");

const sequelize = require("../db");
const qrcode = require("qrcode");
const crypto = require("crypto");

const { Op } = require("sequelize");

exports.criar = async (req, res) => {
  const {
    nome,
    descricao,
    horario_inicio,
    duracao_horas,
    vagas_total,
    pago,
    categoriasIds,
  } = req.body;
  const criadorId = req.usuario.id;

  const t = await sequelize.transaction();

  try {
    const novaAtividade = await Atividade.create(
      {
        nome,
        descricao,
        horario_inicio,
        duracao_horas,
        vagas_total,
        pago,
        criador_id: criadorId,
      },
      { transaction: t }
    );

    if (categoriasIds && categoriasIds.length > 0) {
      const categorias = await Categoria.findAll({
        where: { id: categoriasIds },
      });

      if (categorias.length !== categoriasIds.length) {
        await t.rollback();
        return res
          .status(400)
          .json({ message: "Um ou mais IDs de categoria são inválidos." });
      }

      await novaAtividade.addCategorias(categorias, { transaction: t });
    }

    await t.commit();

    const atividadeCompleta = await Atividade.findByPk(novaAtividade.id, {
      include: {
        model: Categoria,
        as: "categorias",
        through: { attributes: [] },
      },
    });

    res.status(201).json(atividadeCompleta);
  } catch (error) {
    await t.rollback();
    res
      .status(500)
      .json({ message: "Erro ao criar atividade", error: error.message });
  }
};

exports.listar = async (req, res) => {
  try {
    const { categoriaId } = req.query;

    const queryOptions = {
      include: [
        {
          model: Usuario,
          as: "criador",
          attributes: ["id", "nome"],
        },
      ],
      order: [['horario_inicio', 'ASC']] 
    };

    if (categoriaId) {
      queryOptions.include.push({
        model: Categoria,
        as: "categorias",
        where: { id: categoriaId },
        through: { attributes: [] },
      });
    } else {
      queryOptions.include.push({
        model: Categoria,
        as: "categorias",
        through: { attributes: [] },
      });
    }

    const atividades = await Atividade.findAll(queryOptions);
    res.json(atividades);

  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao listar atividades", error: error.message });
  }
};

exports.buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const atividade = await Atividade.findByPk(id, {
      include: [
        { 
          model: Usuario, 
          as: "criador", 
          attributes: ["id", "nome"] 
        },
        { 
          model: Categoria, 
          as: "categorias", 
          through: { attributes: [] } 
        },
        { 
          model: Inscricao, 
          as: "inscricoes",
          include: [ 
            { model: Usuario, as: "usuario", attributes: ["id", "nome", "email"] } 
          ]
        }
      ]
    });

    if (!atividade) {
      return res.status(404).json({ message: "Atividade não encontrada" });
    }
    
    res.json(atividade);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao buscar atividade", error: error.message });
  }
};

exports.inscrever = async (req, res) => {
  try {
    const atividadeId = req.params.id;
    const alunoId = req.usuario.id;

    const atividade = await Atividade.findByPk(atividadeId);
    if (!atividade) {
      return res.status(404).json({ message: "Atividade não encontrada" });
    }

    const jaInscrito = await Inscricao.findOne({
      where: {
        usuario_id: alunoId,
        atividade_id: atividadeId,
      },
    });

    if (jaInscrito) {
      return res
        .status(400)
        .json({ message: "Já está inscrito nesta atividade" });
    }

    const totalInscritos = await Inscricao.count({
      where: { atividade_id: atividadeId },
    });

    if (totalInscritos >= atividade.vagas_total) {
      return res
        .status(400)
        .json({ message: "Não há mais vagas para esta atividade" });
    }

    const novaInscricao = await Inscricao.create({
      usuario_id: alunoId,
      atividade_id: atividadeId,
      status_presenca: "INSCRITO",
    });

    res.status(201).json({
      message: "Inscrição realizada com sucesso!",
      inscricao: novaInscricao,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao realizar inscrição", error: error.message });
  }
};

exports.listarInscritos = async (req, res) => {
  try {
    const atividadeId = req.params.id;

    const atividade = await Atividade.findByPk(atividadeId);
    if (!atividade) {
      return res.status(404).json({ message: "Atividade não encontrada" });
    }

    const inscricoes = await Inscricao.findAll({
      where: { atividade_id: atividadeId },
      include: {
        model: Usuario,
        as: "usuario",
        attributes: ["id", "nome", "email"],
      },
    });

    res.json(inscricoes);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao listar inscritos", error: error.message });
  }
};


exports.deletar = async (req, res) => {
  try {
    const atividadeId = req.params.id;
    const usuarioLogado = req.usuario; 

    console.log("=== TENTATIVA DE EXCLUSÃO ===");
    console.log(`Solicitante: ${usuarioLogado.nome} (ID: ${usuarioLogado.id})`);
    console.log(`Role detectada: '${usuarioLogado.role}'`);

    const atividade = await Atividade.findByPk(atividadeId);
    if (!atividade) {
      return res.status(404).json({ message: "Atividade não encontrada" });
    }

    const ehCriador = atividade.criador_id === usuarioLogado.id;
    
    const ehAdmin = usuarioLogado.role && usuarioLogado.role.toUpperCase() === 'ADMIN';

    console.log(`É Criador? ${ehCriador} | É Admin? ${ehAdmin}`);

    if (ehCriador || ehAdmin) {
      await atividade.destroy();
      console.log("Atividade excluída com sucesso.");
      return res.status(204).send();
    }

    console.log("Acesso negado.");
    return res.status(403).json({
      message: "Acesso negado. Apenas o criador ou Admin podem excluir.",
    });

  } catch (error) {
    console.error("Erro CRÍTICO ao deletar:", error);
    res.status(500).json({ message: "Erro ao apagar atividade", error: error.message });
  }
};

exports.adicionarResponsavel = async (req, res) => {
  try {
    const atividadeId = req.params.id;
    const professorLogadoId = req.usuario.id;
    const { emailProfessorAdicionado } = req.body;

    if (!emailProfessorAdicionado) {
      return res
        .status(400)
        .json({ message: "Email do professor é obrigatório" });
    }

    const atividade = await Atividade.findByPk(atividadeId);
    if (!atividade) {
      return res.status(404).json({ message: "Atividade não encontrada" });
    }

    if (atividade.criador_id !== professorLogadoId) {
      return res
        .status(403)
        .json({ message: "Apenas o criador pode adicionar responsáveis" });
    }

    const professorAdicionar = await Usuario.findOne({
      where: {
        email: emailProfessorAdicionado,
        role: "PROFESSOR",
      },
    });

    if (!professorAdicionar) {
      return res.status(404).json({
        message:
          'Professor a ser adicionado não encontrado ou não tem a role "PROFESSOR"',
      });
    }

    const jaEhResponsavel = await AtividadeResponsavel.findOne({
      where: {
        atividade_id: atividadeId,
        usuario_id: professorAdicionar.id,
      },
    });

    if (jaEhResponsavel) {
      return res
        .status(400)
        .json({ message: "Este professor já é responsável pela atividade" });
    }

    await AtividadeResponsavel.create({
      atividade_id: atividadeId,
      usuario_id: professorAdicionar.id,
    });

    res.status(201).json({ message: "Responsável adicionado com sucesso!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao adicionar responsável", error: error.message });
  }
};

exports.atualizar = async (req, res) => {
  try {
    const atividadeId = req.params.id;
    const professorId = req.usuario.id;
    const novosDados = req.body;

    const atividade = await Atividade.findByPk(atividadeId);
    if (!atividade) {
      return res.status(404).json({ message: "Atividade não encontrada" });
    }

    const ehCriador = atividade.criador_id === professorId;

    const ehResponsavel = await AtividadeResponsavel.findOne({
      where: {
        atividade_id: atividadeId,
        usuario_id: professorId,
      },
    });

    if (!ehCriador && !ehResponsavel) {
      return res.status(403).json({
        message:
          "Acesso negado. Não é o criador nem um responsável por esta atividade.",
      });
    }

    await atividade.update(novosDados);

    res.json(atividade);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao atualizar atividade", error: error.message });
  }
};

exports.iniciarCheckin = async (req, res) => {
  try {
    const atividadeId = req.params.id;

    const atividade = await Atividade.findByPk(atividadeId);
    if (!atividade) {
      return res.status(404).json({ message: "Atividade não encontrada" });
    }

    const token = crypto.randomBytes(4).toString("hex");
    const expires = new Date(Date.now() + 5 * 60 * 1000);

    await atividade.update({
      checkin_token: token,
      checkin_token_expires: expires,
    });

    const qrCodeDataUrl = await qrcode.toDataURL(token);

    res.json({ qrCodeDataUrl, token });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao iniciar check-in", error: error.message });
  }
};

exports.fazerCheckin = async (req, res) => {
  try {
    const atividadeId = req.params.id;
    const alunoId = req.usuario.id;
    const { token } = req.body; 

    if (!token) {
      return res
        .status(400)
        .json({ message: "Token de check-in é obrigatório" });
    }

    const atividade = await Atividade.findByPk(atividadeId);
    if (!atividade) {
      return res.status(404).json({ message: "Atividade não encontrada" });
    }

    if (!atividade.checkin_token || atividade.checkin_token !== token) {
      return res.status(400).json({ message: "Código de check-in inválido" });
    }

    if (new Date() > atividade.checkin_token_expires) {
      return res.status(400).json({ message: "Código de check-in expirado" });
    }

    const inscricao = await Inscricao.findOne({
      where: {
        usuario_id: alunoId,
        atividade_id: atividadeId,
      },
    });

    if (!inscricao) {
      return res
        .status(404)
        .json({ message: "Não estás inscrito nesta atividade" });
    }

    if (inscricao.status_presenca === "PRESENTE") {
      return res
        .status(200)
        .json({ message: "Presença já marcada anteriormente" });
    }

    const t = await sequelize.transaction();
    try {
      const aluno = await Usuario.findByPk(alunoId, { transaction: t });

      await inscricao.update(
        { status_presenca: "PRESENTE" },
        { transaction: t }
      );
      await aluno.increment("horas_acumuladas", {
        by: atividade.duracao_horas,
        transaction: t,
      });

      await t.commit();
      res.json({
        message: "Check-in realizado e horas creditadas com sucesso!",
      });
    } catch (error) {
      await t.rollback();
      throw error;
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao fazer check-in", error: error.message });
  }
};

exports.obterAtividade = async (req, res) => {
  try {
    const { id } = req.params;
    
    const atividade = await Atividade.findByPk(id, {
      include: [
        { model: Categoria, as: 'categorias', through: { attributes: [] } },
        { 
          model: Inscricao, 
          as: 'inscricoes',
          include: [ { model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'email'] } ]
        }
      ]
    });

    if (!atividade) {
      return res.status(404).json({ message: 'Atividade não encontrada' });
    }

    res.json(atividade);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar atividade', error: error.message });
  }
};


exports.atualizarStatusInscricao = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params; 
    const { status_presenca } = req.body; 

    const inscricao = await Inscricao.findByPk(id, {
      include: [{ model: Atividade, as: 'atividade' }]
    });

    if (!inscricao) {
      await t.rollback();
      return res.status(404).json({ message: "Inscrição não encontrada" });
    }

    const statusAntigo = inscricao.status_presenca;
    const alunoId = inscricao.usuario_id;
    const horas = inscricao.atividade.duracao_horas;

    if (status_presenca === 'PRESENTE' && statusAntigo !== 'PRESENTE') {
      await Usuario.increment('horas_acumuladas', { by: horas, where: { id: alunoId }, transaction: t });
    } else if (statusAntigo === 'PRESENTE' && status_presenca !== 'PRESENTE') {
      await Usuario.decrement('horas_acumuladas', { by: horas, where: { id: alunoId }, transaction: t });
    }

    await inscricao.update({ status_presenca }, { transaction: t });

    await t.commit();
    res.json({ message: "Status atualizado", status: status_presenca });

  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: "Erro ao atualizar", error: error.message });
  }
};
