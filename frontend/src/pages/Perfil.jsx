import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';

const Perfil = () => {
  const { logout, user } = useContext(AuthContext);
  const [dadosUsuario, setDadosUsuario] = useState(null);
  const [inscricoes, setInscricoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const resUsuario = await api.get('/usuarios/me');
        setDadosUsuario(resUsuario.data);

        const resInscricoes = await api.get('/usuarios/me/inscricoes');
        setInscricoes(resInscricoes.data);
      } catch (error) {
        console.error("Erro ao carregar perfil", error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  const handleCancelar = async (inscricaoId) => {
    if (!window.confirm("Tem certeza que deseja cancelar esta inscrição?")) return;
    try {
      await api.delete(`/inscricoes/${inscricaoId}`);
      setInscricoes(inscricoes.filter(insc => insc.id !== inscricaoId));
      alert("Inscrição cancelada.");
    } catch (error) {
      alert("Erro ao cancelar.");
    }
  };

  const renderizarStatus = (inscricao) => {
    const dataEvento = new Date(inscricao.atividade.horario_inicio);
    const agora = new Date();
    const status = inscricao.status_presenca;

    if (status === 'PRESENTE') {
      return <span style={{color:'green', fontWeight:'bold', display:'flex', alignItems:'center', gap:'5px'}}>Concluído (+{inscricao.atividade.duracao_horas}h) ✅</span>;
    }
    if (status === 'AUSENTE') {
      return <span style={{color:'red', fontWeight:'bold', display:'flex', alignItems:'center', gap:'5px'}}>Não Compareceu ❌</span>;
    }
    if (status === 'INSCRITO') {
      if (dataEvento > agora) {
        return <span style={{color:'#3498db', fontWeight:'bold', display:'flex', alignItems:'center', gap:'5px'}}>Inscrito 📅</span>;
      } else {
        return <span style={{color:'#e67e22', fontWeight:'bold', display:'flex', alignItems:'center', gap:'5px'}}>Aguardando Lançamento ⏳</span>;
      }
    }
    return null;
  };

  const formatarData = (dataString) => {
    return new Date(dataString).toLocaleDateString('pt-BR') + ' às ' + new Date(dataString).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
  };

  if (loading) {
  return (
    <>
      <Header />
        <main className="perfil-container" style={{ display: 'flex', justifyContent: 'center' }}>
          <Loader />
        </main>
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="perfil-container">
        
        {/* --- 1. CARTÃO DE DADOS DO ALUNO --- */}
        <section className="perfil-card">
          <div className="perfil-header">
            <div className="perfil-foto">
              {dadosUsuario?.nome ? dadosUsuario.nome.charAt(0).toUpperCase() : 'U'}
            </div>
            
            <div className="perfil-info">
              <h3>{dadosUsuario?.nome}</h3>
              <p className="perfil-curso">{dadosUsuario?.email}</p>
              <p className="perfil-curso" style={{fontWeight:'bold', color: '#900008', marginTop: '5px'}}>
                {dadosUsuario?.role}
              </p>

              <div className="info-adicional" style={{marginTop: '15px', padding: '10px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef'}}>
                <p style={{margin: 0, fontSize: '16px'}}>
                  <strong>Horas Acumuladas:</strong> <span style={{color: '#27ae60', fontSize: '18px'}}>{dadosUsuario?.horas_acumuladas || 0}h</span>
                </p>
              </div>
            </div>
          </div>

          <div className="perfil-acoes">
            <button 
              onClick={logout} 
              className="btn-ver-mais" 
              style={{
                backgroundColor: '#fff', 
                color: '#666', 
                border: '1px solid #ccc',
                width: '200px',
                display: 'flex',
                justifyContent: 'center',
                gap: '10px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#fff0f0';
                e.currentTarget.style.color = '#900008';
                e.currentTarget.style.borderColor = '#900008';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#fff';
                e.currentTarget.style.color = '#666';
                e.currentTarget.style.borderColor = '#ccc';
              }}
            >
              Sair da Conta ↪
            </button>
          </div>
        </section>

        {/* --- 2. LISTA DE INSCRIÇÕES --- */}
        <section className="atividades-lista" style={{marginTop: '30px'}}>
          <h2 style={{marginBottom: '20px', color: '#333', borderLeft: '5px solid #900008', paddingLeft: '10px'}}>Minhas Inscrições</h2>
          
          {inscricoes.length === 0 ? (
            <div style={{textAlign: 'center', padding: '40px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'}}>
              <p style={{color: '#777', fontSize: '16px'}}>Você ainda não se inscreveu em nenhuma atividade.</p>
              <button 
                onClick={() => window.location.href='/dashboard'} 
                className="btn-ver-mais" 
                style={{marginTop: '15px'}}
              >
                Ver Atividades Disponíveis
              </button>
            </div>
          ) : (
            inscricoes.map(inscricao => (
              <article key={inscricao.id} className="perfil-card" style={{flexDirection: 'column', gap: '10px', marginBottom: '15px', borderLeft: inscricao.status_presenca === 'PRESENTE' ? '5px solid #27ae60' : '5px solid #900008'}}>
                <h3 style={{margin: 0, color: '#333'}}>{inscricao.atividade.nome}</h3>
                <p style={{margin: 0}}><strong>Data:</strong> {formatarData(inscricao.atividade.horario_inicio)}</p>
                <p style={{margin: 0, marginTop: '5px'}}><strong>Status:</strong> {renderizarStatus(inscricao)}</p>

                {inscricao.status_presenca === 'INSCRITO' && new Date(inscricao.atividade.horario_inicio) > new Date() && (
                  <div style={{marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px'}}>
                    <button 
                      onClick={() => handleCancelar(inscricao.id)}
                      className="btn-ver-mais"
                      style={{background: '#fff', color: '#c0392b', border: '1px solid #c0392b'}}
                      onMouseOver={(e) => {e.target.style.background = '#c0392b'; e.target.style.color = 'white'}}
                      onMouseOut={(e) => {e.target.style.background = '#fff'; e.target.style.color = '#c0392b'}}
                    >
                      Cancelar Inscrição
                    </button>
                  </div>
                )}
              </article>
            ))
          )}
        </section>
      </main>
    </>
  );
};

export default Perfil;