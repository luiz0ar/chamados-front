import React, { useState, useEffect } from 'react';
import LoadingScreen from '../../Components/LoadingScreen/LoadingScreen';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../resources/api';
import Header from '../../Components/Header/Header';
import Breadcrumb from '../../Components/Breadcrumb/Breadcrumb';
import './EditUser.css';
import '../GlobalConfigs/GlobalConfigs.css';
import { FaSpinner } from 'react-icons/fa';
import StyledSelect from '../../Components/StyledSelect/StyledSelect';

interface Department { id: number; name: string; }
interface Role { id: number; name: string; }
interface Queue { id: number; name: string; }
interface User {
  id: number;
  name: string;
  email: string;
  department_id: number | null;
  is_active: 1 | 0;
  image_url: string | null;
  department: Department | null;
  roles: Role[];
  queues: Queue[];
}

const EditUser: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [queues, setQueues] = useState<Queue[]>([]);

  useEffect(() => {
    if (!id) {
      toast.error("ID de usuário não encontrado.");
      navigate('/gerenciar-usuarios');
      return;
    }

    const fetchPageData = async () => {
      setIsLoading(true);
      try {
        const [userResponse, departmentsResponse, rolesResponse, queuesResponse] = await Promise.all([
          api.get(`/users/${id}`),
          api.get('/departments'),
          api.get('/roles'),
          api.get('/queues'),
        ]);

        setUser(userResponse.data);
        setDepartments(departmentsResponse.data || []);
        setRoles(rolesResponse.data || []);
        setQueues(queuesResponse.data || []);

      } catch (error) {
        toast.error("Não foi possível carregar os dados necessários para a página.");
        navigate('/gerenciar-usuarios');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPageData();
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser(prevUser => (prevUser ? { ...prevUser, [name]: value } : null));
  };

  const handleDepartmentChange = (selectedOption: any) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      return {
        ...prevUser,
        department_id: selectedOption ? selectedOption.value : null,
        department: selectedOption ? { id: selectedOption.value, name: selectedOption.label } : null,
      };
    });
  };

  const handleRoleChange = (selectedOptions: any) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      const roleIds = selectedOptions.map((opt: any) => ({ id: opt.value, name: opt.label }));
      return { ...prevUser, roles: roleIds };
    });
  };

  const handleQueuesChange = (selectedOption: any) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      return {
        ...prevUser,
        queues: selectedOption ? [{ id: selectedOption.value, name: selectedOption.label }] : [],
      };
    });
  };

  const handleStatusToggle = () => {
    setUser(prevUser => {
      if (!prevUser) return null;
      return { ...prevUser, is_active: prevUser.is_active ? 0 : 1 };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      const payload = {
        ...user,
        roles: user.roles.map(role => role.id),
        queues: user.queues.map(queue => queue.id),
      };

      await api.put(`/users/${id}`, payload);
      toast.success("Usuário atualizado com sucesso!");

    } catch (error) {
      toast.error("Não foi possível salvar as alterações.");
    } finally {
      setIsSaving(false);
    }
  };

  const breadcrumbItems = [
    { label: 'INÍCIO', path: '/inicio' },
    { label: 'GERENCIAR USUÁRIOS', path: '/gerenciar-usuarios' },
    { label: 'EDIÇÃO DE USUÁRIO', path: `/gerenciar-usuarios/editar/${id}` }
  ];

  if (isLoading || !user) {
    return <LoadingScreen />;
  }

  const departmentOptions = departments.map(d => ({ value: d.id, label: d.name }));
  const roleOptions = roles.map(r => ({ value: r.id, label: r.name }));
  const queueOptions = queues.map(q => ({ value: q.id, label: q.name }));

  const selectedDepartmentValue = departmentOptions.find(opt => String(opt.value) === String(user.department?.id)) || null;
  const selectedRolesValue = roleOptions.filter(opt => user.roles.some(userRole => String(userRole.id) === String(opt.value)));
  const selectedQueueValue = queueOptions.find(opt => user.queues?.[0] && String(opt.value) === String(user.queues[0].id)) || null;

  return (
    <div className="home-container">
      <Header imageUrl={user.image_url} />
      <main className="configs-content">
        <Breadcrumb items={breadcrumbItems} />
        <form className="edit-user-form" onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Nome<span className="required-star">*</span></label>
              <input id="name" name="name" type="text" value={user.name} onChange={handleChange} className="form-input" required />
            </div>

            <div className="form-group">
              <label htmlFor="email">E-mail<span className="required-star">*</span></label>
              <input id="email" name="email" type="email" value={user.email} onChange={handleChange} className="form-input" />
            </div>

            <div className="form-group">
              <label htmlFor="department_id">Departamento<span className="required-star">*</span></label>
              <StyledSelect options={departmentOptions} value={selectedDepartmentValue} onChange={handleDepartmentChange} />
            </div>

            <div className="form-group">
              <label htmlFor="role">Cargo no Sistema<span className="required-star">*</span></label>
              <StyledSelect isMulti options={roleOptions} value={selectedRolesValue} onChange={handleRoleChange} />
            </div>

            <div className="form-group">
              <label htmlFor="queues">Fila<span className="required-star">*</span></label>
              <StyledSelect options={queueOptions} value={selectedQueueValue} onChange={handleQueuesChange} />
            </div>

            <div className="switch-container">
              <label className="switch">
                <input type="checkbox" checked={!!user.is_active} onChange={handleStatusToggle} />
                <span className="slider"></span>
              </label>
              <span className={`status-label ${user.is_active ? 'active' : 'inactive'}`}>{user.is_active ? 'ATIVO' : 'INATIVO'}</span>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate('/gerenciar-usuarios')}>Cancelar</button>
            <button type="submit" className="btn-confirm" disabled={isSaving}>
              {isSaving ? <FaSpinner className="spinner" /> : 'Salvar'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default EditUser;
