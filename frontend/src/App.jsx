import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AtividadeDetalhes from './pages/AtividadeDetalhes';
import Perfil from './pages/Perfil';
import NovaAtividade from './pages/NovaAtividade';
import Chamada from './pages/Chamada';
import AdminStats from './pages/AdminStats';
import EditarAtividade from './pages/EditarAtividade';
import NovaCategoria from './pages/NovaCategoria';

const PrivateRoute = ({ children }) => {
  const { authenticated, loading } = useContext(AuthContext);
  if (loading) return <div>Carregando...</div>;
  if (!authenticated) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/atividades/:id" element={<PrivateRoute><AtividadeDetalhes /></PrivateRoute>} />
        <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />
        
        <Route path="/nova-atividade" element={<PrivateRoute><NovaAtividade /></PrivateRoute>} />
        <Route path="/atividades/:id/chamada" element={<PrivateRoute><Chamada /></PrivateRoute>} />
        <Route path="/admin/stats" element={<PrivateRoute><AdminStats /></PrivateRoute>} />
        <Route path="/atividades/:id/editar" element={<PrivateRoute><EditarAtividade /></PrivateRoute>} />
        <Route path="/nova-categoria" element={<PrivateRoute><NovaCategoria /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;