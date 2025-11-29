const express = require("express");
const router = express.Router();
const inscricaoController = require("../controllers/inscricaoController");
const atividadeController = require("../controllers/atividadeController");
const { proteger, ehProfessor, ehAluno } = require("../middleware/authMiddleware");

router.post(
  "/:id/presenca",
  [proteger, ehProfessor],
  inscricaoController.marcarPresenca
);

router.delete(
  '/:id', 
  [proteger, ehAluno], 
  inscricaoController.cancelarInscricao
);

router.put(
  "/:id",
  [proteger, ehProfessor],
  atividadeController.atualizarStatusInscricao
);

module.exports = router;
