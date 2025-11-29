const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { sequelize } = require("./models/index");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");
const atividadeRoutes = require("./routes/atividadeRoutes");
const inscricaoRoutes = require("./routes/inscricaoRoutes");
const adminRoutes = require("./routes/adminRoutes");
const categoriaRoutes = require("./routes/categoriaRoutes");

app.use("/auth", authRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/atividades", atividadeRoutes);
app.use("/inscricoes", inscricaoRoutes);
app.use("/admin", adminRoutes);
app.use("/categorias", categoriaRoutes);

app.get("/", (req, res) => {
  res.send("API da Unibalsas para Horas Extracurriculares funcionando!");
});

app.listen(port, async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("Banco de dados conectado e sincronizado com sucesso.");
    console.log(`Servidor rodando na porta ${port}`);
  } catch (error) {
    console.error(
      "Não foi possível conectar ou sincronizar o banco de dados:",
      error
    );
  }
});
