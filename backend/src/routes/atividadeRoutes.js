const express = require('express');
const router = express.Router();
const atividadeController = require('../controllers/atividadeController');
const { proteger, ehProfessor, ehAdmin, ehProfessorOuAdmin } = require('../middleware/authMiddleware');

router.get('/', proteger, atividadeController.listar);
router.get('/:id', proteger, atividadeController.buscarPorId);

router.post('/:id/inscrever', proteger, atividadeController.inscrever);
router.get('/:id/inscritos', [proteger, ehProfessorOuAdmin], atividadeController.listarInscritos);

router.post('/', [proteger, ehProfessorOuAdmin], atividadeController.criar);

router.delete('/:id', proteger, atividadeController.deletar);

router.put('/:id', proteger, atividadeController.atualizar);

router.post('/:id/responsavel', [proteger, ehProfessor], atividadeController.adicionarResponsavel);
router.post('/:id/checkin/iniciar', [proteger, ehProfessor], atividadeController.iniciarCheckin);
router.post('/:id/checkin', proteger, atividadeController.fazerCheckin);

module.exports = router;
