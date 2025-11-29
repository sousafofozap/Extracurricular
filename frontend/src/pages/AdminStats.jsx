import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import Loader from '../components/Loader';

const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [topAtividades, setTopAtividades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      try {
        const resStats = await api.get('/admin/stats');
        setStats(resStats.data);
        const resTop = await api.get('/admin/top/atividades');
        setTopAtividades(resTop.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, []);

  if (loading) {
  return (
    <>
      <Header />
        <main className="perfil-container">
          <Loader />
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      
      <main className="perfil-container">
        
        <h2 style={{ textAlign: 'left', width: '100%', borderLeft: '5px solid #900008', paddingLeft: '10px', marginBottom: '30px' }}>
          Painel Administrativo
        </h2>

        <div className="admin-grid">
          
          <div className="admin-card">
            <h3>Alunos</h3>
            <h2>{stats?.totalUsuarios || 0}</h2>
          </div>

          <div className="admin-card">
            <h3>Atividades</h3>
            <h2>{stats?.totalAtividades || 0}</h2>
          </div>

          <div className="admin-card">
            <h3>Inscrições</h3>
            <h2>{stats?.totalInscricoes || 0}</h2>
          </div>

          <div className="admin-card">
            <h3>Horas Geradas</h3>
            <h2>{stats?.totalHorasCreditadas || 0}h</h2>
          </div>

        </div>

        {topAtividades.length > 0 && (
          <section className="selecionar-atividade" style={{maxWidth: '100%'}}>
            <h3 style={{marginBottom: '20px', color: '#900008'}}>Atividades com mais inscritos</h3>
            <table>
              <thead>
                <tr>
                  <th>Atividade</th>
                  <th>Data</th>
                  <th style={{textAlign: 'center'}}>Inscritos</th>
                </tr>
              </thead>
              <tbody>
                {topAtividades.map((ativ, index) => (
                  <tr key={ativ.id}>
                    <td><strong>{index + 1}º</strong> {ativ.nome}</td>
                    <td>{new Date(ativ.horario_inicio).toLocaleDateString()}</td>
                    <td style={{textAlign: 'center', fontWeight: 'bold', color: '#27ae60'}}>
                      {ativ.total_inscricoes || ativ.dataValues?.total_inscricoes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

      </main>
    </>
  );
};

export default AdminStats;