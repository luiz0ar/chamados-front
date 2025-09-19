import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../resources/api';
import './GlobalConfigs.css';
import '../Home/home.css';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaCog, FaShieldAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Breadcrumb from '../../Components/Breadcrumb/Breadcrumb';
import CrudModal from '../../Components/CrudModal/CrudModal';
import ConfirmModal from '../../Components/ConfirmModal/ConfirmModal';
import Header from '../../Components/Header/Header';
import ServicesModal from '../../Components/ServiceModal/ServiceModal';
import PermissionsModal from '../../Components/PermissionsModal/PermissionsModal';
import LoadingScreen from '../../Components/LoadingScreen/LoadingScreen';

interface CrudItem {
  id: number;
  name: string;
  services?: { id: number, name: string }[];
  permissions?: { id: number, name: string }[];
  time_limit?: number;
  priority_sla_relations?: number;
}
interface User {
  id: number;
  name: string;
  roles: { name: string }[];
  image_url: string | null;
}
interface SaveData {
  name: string;
  time_limit?: number;
}

const TABS = [
  { key: 'priorities', label: 'Prioridades' },
  { key: 'slas', label: 'SLA' },
  { key: 'form-of-services', label: 'Formas de Atendimento' },
  { key: 'form-of-requests', label: 'Formas de Solicitação' },
  { key: 'causes', label: 'Causa' },
  { key: 'queues', label: 'Filas' },
  { key: 'states', label: 'Status' },
  { key: 'departments', label: 'Departamentos' },
  { key: 'categories', label: 'Categorias' },
  { key: 'services', label: 'Serviços' },
  { key: 'roles', label: 'Funções' },
  { key: 'permissions', label: 'Permissões' }
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
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [allPermissions, setAllPermissions] = useState<{ id: number, name: string }[]>([]);
  const [allServices, setAllServices] = useState<{ id: number, name: string }[]>([]);
  const [isServicesModalOpen, setIsServicesModalOpen] = useState(false);

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

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get('/services');
        setAllServices(response.data.data || response.data || []);
      } catch (error) {
        toast.error("Não foi possível carregar a lista de serviços.");
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    const fetchAssociables = async () => {
      try {
        const [servicesRes, permissionsRes] = await Promise.all([
          api.get('/services'),
          api.get('/permissions')

        ]);
        setAllServices(servicesRes.data);
        setAllPermissions(permissionsRes.data.data || permissionsRes.data || []);
      } catch (error) {
        toast.error("Não foi possível carregar a lista de serviços ou permissões.");
      }
    };
    fetchAssociables();
  }, []);

  const handleAddItem = () => {
    setIsModalOpen(true);
    setItemToEdit(null);
  };

  const handleSaveItem = async (formData: SaveData) => {
    setIsActionLoading(true);
    try {
      if (itemToEdit) {
        const response = await api.put(`/${activeTab.key}/${itemToEdit.id}`, formData);
        setData(data.map(item => item.id === itemToEdit.id ? response.data : item));
        toast.success("Item atualizado com sucesso!");
      } else {
        const response = await api.post(`/${activeTab.key}`, formData);
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

  // const handleEditItem = (item: CrudItem) => {
  //   setItemToEdit(item);
  //   setIsModalOpen(true);
  // };

  const openEditModal = (item: CrudItem) => {
    setItemToEdit(item);
    setIsModalOpen(true);
  };

  const handleServicesClick = (item: CrudItem) => {
    setItemToEdit(item);
    setIsServicesModalOpen(true);
  };

  const handlePermissionsClick = async (role: CrudItem) => {
    setItemToEdit(role);
    setIsActionLoading(true);
    try {
      const response = await api.get(`/roles/${role.id}/permissions`);
      const currentPermissions = response.data.data || response.data || [];
      setItemToEdit({ ...role, permissions: currentPermissions });
      setIsPermissionsModalOpen(true);
    } catch (error) {
      toast.error("Não foi possível carregar as permissões desta função.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSaveQueueServices = async (selectedServices: any[]) => {
    if (!itemToEdit) return;
    setIsActionLoading(true);
    try {
      const serviceIds = selectedServices.map(s => s.value);
      await api.post(`/queues/${itemToEdit.id}/services`, { services: serviceIds });
      const updatedItem = {
        ...itemToEdit,
        services: selectedServices.map(s => ({ id: s.value, name: s.label }))
      };
      setData(data.map(item => item.id === itemToEdit.id ? updatedItem : item));
      setItemToEdit(updatedItem);

      toast.success("Serviços adicionados com sucesso!");
      setIsServicesModalOpen(false);
    } catch (error) {
      toast.error("Não foi possível adicionar os serviços.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSaveRolePermissions = async (selectedPermissions: any[]) => {
    if (!itemToEdit) return;
    setIsActionLoading(true);
    try {
      const initialPermissionIds = new Set(itemToEdit.permissions?.map(p => p.id) || []);
      const selectedPermissionIds = new Set(selectedPermissions.map(p => p.value));
      const permissionsToAdd = selectedPermissions.filter(p => !initialPermissionIds.has(p.value)).map(p => p.value);
      const permissionsToRemove = itemToEdit.permissions?.filter(p => !selectedPermissionIds.has(p.id)).map(p => p.id) || [];
      const promisesToAwait = [];
      if (permissionsToAdd.length > 0) {
        promisesToAwait.push(api.post(`/roles/${itemToEdit.id}/permissions`, { permissions: permissionsToAdd }));
      }
      if (permissionsToRemove.length > 0) {
        promisesToAwait.push(api.delete(`/roles/${itemToEdit.id}/permissions`, { data: { permissions: permissionsToRemove } }));
      }
      if (promisesToAwait.length > 0) {
        await Promise.all(promisesToAwait);
      }
      const updatedItem = { ...itemToEdit, permissions: selectedPermissions.map(p => ({ id: p.value, name: p.label })) };
      setData(data.map(item => item.id === itemToEdit.id ? updatedItem : item));
      setItemToEdit(updatedItem);
      toast.success("Permissões atualizadas com sucesso!");
      setIsPermissionsModalOpen(false);
    } catch (error) {
      toast.error("Não foi possível atualizar as permissões.");
    } finally {
      setIsActionLoading(false);
    }
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
    { label: 'INÍCIO', path: '/inicio' },
    { label: 'CONFIGURAÇÕES GERAIS', path: '/configs' }
  ];

  const filteredData = useMemo(() =>
    data.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [data, searchTerm]
  );

  if (!user) {
    return <LoadingScreen />;
  }

  return (
    <div className="home-container">
      <Header imageUrl={user.image_url} />
      <main className="configs-content">
        <Breadcrumb items={breadcrumbItems} />
        <nav className="tabs-container">
          {TABS.map(tab => (
            <button key={tab.key} className={`tab-button ${activeTab.key === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
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
                  onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                />
              </div>
              <button className="add-button" onClick={handleAddItem}>
                <FaPlus />
              </button>
            </div>
          </div>
          {isLoading ? (
            <LoadingScreen />
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    {activeTab.key === 'slas' ? <th>Nome do SLA</th> : <th>Nome</th>}
                    {activeTab.key === 'slas' && <th>Limite de Tempo (min)</th>}
                    {activeTab.key === 'slas' && <th>Prioridade</th>}
                    <th style={{ textAlign: 'center' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map(item => (
                    <tr key={item.id}>
                      <td>{item.name || (item as any).time_name}</td>
                      {activeTab.key === 'slas' && <td>{item.time_limit}</td>}
                      <td>
                        <div className="actions-cell">
                          {(activeTab.key === 'queues' || activeTab.key === 'categories') && (
                            <button className="action-button services" onClick={() => handleServicesClick(item)}>
                              <FaCog title="Gerenciar Serviços" />
                            </button>
                          )}
                          {activeTab.key === 'roles' && (
                            <button className="action-button permissions" onClick={() => handlePermissionsClick(item)}>
                              <FaShieldAlt title="Gerenciar Permissões" />
                            </button>
                          )}
                          <button className="action-button edit" onClick={() => openEditModal(item)}>
                            <FaEdit title="Editar Nome" />
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
        title={`${itemToEdit ? 'Editar' : 'Adicionar'} ${activeTab.label.endsWith('s') ? activeTab.label.slice(0, -1) : activeTab.label}`}
        isLoading={isActionLoading}
        currentItem={itemToEdit}
        showTimeLimitField={activeTab.key === 'slas'}
      />

      <ConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDeleteItem}
        title="Confirmar Exclusão"
        message={`Você tem certeza que deseja excluir o item "${itemToDelete?.name}"?`}
        isLoading={isActionLoading}
      />

      <ServicesModal
        isOpen={isServicesModalOpen}
        onClose={() => setIsServicesModalOpen(false)}
        onSave={handleSaveQueueServices}
        allServices={allServices.map(s => ({ value: s.id, label: s.name }))}
        initialSelectedServices={
          Array.isArray(itemToEdit?.services)
            ? itemToEdit.services.map(s => ({ value: s.id, label: s.name }))
            : []
        }
        isLoading={isActionLoading}
      />

      <PermissionsModal
        isOpen={isPermissionsModalOpen}
        onClose={() => setIsPermissionsModalOpen(false)}
        onSave={handleSaveRolePermissions}
        allPermissions={allPermissions.map(p => ({ value: p.id, label: p.name }))}
        initialSelectedPermissions={itemToEdit?.permissions?.map(p => ({ value: p.id, label: p.name })) || []}
        isLoading={isActionLoading}
      />
    </div>
  );
};

export default GlobalConfigs;
