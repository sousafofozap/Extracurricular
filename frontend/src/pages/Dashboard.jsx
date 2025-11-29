import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader'; // Importação correta

const Dashboard = () => {
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categorias, setCategorias] = useState([]);
  const [filtroSelecionado, setFiltroSelecionado] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await api.get('/categorias');
        setCategorias(response.data);
      } catch (error) { 
        console.error("Erro categorias", error); 
      }
    };
    fetchCategorias();
  }, []);

  useEffect(() => {
    const fetchAtividades = async () => {
      setLoading(true);
      try {
        const url = filtroSelecionado ? `/atividades?categoriaId=${filtroSelecionado}` : '/atividades';
        const response = await api.get(url);
        setAtividades(response.data);
      } catch (error) { 
        console.error("Erro atividades", error); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchAtividades();
  }, [filtroSelecionado]);

  const handleDelete = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja excluir a atividade "${nome}"?`)) return;

    try {
      await api.delete(`/atividades/${id}`);
      setAtividades(atividades.filter(a => a.id !== id));
      alert("Atividade excluída com sucesso.");
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir. Verifique se você tem permissão.");
    }
  };

  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR') + ' às ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <>
        <Header />
        <main>
           <Loader />
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main>
        <section className="boas-vindas">
          <h2>Bem-vindo, <strong>{user?.nome}</strong>!</h2>
          <p>Confira abaixo as atividades complementares disponíveis para inscrição.</p>
        </section>

        <section className="atividades">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
            <h2>Próximos Eventos</h2>
          </div>
          
          <nav className="filtroAtividades">
            <ul>
              <li className={filtroSelecionado === null ? 'ativo' : ''}>
                <button onClick={() => setFiltroSelecionado(null)}>Todas</button>
              </li>
              {categorias.map((cat) => (
                <li key={cat.id} className={filtroSelecionado === cat.id ? 'ativo' : ''}>
                  <button onClick={() => setFiltroSelecionado(cat.id)}>{cat.nome}</button>
                </li>
              ))}
            </ul>
          </nav>

          {atividades.length === 0 ? (
            <p style={{textAlign: 'center', padding: '20px', color: '#666'}}>Nenhuma atividade encontrada nesta categoria.</p>
          ) : (
            atividades.map((atividade) => (
              <article key={atividade.id}>
                <span style={{ fontSize: "12px", color: "#900008", fontWeight: "bold", textTransform: "uppercase" }}>
                  {atividade.categorias?.[0]?.nome || "Geral"}
                </span>

                <h3>{atividade.nome}</h3>
                <p><strong>Data:</strong> {formatarData(atividade.horario_inicio)}</p>
                <p><strong>Horas:</strong> {atividade.duracao_horas}h | <strong>Vagas:</strong> {atividade.vagas_total}</p>

                <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
                    
                    <Link to={`/atividades/${atividade.id}`} className="btn-ver-mais" style={{ margin: 0 }}>
                      Ver Detalhes
                    </Link>

                    {(user?.role === 'ADMIN' || user?.role === 'PROFESSOR') && (
                        <>
                          <Link 
                            to={`/atividades/${atividade.id}/chamada`} 
                            className="btn-ver-mais btn-action" 
                            style={{ backgroundColor: '#27ae60' }}
                          >
                            Presença 📋
                          </Link>

                          <Link 
                            to={`/atividades/${atividade.id}/editar`} 
                            className="btn-ver-mais btn-action" 
                            style={{ backgroundColor: '#f39c12' }}
                          >
                            Editar ✏️
                          </Link>

                          <button 
                            onClick={() => handleDelete(atividade.id, atividade.nome)}
                            className="btn-ver-mais btn-action"
                            style={{ backgroundColor: '#c0392b', border: 'none', cursor: 'pointer' }}
                          >
                            Excluir 🗑️
                          </button>
                        </>
                    )}
                </div>
              </article>
            ))
          )}
        </section>
      </main>
      <footer><p>&copy; 2025 Unibalsas - Sistema de Atividades.</p></footer>
    </>
  );
};

export default Dashboard;