const { Usuario } = require("../models/index");
const jwt = require("jsonwebtoken");

function gerarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, role: usuario.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
}

exports.register = async (req, res) => {
  try {
    const { nome, email, senha, role } = req.body;

    const usuarioExiste = await Usuario.findOne({ where: { email } });
    if (usuarioExiste) {
      return res.status(400).json({ message: "Email já cadastrado." });
    }

    const novoUsuario = await Usuario.create({
      nome,
      email,
      senha,
      role: role || "ALUNO",
    });

    const token = gerarToken(novoUsuario);
    res.status(201).json({ token });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao registrar usuário", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ message: "Email ou senha inválidos" });
    }

    const senhaValida = await usuario.validarSenha(senha);
    if (!senhaValida) {
      return res.status(401).json({ message: "Email ou senha inválidos" });
    }

    const token = gerarToken(usuario);
    
    res.status(200).json({
      message: "Login realizado com sucesso",
      token,
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
    });

  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao fazer login", error: error.message });
  }
};
