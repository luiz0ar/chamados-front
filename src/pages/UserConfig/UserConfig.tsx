import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../resources/mock';
import Header from '../../Components/Header/Header';
import Breadcrumb from '../../Components/Breadcrumb/Breadcrumb';
import StyledSelect from '../../Components/StyledSelect/StyledSelect';  
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import './UserConfig.css';

interface UserFromApi {
  id: number;
  name: string;
  email: string;
  department: { id: number, name: string };
}

interface LoggedInUser {
  id: number;
  name: string;
  roles: { name: string }[];
  image_url: string | null;
}

const UserConfig: React.FC = () => {
  const [users, setUsers] = useState<UserFromApi[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(null);
  const navigate = useNavigate();

  const [departments, setDepartments] = useState<{ id: number, name: string }[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);

  useEffect(() => {
    const initializePage = async () => {
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
        
        const [usersResponse, departmentsResponse] = await Promise.all([
          api.get('/users'),
          api.get('/departments')
        ]);

        setUsers(usersResponse.data.data || usersResponse.data || []);
        setDepartments(departmentsResponse.data.data || departmentsResponse.data || []);

      } catch (error) {
        console.error("Erro ao inicializar página:", error);
        toast.error("Sessão expirada ou erro de autenticação.");
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    initializePage();
  }, [navigate]);

  const filteredUsers = useMemo(() =>
    users.filter(user => {
      const searchMatch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const departmentMatch = !selectedDepartment || selectedDepartment.value === 'all' || user.department.id === selectedDepartment.value;

      return searchMatch && departmentMatch;
    }),
    [users, searchTerm, selectedDepartment]
  );

  const breadcrumbItems = [
    { label: 'INÍCIO', path: '/inicio' },
    { label: 'GERENCIAR USUÁRIOS', path: '/gerenciar-usuarios' }
  ];

  if (!loggedInUser) {
    return <div className="loading-container">Verificando permissões...</div>;
  }

  return (
    <div className="home-container">
      <Header userName={loggedInUser.name} imageUrl={loggedInUser.image_url} />
      <main className="configs-content">
        <Breadcrumb items={breadcrumbItems} />

        <section className="crud-area">
          <div className="crud-header">
            <h2 className='sub-title'>Usuários do Sistema</h2>
            <div className="search-and-add">
              
              <div className="styled-select-wrapper">
                <StyledSelect
                  placeholder="Filtrar por departamento..."
                  options={departments.map(dep => ({ value: dep.id, label: dep.name }))}
                  value={selectedDepartment}
                  onChange={(option) => setSelectedDepartment(option)}
                  isClearable
                  showAllOption
                />
              </div>

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
              <button className="add-button" onClick={() => navigate('/gerenciar-usuarios/adicionar')}>
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
                  <th style={{ textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={4}><p className='loading-text'>Carregando...</p></td></tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.department?.name || 'N/A'}</td>
                      <td>
                        <div className="actions-cell">
                          <button 
                            className="action-button edit" 
                            onClick={() => navigate(`/gerenciar-usuarios/editar/${user.id}`)}
                            data-tooltip-id="app-tooltip"
                            data-tooltip-content="Editar Usuário">
                              <FaEdit />
                          </button>
                          <button 
                            className="action-button delete" 
                            onClick={() => alert(`Excluir usuário ${user.id}`)}
                            data-tooltip-id="app-tooltip"
                            data-tooltip-content="Excluir Usuário"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
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