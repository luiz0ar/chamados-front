import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../resources/api';
import Header from '../../Components/Header/Header';
import Breadcrumb from '../../Components/Breadcrumb/Breadcrumb';

import './UserConfig.css';
import '../GlobalConfigs/GlobalConfigs.css';

import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';

interface UserFromApi {
  id: number;
  name: string;
  email: string;
  department: { id: number, name: string };
  roles: { id: number, name: string }[];
  is_active: 1 | 0;
}

interface LoggedInUser {
  id: number;
  name: string;
  roles: { name: string }[];
}

const UserConfig: React.FC = () => {
  const [users, setUsers] = useState<UserFromApi[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserRoleAndFetchData = async () => {
      setIsLoading(true);
      try {
        const meResponse = await api.get('/me');
        const currentUser: LoggedInUser = meResponse.data;
        setLoggedInUser(currentUser);

        const isAdmin = currentUser.roles.some(role => role.name === 'ADMIN');
        if (!isAdmin) {
          toast.error("Você não tem permissão para acessar esta página.");
          navigate('/inicio');
          return;
        }

        // Altere para uma rota que retorne TODOS os usuários, se necessário
        const usersResponse = await api.get('/users');
        setUsers(usersResponse.data || []);

      } catch (error) {
        console.error("Erro de autenticação ou ao buscar dados:", error);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkUserRoleAndFetchData();
  }, [navigate]);

  const filteredUsers = useMemo(() =>
    users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [users, searchTerm]
  );

  const breadcrumbItems = [
    { label: 'Início', path: '/inicio' },
    { label: 'Gerenciar Usuários', path: '/gerenciar-usuarios' }
  ];

  if (!loggedInUser) {
    return <div className="loading-container">Verificando permissões...</div>;
  }

  return (
    <div className="home-container">
      <Header />
      <main className="configs-content">
        <Breadcrumb items={breadcrumbItems} />

        <section className="crud-area">
          <div className="crud-header">
            <h2 className='sub-title'>Usuários do Sistema</h2>
            <div className="search-and-add">
              <div className="search-container-configs">
                <FaSearch className="search-icon-configs" />
                <input
                  type="text"
                  placeholder="Pesquisar por nome ou e-mail..."
                  className="search-input-configs"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="add-button" onClick={() => alert('Abrir modal de adição de usuário')}>
                <FaPlus />
              </button>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Departamento</th>
                  <th>Perfil</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6}><p className='loading-text'>Carregando...</p></td></tr>
                ) : (
                  filteredUsers.map(user => {
                    const statusText = user.is_active ? 'Ativo' : 'Inativo';
                    const profileName = user.roles.length > 0 ? user.roles[0].name : 'N/A';

                    return (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.department?.name || 'N/A'}</td>
                        <td>{profileName}</td>
                        <td>
                          <div className="user-status">
                            <span className={`status-indicator ${statusText === 'Ativo' ? 'active' : 'inactive'}`}></span>
                            {statusText}
                          </div>
                        </td>
                        <td>
                          <div className="actions-cell">
                            <button className="action-button edit" onClick={() => alert(`Editar usuário ${user.id}`)}>
                              <FaEdit title="Editar" />
                            </button>
                            <button className="action-button delete" onClick={() => alert(`Excluir usuário ${user.id}`)}>
                              <FaTrash title="Excluir" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default UserConfig;
