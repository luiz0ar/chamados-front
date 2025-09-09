import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../resources/api';
import './GlobalConfigs.css';
import '../Home/home.css';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Breadcrumb from '../../Components/Breadcrumb/Breadcrumb';
import CrudModal from '../../Components/CrudModal/CrudModal';
import ConfirmModal from '../../Components/ConfirmModal/ConfirmModal';
import Header from '../../Components/Header/Header';

interface CrudItem {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  roles: { name: string }[];
}

const TABS = [
  { key: 'priorities', label: 'Prioridades' },
  { key: 'form-of-services', label: 'Formas de Atendimento' },
  { key: 'form-of-requests', label: 'Formas de Solicitação' },
  { key: 'causes', label: 'Causa' },
  { key: 'doubts', label: 'Dúvida' },
  { key: 'states', label: 'Estado' },
  { key: 'departments', label: 'Departamentos' },
  { key: 'categories', label: 'Categorias' },
  { key: 'services', label: 'Serviços' },
];

const GlobalConfigs: React.FC = () => {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [data, setData] = useState<CrudItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [itemToEdit, setItemToEdit] = useState<CrudItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<CrudItem | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const response = await api.get('/me');
        const userData: User = response.data;
        setUser(userData);

        const isAdmin = userData.roles.some(role => role.name === 'ADMIN');

        if (!isAdmin) {
          toast.error("Você não tem permissão para acessar esta página.");
          navigate('/inicio');
        }
      } catch (error) {
        console.error("Erro de autenticação:", error);
        navigate('/login');
      }
    };

    checkUserRole();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setIsLoading(true);
        setSearchTerm('');
        try {
          const response = await api.get(`/${activeTab.key}`);
          setData(response.data);
        } catch (error) {
          if ((error as any).response?.status !== 401) {
            toast.error(`Não foi possível carregar os dados de ${activeTab.label}.`);
          }
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [activeTab, user]);

  const handleAddItem = () => {
    setIsModalOpen(true);
    setItemToEdit(null);
  };

  const handleSaveItem = async (name: string) => {
    setIsActionLoading(true);
    try {
      if (itemToEdit) {
        const response = await api.put(`/${activeTab.key}/${itemToEdit.id}`, { name });
        setData(data.map(item => item.id === itemToEdit.id ? response.data : item));
        toast.success("Item atualizado com sucesso!");
      } else {
        const response = await api.post(`/${activeTab.key}`, { name });
        setData([...data, response.data]);
        toast.success("Item adicionado com sucesso!");
      }
      setIsModalOpen(false);
      setItemToEdit(null);
    } catch (error) {
      toast.error(`Não foi possível salvar o item.`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEditItem = (item: CrudItem) => {
    setItemToEdit(item);
    setIsModalOpen(true);
  };

  const openDeleteModal = (item: CrudItem) => {
    setItemToDelete(item);
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;
    setIsActionLoading(true);
    try {
      await api.delete(`/${activeTab.key}/${itemToDelete.id}`);
      toast.success("Item excluído com sucesso!");
      setData(data.filter(item => item.id !== itemToDelete.id));
      setItemToDelete(null);
    } catch (error) {
      toast.error("Não foi possível excluir o item.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Início', path: '/inicio' },
    { label: 'Configurações Gerais', path: '/configs' }
  ];

  const filteredData = useMemo(() =>
    data.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [data, searchTerm]
  );

  if (!user) {
    return <div className="loading-container">Verificando permissões...</div>;
  }

  return (
    <div className="home-container">
      <Header />
      <main className="configs-content">
        <Breadcrumb items={breadcrumbItems} />
        <nav className="tabs-container">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`tab-button ${activeTab.key === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <section className="crud-area">
          <div className="crud-header">
            <h2 className='sub-title'>Gerenciar {activeTab.label}</h2>
            <div className="search-and-add">
              <div className="search-container-configs">
                <FaSearch className="search-icon-configs" />
                <input
                  type="text"
                  placeholder={`Pesquisar em ${activeTab.label}...`}
                  className="search-input-configs"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="add-button" onClick={handleAddItem}>
                <FaPlus />
              </button>
            </div>
          </div>
          {isLoading ? (
            <p className='loading-text'>Carregando...</p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th style={{ textAlign: 'center' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map(item => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>
                        <div className="actions-cell">
                          <button className="action-button edit" onClick={() => handleEditItem(item)}>
                            <FaEdit title="Editar" />
                          </button>
                          <button className="action-button delete" onClick={() => openDeleteModal(item)}>
                            <FaTrash title="Excluir" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
      <CrudModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setItemToEdit(null); }}
        onSave={handleSaveItem}
        title={itemToEdit ? `Editar ${activeTab.label.slice(0, -1)}` : `Adicionar ${activeTab.label.slice(0, -1)}`}
        isLoading={isActionLoading}
        currentItem={itemToEdit}
      />
      <ConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDeleteItem}
        title="Confirmar Exclusão"
        message={`Você tem certeza que deseja excluir o item "${itemToDelete?.name}"? Esta ação não pode ser desfeita.`}
        isLoading={isActionLoading}
      />
    </div>
  );
};

export default GlobalConfigs;
