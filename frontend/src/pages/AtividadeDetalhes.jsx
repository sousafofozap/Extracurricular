import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';
import { AuthContext } from '../context/AuthContext';
import Loader from '../components/Loader';
import { Scanner } from '@yudiel/react-qr-scanner'; 

const AtividadeDetalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [atividade, setAtividade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inscrito, setInscrito] = useState(false);

  const [modalAberto, setModalAberto] = useState(false);
  const [modoModal, setModoModal] = useState(''); 
  const [qrCodeData, setQrCodeData] = useState(null); 
  const [tokenGerado, setTokenGerado] = useState(''); 
  const [tokenDigitado, setTokenDigitado] = useState(''); 
  const [usarCamera, setUsarCamera] = useState(false); 

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const responseAtiv = await api.get(`/atividades/${id}`);
        setAtividade(responseAtiv.data);

        if (user && user.role === 'ALUNO') {
          try {
            const responseInsc = await api.get('/usuarios/me/inscricoes');
            const estaInscrito = responseInsc.data.some(insc => 
              (insc.atividade_id === Number(id)) || (insc.atividade?.id === Number(id))
            );
            setInscrito(estaInscrito);
          } catch (err) {}
        }
      } catch (error) {
        alert("Atividade não encontrada!");
        navigate('/dashboard');
      } finally { setLoading(false); }
    };
    carregarDados();
  }, [id, navigate, user]);

  const handleInscricao = async () => {
    if (!window.confirm("Confirmar inscrição nesta atividade?")) return;
    try {
      await api.post(`/atividades/${id}/inscrever`);
      alert("Inscrição realizada com sucesso!");
      setInscrito(true);
      navigate('/perfil');
    } catch (error) {
      alert(error.response?.data?.message || "Erro ao se inscrever.");
    }
  };

  const handleGerarQR = async () => {
    try {
      const response = await api.post(`/atividades/${id}/checkin/iniciar`);
      setQrCodeData(response.data.qrCodeDataUrl);
      setTokenGerado(response.data.token);
      setModoModal('PROFESSOR');
      setModalAberto(true);
    } catch (error) {
      alert("Erro ao gerar QR Code.");
    }
  };

  const realizarCheckin = async (token) => {
    try {
      await api.post(`/atividades/${id}/checkin`, { token });
      alert("✅ Presença confirmada com sucesso!");
      setModalAberto(false);
      setUsarCamera(false);
      navigate('/perfil');
    } catch (error) {
      alert(error.response?.data?.message || "Código inválido ou expirado.");
    }
  };

  const handleCheckinSubmit = (e) => {
    e.preventDefault();
    if (!tokenDigitado) return alert("Digite o código!");
    realizarCheckin(tokenDigitado);
  };

  const aoLerQrCode = (result) => {
    if (result) {
      const rawValue = result[0]?.rawValue || result?.rawValue;
      if (rawValue) {
        setTokenDigitado(rawValue); 
        setUsarCamera(false); 
        realizarCheckin(rawValue); 
      }
    }
  };

  const formatarData = (d) => new Date(d).toLocaleDateString('pt-BR') + ' às ' + new Date(d).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});

  if (loading) return <div style={{marginTop: '100px'}}><Loader /></div>;
  if (!atividade) return null;

  const ehAluno = user && user.role === 'ALUNO';
  const ehAdminOuProf = user && (user.role === 'ADMIN' || user.role === 'PROFESSOR');

  return (
    <>
      <Header />
      <main className="perfil-container">
        <section className="perfil-card">
          <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
            
            <div style={{borderBottom: '1px solid #eee', paddingBottom: '15px'}}>
                <span style={{ fontSize: "14px", color: "#900008", fontWeight: "bold", textTransform: "uppercase" }}>
                  {atividade.categorias?.[0]?.nome || "Geral"}
                </span>
                <h2 style={{margin: '10px 0 0 0', fontSize: '28px'}}>{atividade.nome}</h2>
                <p style={{color: '#666', marginTop: '5px'}}>Organizado por: <strong>{atividade.criador?.nome}</strong></p>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', background: '#f9f9f9', padding: '20px', borderRadius: '8px'}}>
                <div><p style={{fontWeight:'bold', color:'#555'}}>Data</p><p>{formatarData(atividade.horario_inicio)}</p></div>
                <div><p style={{fontWeight:'bold', color:'#555'}}>Horas</p><p>{atividade.duracao_horas}h</p></div>
                <div><p style={{fontWeight:'bold', color:'#555'}}>Vagas</p><p>{atividade.vagas_total}</p></div>
            </div>

            <div>
                <h3>Sobre o Evento</h3>
                <p style={{lineHeight: '1.6', color: '#444'}}>{atividade.descricao || "Sem descrição."}</p>
            </div>

            <div style={{display: 'flex', gap: '15px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee', flexWrap: 'wrap'}}>
              {ehAluno && (
                <>
                  {!inscrito ? (
                    <button onClick={handleInscricao} className="acessar" style={{width: 'auto'}}>
                      Realizar Inscrição
                    </button>
                  ) : (
                    <>
                      <button disabled className="btn-ver-mais" style={{backgroundColor: '#ccc', cursor: 'default'}}>
                        Já Inscrito ✅
                      </button>
                      <button 
                        onClick={() => { setModoModal('ALUNO'); setModalAberto(true); setUsarCamera(false); setTokenDigitado(''); }}
                        className="acessar" 
                        style={{width: 'auto', backgroundColor: '#27ae60'}}
                      >
                        Registrar Presença 📍
                      </button>
                    </>
                  )}
                </>
              )}

              {ehAdminOuProf && (
                <button 
                  onClick={handleGerarQR} 
                  className="acessar" 
                  style={{width: 'auto', backgroundColor: '#2c3e50'}}
                >
                  Gerar QR Code (Check-in)
                </button>
              )}
              
              <button onClick={() => navigate('/dashboard')} className="btn-ver-mais" style={{backgroundColor: '#fff', color: '#666', border: '1px solid #ccc'}}>
                Voltar
              </button>
            </div>
          </div>
        </section>
      </main>

      {modalAberto && (
        <div className="modal-overlay" onClick={() => { setModalAberto(false); setUsarCamera(false); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="btn-fechar-modal" onClick={() => { setModalAberto(false); setUsarCamera(false); }}>×</button>
            
            {modoModal === 'PROFESSOR' && (
              <>
                <h3 style={{color: '#333'}}>Check-in da Atividade</h3>
                <p style={{fontSize: '14px', color: '#666'}}>Peça aos alunos para escanearem:</p>
                {qrCodeData ? (
                  <>
                    <img src={qrCodeData} alt="QR Code" className="qr-image" />
                    <div className="token-display">{tokenGerado}</div>
                    <p style={{fontSize: '12px', color: 'red'}}>Válido por 5 minutos</p>
                  </>
                ) : <Loader />}
              </>
            )}

            {modoModal === 'ALUNO' && (
              <>
                <h3 style={{color: '#333', marginBottom: '15px'}}>Registrar Presença</h3>
                
                <button 
                  onClick={() => setUsarCamera(!usarCamera)}
                  style={{
                    marginBottom: '15px', padding: '10px', width: '100%', 
                    background: usarCamera ? '#c0392b' : '#2980b9', 
                    color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'
                  }}
                >
                  {usarCamera ? '📷 Fechar Câmera' : '📷 Abrir Câmera para Ler QR'}
                </button>

                {usarCamera && (
                  <div style={{width: '100%', maxWidth: '300px', margin: '0 auto 20px auto', border: '2px solid #333', borderRadius: '10px', overflow: 'hidden'}}>
                    <Scanner 
                        onScan={aoLerQrCode} 
                        components={{ audio: false, finder: false }} 
                        styles={{ container: { width: '100%' } }}
                    />
                    <p style={{fontSize: '12px', marginTop: '5px'}}>Aponte para o QR Code do Professor</p>
                  </div>
                )}

                <p style={{fontSize: '14px', color: '#666', marginBottom: '10px'}}>
                  Ou digite o código manualmente:
                </p>
                
                <form onSubmit={handleCheckinSubmit}>
                  <input 
                    type="text" 
                    className="login" 
                    placeholder="Ex: A1B2" 
                    value={tokenDigitado}
                    onChange={(e) => setTokenDigitado(e.target.value.toUpperCase())}
                    maxLength={6}
                    style={{textAlign: 'center', fontSize: '24px', letterSpacing: '5px', textTransform: 'uppercase'}}
                  />
                  <button type="submit" className="acessar" style={{marginTop: '20px', width: '100%'}}>
                    Confirmar
                  </button>
                </form>
              </>
            )}

          </div>
        </div>
      )}
    </>
  );
};

export default AtividadeDetalhes;