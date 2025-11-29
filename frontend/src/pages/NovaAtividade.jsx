import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';

const NovaAtividade = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [duracao, setDuracao] = useState('');
  const [vagas, setVagas] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [listaCategorias, setListaCategorias] = useState([]);

  useEffect(() => {
    api.get('/categorias').then(res => {
      setListaCategorias(res.data);
      if(res.data.length > 0) setCategoriaId(res.data[0].id);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/atividades', {
        nome, 
        descricao, 
        horario_inicio: `${data}T${hora}:00`, 
        duracao_horas: Number(duracao), 
        vagas_total: Number(vagas), 
        categoriasIds: [Number(categoriaId)]
      });
      alert("Atividade Criada!");
      navigate('/dashboard');
    } catch (error) { alert("Erro ao criar."); }
  };

 return (
    <>
      <Header />
      <main className="perfil-container"> 
        <section className="selecionar-atividade">
          <h2>Nova Atividade</h2>
          <form onSubmit={handleSubmit}>
            <label>Nome do Evento:</label>
            <input type="text" className="login" style={{width:'100%', marginBottom:'15px'}} value={nome} onChange={e=>setNome(e.target.value)} required />
            
            <label>Descrição:</label>
            <textarea 
              className="login" 
              style={{width:'100%', height: '100px', marginBottom:'15px', paddingTop: '10px', resize: 'vertical'}} 
              value={descricao} 
              onChange={e=>setDescricao(e.target.value)} 
              placeholder="Detalhes sobre o evento..."
            ></textarea>

            <div style={{display: 'flex', gap: '15px'}}>
               <div style={{flex: 1}}>
                 <label>Data:</label>
                 <input type="date" className="login" style={{width:'100%', marginBottom:'15px'}} value={data} onChange={e=>setData(e.target.value)} required />
               </div>
               <div style={{flex: 1}}>
                 <label>Hora:</label>
                 <input type="time" className="login" style={{width:'100%', marginBottom:'15px'}} value={hora} onChange={e=>setHora(e.target.value)} required />
               </div>
            </div>

            <div style={{display: 'flex', gap: '15px'}}>
               <div style={{flex: 1}}>
                 <label>Duração (h):</label>
                 <input type="number" className="login" style={{width:'100%', marginBottom:'15px'}} value={duracao} onChange={e=>setDuracao(e.target.value)} required />
               </div>
               <div style={{flex: 1}}>
                 <label>Vagas:</label>
                 <input type="number" className="login" style={{width:'100%', marginBottom:'15px'}} value={vagas} onChange={e=>setVagas(e.target.value)} required />
               </div>
            </div>

            <label>Categoria:</label>
            <select style={{width:'100%', padding:'10px', marginBottom: '20px', border: '1px solid #ccc', borderRadius: '5px'}} value={categoriaId} onChange={e=>setCategoriaId(e.target.value)}>
              {listaCategorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            
            <button type="submit" className="acessar">Salvar Atividade</button>
          </form>
        </section>
      </main>
    </>
  );
};
export default NovaAtividade;