const express = require("express");
const router = express.Router();
const categoriaController = require("../controllers/categoriaController");
const { proteger, ehAdmin } = require("../middleware/authMiddleware");

router.post("/", [proteger, ehAdmin], categoriaController.criar);

router.get("/", proteger, categoriaController.listar);

router.delete("/:id", [proteger, ehAdmin], categoriaController.deletar);

module.exports = router;
