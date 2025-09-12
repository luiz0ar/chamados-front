import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Header.css';
import api from '../../resources/api';
import logoMinasul from '/assets/logo-branca-cima.png';
import { FaBell, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';

interface HeaderProps {
  userName: string;
  imageUrl?: string | null;
}

const Header: React.FC<HeaderProps> = ({ userName, imageUrl }) => {
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
           {imageUrl ? (
            <img src={imageUrl} alt={userName} title="Meu Perfil" className="header-profile-pic" />
          ) : (
            <FaUserCircle title="Meu Perfil" />
          )}
          <FaSignOutAlt
            title="Sair"
            className="logout-icon"
            onClick={handleLogout}
          />
        </div>
      </div>
    </nav>
  );
};

export default Header;
