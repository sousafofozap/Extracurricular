const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { proteger, ehAdmin } = require('../middleware/authMiddleware');

router.get("/usuarios", [proteger, ehAdmin], adminController.listarUsuarios);

router.delete(
  "/usuarios/:id",
  [proteger, ehAdmin],
  adminController.deletarUsuario
);

router.delete(
  "/atividades/:id",
  [proteger, ehAdmin],
  adminController.deletarQualquerAtividade
);

router.get('/stats', [proteger, ehAdmin], adminController.getStats);

router.get('/top/atividades', [proteger, ehAdmin], adminController.getTopAtividades);

router.get('/top/alunos', [proteger, ehAdmin], adminController.getTopAlunos);

module.exports = router;
