import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';
import Loader from '../components/Loader';

const Chamada = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [atividade, setAtividade] = useState(null);
  const [loading, setLoading] = useState(true);

  const carregarDados = async () => {
    try {
      const response = await api.get(`/atividades/${id}`);
      setAtividade(response.data);
    } catch (error) {
      alert("Erro ao carregar lista.");
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarDados(); }, [id]);

  const atualizarStatus = async (inscricaoId, novoStatus) => {
    try {
      await api.put(`/inscricoes/${inscricaoId}`, { status_presenca: novoStatus });
      carregarDados(); 
    } catch (error) {
      alert("Erro ao atualizar presença.");
    }
  };

  if (loading) return <div style={{marginTop: '100px'}}><Loader /></div>;
  if (!atividade) return null;

  return (
    <>
      <Header />
      {/* Container Centralizado */}
      <main className="perfil-container">
        
        {/* Cartão Branco */}
        <section className="selecionar-atividade" style={{ maxWidth: '900px' }}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h2 style={{margin: 0}}>Chamada: {atividade.nome}</h2>
            <button onClick={() => navigate('/dashboard')} className="btn-ver-mais" style={{backgroundColor: '#666'}}>Voltar</button>
          </div>

          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr>
                <th>Aluno</th>
                <th style={{textAlign: 'center'}}>Status Atual</th>
                <th style={{textAlign: 'center'}}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {atividade.inscricoes && atividade.inscricoes.map((inscricao) => (
                <tr key={inscricao.id}>
                  <td>
                    <strong>{inscricao.usuario?.nome}</strong><br/>
                    <span style={{fontSize: '12px', color: '#666'}}>{inscricao.usuario?.email}</span>
                  </td>
                  <td style={{textAlign: 'center'}}>
                    {inscricao.status_presenca === 'PRESENTE' && <span style={{color:'green', fontWeight:'bold'}}>Presente ✅</span>}
                    {inscricao.status_presenca === 'AUSENTE' && <span style={{color:'red', fontWeight:'bold'}}>Falta ❌</span>}
                    {inscricao.status_presenca === 'INSCRITO' && <span style={{color:'blue'}}>Aguardando</span>}
                  </td>
                  <td style={{display:'flex', gap:'5px', justifyContent:'center'}}>
                    <button 
                      onClick={() => atualizarStatus(inscricao.id, 'PRESENTE')} 
                      disabled={inscricao.status_presenca === 'PRESENTE'} 
                      style={{background: 'green', color:'white', border:'none', padding:'8px', borderRadius:'4px', cursor:'pointer', opacity: inscricao.status_presenca === 'PRESENTE' ? 0.5 : 1}}
                    >
                      Presente
                    </button>
                    <button 
                      onClick={() => atualizarStatus(inscricao.id, 'AUSENTE')} 
                      disabled={inscricao.status_presenca === 'AUSENTE'} 
                      style={{background: '#c0392b', color:'white', border:'none', padding:'8px', borderRadius:'4px', cursor:'pointer', opacity: inscricao.status_presenca === 'AUSENTE' ? 0.5 : 1}}
                    >
                      Falta
                    </button>
                  </td>
                </tr>
              ))}
              {atividade.inscricoes?.length === 0 && (
                <tr><td colSpan="3" style={{textAlign:'center', padding:'20px'}}>Nenhum aluno inscrito.</td></tr>
              )}
            </tbody>
          </table>
        </section>
      </main>
    </>
  );
};

export default Chamada;