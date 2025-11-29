const { Inscricao, Atividade, Usuario } = require("../models/index");
const sequelize = require("../db");

exports.marcarPresenca = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const inscricaoId = req.params.id;

    const inscricao = await Inscricao.findByPk(inscricaoId, { transaction: t });
    if (!inscricao) {
      await t.rollback();
      return res.status(404).json({ message: "Inscrição não encontrada" });
    }

    if (inscricao.status_presenca === "PRESENTE") {
      await t.rollback();
      return res.status(400).json({ message: "Presença já marcada" });
    }

    const atividade = await Atividade.findByPk(inscricao.atividade_id, {
      transaction: t,
    });

    const aluno = await Usuario.findByPk(inscricao.usuario_id, {
      transaction: t,
    });

    await inscricao.update({ status_presenca: "PRESENTE" }, { transaction: t });

    await aluno.increment("horas_acumuladas", {
      by: atividade.duracao_horas,
      transaction: t,
    });

    await t.commit();

    res.json({ message: "Presença marcada e horas creditadas com sucesso!" });
  } catch (error) {
    await t.rollback();
    res
      .status(500)
      .json({ message: "Erro ao marcar presença", error: error.message });
  }
};

exports.cancelarInscricao = async (req, res) => {
  try {
    const inscricaoId = req.params.id;
    const alunoId = req.usuario.id;

    const inscricao = await Inscricao.findByPk(inscricaoId);
    if (!inscricao) {
      return res.status(404).json({ message: "Inscrição não encontrada" });
    }

    if (inscricao.usuario_id !== alunoId) {
      return res
        .status(403)
        .json({ message: "Acesso negado. Esta inscrição não lhe pertence." });
    }

    if (inscricao.status_presenca === "PRESENTE") {
      return res
        .status(400)
        .json({
          message:
            "Não pode cancelar uma inscrição com presença já confirmada.",
        });
    }

    await inscricao.destroy();

    res.status(204).send();
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao cancelar inscrição", error: error.message });
  }
};
