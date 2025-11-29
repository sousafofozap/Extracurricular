const jwt = require("jsonwebtoken");
const { Usuario } = require("../models/index");

const proteger = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET || "seusegredo");

      req.usuario = await Usuario.findByPk(decoded.id, {
        attributes: ["id", "nome", "email", "role"], 
      });

      if (!req.usuario) {
        return res.status(401).json({ message: "Utilizador não encontrado no banco." });
      }

      next();
    } catch (error) {
      console.error("Erro no middleware de auth:", error);
      return res.status(401).json({ message: "Token inválido ou expirado" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Não autorizado, sem token" });
  }
};

const ehProfessor = (req, res, next) => {
  if (req.usuario && req.usuario.role === "PROFESSOR") {
    next();
  } else {
    res.status(403).json({ message: "Acesso negado. Rota apenas para Professores." });
  }
};

const ehAluno = (req, res, next) => {
  if (req.usuario && req.usuario.role === "ALUNO") {
    next();
  } else {
    res.status(403).json({ message: "Acesso negado. Rota apenas para Alunos." });
  }
};

const ehAdmin = (req, res, next) => {
  if (req.usuario && req.usuario.role && req.usuario.role.toUpperCase() === "ADMIN") {
    next();
  } else {
    res.status(403).json({ message: "Acesso negado. Rota apenas para Administradores." });
  }
};

const ehProfessorOuAdmin = (req, res, next) => {
    const role = req.usuario?.role?.toUpperCase();
    if (role === "PROFESSOR" || role === "ADMIN") {
      next();
    } else {
      res.status(403).json({ message: "Acesso restrito a docentes ou admins." });
    }
  };

module.exports = { proteger, ehProfessor, ehAluno, ehAdmin, ehProfessorOuAdmin };
