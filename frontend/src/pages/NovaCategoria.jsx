import React, { useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';

const NovaCategoria = () => {
  const [nome, setNome] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/categorias', { nome });
      alert('Categoria criada!');
      navigate('/nova-atividade');
    } catch (error) { alert('Erro ao criar.'); }
  };

  return (
    <>
      <Header />
      <main className="perfil-container">
        <section className="selecionar-atividade" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h2>Nova Categoria</h2>
          <form onSubmit={handleSubmit}>
            <input type="text" required className="login" style={{width: '100%', marginBottom: '20px'}} value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Workshop" />
            <button type="submit" className="acessar">Salvar</button>
          </form>
        </section>
      </main>
    </>
  );
};
export default NovaCategoria;