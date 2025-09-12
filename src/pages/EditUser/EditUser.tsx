import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../resources/api';
import Header from '../../Components/Header/Header';
import Breadcrumb from '../../Components/Breadcrumb/Breadcrumb';
import './EditUser.css';
import '../GlobalConfigs/GlobalConfigs.css';
import { FaSpinner } from 'react-icons/fa';
import StyledSelect from '../../Components/StyledSelect/StyledSelect';

const EditUser: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [originalEmail, setOriginalEmail] = useState<string>('');
  const [originalQueueId, setOriginalQueueId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [departments, setDepartments] = useState<{ id: number, name: string }[]>([]);
  const [roles, setRoles] = useState<{ id: number, name: string }[]>([]);
  const [queues, setQueues] = useState<{ id: number, name: string }[]>([]);

  const [emailError, setEmailError] = useState<string>('');
  const [isEmailChecking, setIsEmailChecking] = useState(false);

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

        const userData = userResponse.data;
        setUser(userData);
        setOriginalEmail(userData.email);
        setOriginalQueueId(userData.queues?.[0]?.id || null);

        setDepartments(departmentsResponse.data.data || []);
        setRoles(rolesResponse.data.data || []);
        setQueues(queuesResponse.data.data || []);

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
    if (name === 'email') setEmailError('');
    setUser((prevUser: any) => ({ ...prevUser, [name]: value }));
  };

  const handleDepartmentChange = (selectedOption: any) => {
    setUser((prevUser: any) => ({
      ...prevUser,
      department_id: selectedOption ? selectedOption.value : null,
      department: selectedOption ? { id: selectedOption.value, name: selectedOption.label } : null,
    }));
  };

  const handleRoleChange = (selectedOptions: any) => {
    const roleIds = selectedOptions.map((option: any) => option.value);
    setUser((prevUser: any) => ({
      ...prevUser,
      roles: roleIds,
    }));
  };

  const handleQueuesChange = (selectedOption: any) => {
    setUser((prevUser: any) => ({
      ...prevUser,
      queues: selectedOption ? [{ id: selectedOption.value, name: selectedOption.label }] : [],
    }));
  };

  const handleStatusToggle = () => {
    setUser((prevUser: any) => ({
      ...prevUser,
      is_active: prevUser.is_active ? 0 : 1,
    }));
  };

  const handleEmailBlur = async (): Promise<boolean> => {
    if (!user || user.email === originalEmail) return true;
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(user.email)) {
      setEmailError("Formato de e-mail inválido.");
      return false;
    }

    setIsEmailChecking(true);
    try {
      await api.post('/users/check-email', { email: user.email });
      setEmailError('');
      return true;
    } catch (error: any) {
      if (error.response?.status === 409) {
        setEmailError("Este e-mail já está em uso.");
      } else {
        setEmailError("Não foi possível verificar o e-mail.");
      }
      return false;
    } finally {
      setIsEmailChecking(false);
    }
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const isEmailValid = await handleEmailBlur();
  if (!isEmailValid) {
    toast.error("Por favor, corrija os erros no formulário.");
    return;
  }

  setIsSaving(true);
  try {
    const newQueueId = user.queues?.[0]?.id || null;
    const queueHasChanged = originalQueueId !== newQueueId;
    const { queues, ...userDataToSend } = user;
    const promisesToAwait = [
      api.put(`/users/${id}`, userDataToSend)
    ];
    if (queueHasChanged) {
      if (originalQueueId) {
        promisesToAwait.push(
          api.delete(`/queues/${originalQueueId}/users/${id}`)
        );
      }
      if (newQueueId) {
        promisesToAwait.push(
          api.post(`/queues/${newQueueId}/users`, { user_id: id })
        );
      }
    }
    await Promise.all(promisesToAwait);
    toast.success("Usuário atualizado com sucesso!");
    setOriginalEmail(user.email);
    setOriginalQueueId(newQueueId);
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
    return <div className="loading-container">Carregando dados do usuário...</div>;
  }

  const departmentOptions = departments.map(dep => ({ value: dep.id, label: dep.name }));
  const roleOptions = roles.map(role => ({ value: role.id, label: role.name }));
  const queueOptions = queues.map(queue => ({ value: queue.id, label: queue.name }));

  const selectedQueueValue = queueOptions.find(option => user.queues?.[0] && option.value === user.queues[0].id) || null;
  const selectedRolesValue = roleOptions.filter(option => user.roles?.some((userRole: any) => userRole.id === option.value));

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

            <div className="form-group email-group">
              <label htmlFor="email">E-mail<span className="required-star">*</span></label>
              <input
                id="email"
                name="email"
                type="email"
                value={user.email}
                onChange={handleChange}
                onBlur={handleEmailBlur}
                className={`form-input ${emailError ? 'input-error' : ''}`}
              />
              {isEmailChecking && <FaSpinner className="email-checking-spinner" />}
              {emailError && <span className="error-message">{emailError}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="department_id">Departamento<span className="required-star">*</span></label>
              <StyledSelect
                options={departmentOptions}
                value={departmentOptions.find(option => option.value === user.department?.id) || null}
                onChange={handleDepartmentChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Cargo no Sistema<span className="required-star">*</span></label>
              <StyledSelect
                isMulti
                options={roleOptions}
                value={selectedRolesValue}
                onChange={handleRoleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="queues">Fila<span className="required-star">*</span></label>
              <StyledSelect
                options={queueOptions}
                value={selectedQueueValue}
                onChange={handleQueuesChange}
              />
            </div>

            <div className="switch-container">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={!!user.is_active}
                  onChange={handleStatusToggle}
                />
                <span className="slider"></span>
              </label>
              <span className={`status-label ${user.is_active ? 'active' : 'inactive'}`}>
                {user.is_active ? 'ATIVO' : 'INATIVO'}
              </span>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate('/gerenciar-usuarios')}>Cancelar</button>
            <button
              type="submit"
              className="btn-confirm"
              disabled={isSaving || isEmailChecking || !!emailError}
            >
              {isSaving ? <FaSpinner className="spinner" /> : 'Salvar'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default EditUser;
