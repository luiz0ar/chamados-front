import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './home.css';
import api from '../../resources/api';
import Header from '../../Components/Header/Header';
import { FaSearch, FaUserCog } from 'react-icons/fa';
import { MdOutlineSupportAgent } from "react-icons/md";
import { FaWpforms, FaGears } from "react-icons/fa6";
import { BsDatabaseFill } from "react-icons/bs";
import { IoAnalyticsSharp } from "react-icons/io5";

interface User {
  id: number;
  name: string;
  roles: { name: string }[];
}

const allActionItems = [
  {
    icon: <MdOutlineSupportAgent className="card-icon" />,
    title: 'Gestão de Chamados',
    description: 'Visualize, atualize e gerencie todos os chamados existentes.',
    link: '#',
    adminOnly: false
  },
  {
    icon: <FaWpforms className="card-icon" />,
    title: 'Abertura de Chamados',
    description: 'Precisa de ajuda? Abra um novo chamado para nossa equipe.',
    link: '#',
    adminOnly: false
  },
  {
    icon: <BsDatabaseFill className="card-icon" />,
    title: 'Base de Conhecimento',
    description: 'Encontre artigos, tutoriais e respostas para dúvidas frequentes.',
    link: '#',
    adminOnly: false
  },
  {
    icon: <IoAnalyticsSharp className="card-icon" />,
    title: 'Relatórios',
    description: 'Gere e visualize relatórios de performance e estatísticas.',
    link: '#',
    adminOnly: false
  },
  {
    icon: <FaGears className="card-icon" />,
    title: 'Configurações Gerais',
    description: 'Gerencie as configurações do sistema e suas preferências.',
    link: '/configuracoes',
    adminOnly: true
  },
  {
    icon: <FaUserCog className="card-icon" />,
    title: 'Configurações dos Usuários',
    description: 'Gerencie as configurações dos usuários e parâmetros.',
    link: '/gerenciar-usuarios',
    adminOnly: true
  }
];

const Home: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/me');
        setUser(response.data);
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        navigate('/login');
      }
    };
    fetchUserData();
  }, [navigate]);
  const visibleActionItems = useMemo(() => {
    if (!user) {
      return [];
    }
    const isAdmin = user.roles.some(role => role.name === 'ADMIN');
    if (isAdmin) {
      return allActionItems;
    }
    return allActionItems.filter(item => !item.adminOnly);
  }, [user]);
  const userName = user ? user.name : "Usuário";
  return (
    <div className="home-container">
      <Header />

      <main className="home-content">
        <header className="welcome-header">
          <h1>Olá, {userName}.</h1>
          <p>Como podemos te ajudar hoje?</p>
        </header>
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Pesquise por chamados, artigos ou relatórios..." className="search-input" />
        </div>
        <section className="action-grid">
          {visibleActionItems.map((item, index) => (
            <Link to={item.link} key={index} className="action-card">
              {item.icon}
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
};

export default Home;
