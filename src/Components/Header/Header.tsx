import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Header.css';
import api from '../../resources/api';
import logoMinasul from '/assets/logo-branca-cima.png';
import { FaBell, FaSignOutAlt, FaUser } from 'react-icons/fa';

const Header: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error("Erro ao invalidar token no backend:", error);
    } finally {
      localStorage.removeItem('authToken');
      navigate('/login');
    }
  };

  return (
    <nav className="header">
      <Link to='/inicio'>
        <img src={logoMinasul} alt="Minasul Logo" className="header-logo" />
      </Link>
      <div className="header-actions">
        <div className="header-icons">
          <FaBell title="Notificações" className="bell-icon" />
          <FaSignOutAlt
            title="Sair"
            className="logout-icon"
            onClick={handleLogout}
          />
          <FaUser />
        </div>
      </div>
    </nav>
  );
};

export default Header;
