import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { useNavigate, useParams } from 'react-router-dom';

const EditarAtividade = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [duracao, setDuracao] = useState('');
  const [vagas, setVagas] = useState('');

  useEffect(() => {
    api.get(`/atividades/${id}`).then(res => {
      const ativ = res.data;
      setNome(ativ.nome);
      setDuracao(ativ.duracao_horas);
      setVagas(ativ.vagas_total);
      const d = new Date(ativ.horario_inicio);
      setData(d.toISOString().split('T')[0]);
      setHora(d.toTimeString().slice(0, 5));
    }).catch(() => navigate('/dashboard'));
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/atividades/${id}`, {
        nome, horario_inicio: `${data}T${hora}:00`, duracao_horas: Number(duracao), vagas_total: Number(vagas)
      });
      alert("Atualizada!");
      navigate('/dashboard');
    } catch (error) { alert("Erro ao editar."); }
  };

  return (
    <>
      <Header />
      <main className="perfil-container">
        <section className="selecionar-atividade" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2>Editar Atividade</h2>
          <form onSubmit={handleSubmit}>
            <input type="text" className="login" style={{width:'100%', marginBottom:'10px'}} value={nome} onChange={e=>setNome(e.target.value)} required />
            <input type="date" className="login" style={{width:'48%', marginRight:'4%'}} value={data} onChange={e=>setData(e.target.value)} required />
            <input type="time" className="login" style={{width:'48%'}} value={hora} onChange={e=>setHora(e.target.value)} required />
            <input type="number" className="login" style={{width:'48%', marginRight:'4%', marginTop:'10px'}} value={duracao} onChange={e=>setDuracao(e.target.value)} required />
            <input type="number" className="login" style={{width:'48%', marginTop:'10px'}} value={vagas} onChange={e=>setVagas(e.target.value)} required />
            <button type="submit" className="acessar" style={{marginTop:'20px'}}>Salvar Alterações</button>
          </form>
        </section>
      </main>
    </>
  );
};
export default EditarAtividade;