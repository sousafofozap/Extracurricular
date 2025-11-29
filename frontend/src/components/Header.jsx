import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const [mobileAtivo, setMobileAtivo] = useState(false);
  const [sidebarFechada, setSidebarFechada] = useState(false);
  
  const location = useLocation();
  const inicial = user?.nome ? user.nome.charAt(0).toUpperCase() : 'U';
  const fecharMenuMobile = () => setMobileAtivo(false);

  useEffect(() => {
    if (sidebarFechada) {
      document.body.classList.add('menu-desktop-fechado');
    } else {
      document.body.classList.remove('menu-desktop-fechado');
    }
    return () => document.body.classList.remove('menu-desktop-fechado');
  }, [sidebarFechada]);

  const isActive = (path) => location.pathname === path ? { backgroundColor: 'rgba(255,255,255,0.1)', borderLeftColor: 'white', color: 'white' } : {};

  const renderLink = (to, icon, text) => (
    <Link to={to} style={isActive(to)} onClick={fecharMenuMobile} title={text}>
      <span className="icon-menu">{icon}</span>
      <span className="link-text">{text}</span>
    </Link>
  );

  return (
    <>
      <button className="menu-toggle-mobile" onClick={() => setMobileAtivo(!mobileAtivo)}>
        {mobileAtivo ? '✕' : '☰'}
      </button>

      <aside className={`sidebar ${mobileAtivo ? 'ativo' : ''} ${sidebarFechada ? 'fechada' : ''}`}>
        
        <div className="sidebar-logo">
          <Link to="/dashboard" onClick={fecharMenuMobile} className="logo-container" style={{textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center'}}>
         
            <img src="/img/ub.png" alt="UB" />
          </Link>
          
          <button className="btn-toggle-desktop" onClick={() => setSidebarFechada(!sidebarFechada)}>
            {sidebarFechada ? '▶' : '◀'}
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li className="menu-section">PRINCIPAL</li>
            <li>{renderLink("/dashboard", "🏠", "Início / Mural")}</li>
            <li>{renderLink("/perfil", "🎓", "Minhas Inscrições")}</li>

            {(user?.role === 'PROFESSOR' || user?.role === 'ADMIN') && (
              <>
                <li className="menu-section">GESTÃO</li>
                <li>{renderLink("/nova-atividade", "➕", "Nova Atividade")}</li>
              </>
            )}

            {user?.role === 'ADMIN' && (
              <>
                <li className="menu-section">ADMINISTRAÇÃO</li>
                <li>{renderLink("/nova-categoria", "🏷️", "Categorias")}</li>
                <li>{renderLink("/admin/stats", "📊", "Painel / Stats")}</li>
              </>
            )}
          </ul>
        </nav>

        <div className="sidebar-profile">
            <Link to="/perfil" onClick={fecharMenuMobile} style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit', flex: 1, overflow: 'hidden' }} title="Ir para Meu Perfil">
              <div className="profile-pic">{inicial}</div>
              <div className="profile-info">
                <div className="profile-name">{user?.nome}</div>
                <div className="profile-role">{user?.role}</div>
              </div>
            </Link>
            
            <button className="btn-logout" onClick={logout} title="Sair da Conta">↪</button>
        </div>

      </aside>
    </>
  );
};

export default Header;