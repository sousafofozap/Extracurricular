const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuarioController");
const { proteger } = require("../middleware/authMiddleware");

router.get("/me", proteger, usuarioController.getMe);

router.get("/me/inscricoes", proteger, usuarioController.getMinhasInscricoes);

router.put("/me", proteger, usuarioController.atualizarPerfil);

router.put("/me/alterar-senha", proteger, usuarioController.alterarSenha);

module.exports = router;
