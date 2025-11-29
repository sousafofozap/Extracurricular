import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const resultado = await login(email, senha);
    if (resultado.success) {
      navigate('/dashboard'); 
    } else {
      setErro(resultado.message);
    }
  };

  return (
    <main className="contentLogin">
      <img src="/img/logoUB.png" className="imgLogo" alt="Logo UB" />
      <span>UB - ExtraCurricular</span>

      {erro && <p style={{ color: 'red', textAlign: 'center' }}>{erro}</p>}

      <div className="loginContainer">
        <form id="form-login" onSubmit={handleLogin}>
          <div className="inputBox">
            <img src="/img/do-utilizador.png" className="iconeLogin" alt="user" />
            <input type="email" placeholder="E-mail" className="login" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="inputBox">
            <img src="/img/cadeado.png" className="iconeLogin" alt="pass" />
            <input type="password" placeholder="Senha" className="login" required value={senha} onChange={(e) => setSenha(e.target.value)} />
          </div>
          <input type="submit" className="acessar" value="Acessar" />
        </form>
      </div>
    </main>
  );
};
export default Login;