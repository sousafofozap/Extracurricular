const { Usuario, Atividade, Inscricao } = require('../models/index');
const { sequelize } = require('../models/index');

exports.listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ["senha"] },
    });
    res.json(usuarios);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao listar utilizadores", error: error.message });
  }
};

exports.deletarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id, 10) === req.usuario.id) {
      return res.status(400).json({
        message: "Não pode apagar a sua própria conta de administrador.",
      });
    }

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }

    await usuario.destroy();
    res.status(204).send();
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao apagar utilizador", error: error.message });
  }
};

exports.deletarQualquerAtividade = async (req, res) => {
  try {
    const { id } = req.params;

    const atividade = await Atividade.findByPk(id);
    if (!atividade) {
      return res.status(404).json({ message: "Atividade não encontrada" });
    }

    await atividade.destroy();
    res.status(204).send();
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao apagar atividade", error: error.message });
  }
};
exports.getStats = async (req, res) => {
  try {
    const totalUsuarios = await Usuario.count();

    const totalAtividades = await Atividade.count();

    const totalInscricoes = await Inscricao.count();

    const totalHorasCreditadas = await Usuario.sum('horas_acumuladas', {
      where: {
        role: 'ALUNO' 
      }
    });

    res.json({
      totalUsuarios,
      totalAtividades,
      totalInscricoes,
      totalHorasCreditadas: totalHorasCreditadas || 0 
    });

  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar estatísticas', error: error.message });
  }
};

exports.getTopAtividades = async (req, res) => {
  try {
    const topAtividades = await Atividade.findAll({
      attributes: {
        include: [
          [sequelize.fn('COUNT', sequelize.col('inscricoes.id')), 'total_inscricoes']
        ]
      },
      include: {
        model: Inscricao,
        as: 'inscricoes',
        attributes: [] 
      },
      group: ['Atividade.id'],
      order: [[sequelize.literal('total_inscricoes'), 'DESC']], 
      limit: 5,
      subQuery: false
    });

    res.json(topAtividades);

  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar top atividades', error: error.message });
  }
};
exports.getTopAlunos = async (req, res) => {
  try {
    const topAlunos = await Usuario.findAll({
      where: { role: 'ALUNO' }, 
      order: [['horas_acumuladas', 'DESC']], 
      limit: 5,
      attributes: ['id', 'nome', 'email', 'horas_acumuladas']
    });

    res.json(topAlunos);

  } catch (error) { 
    res.status(500).json({ message: 'Erro ao buscar top alunos', error: error.message });
  }
};