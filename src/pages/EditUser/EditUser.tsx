import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../resources/mock';
import Header from '../../Components/Header/Header';
import Breadcrumb from '../../Components/Breadcrumb/Breadcrumb';
import './EditUser.css';
import { FaSpinner } from 'react-icons/fa';
import StyledSelect from '../../Components/StyledSelect/StyledSelect';

const mockDepartments = [
  { id: 1, name: 'RH' },
  { id: 2, name: 'TI' },
  { id: 3, name: 'COMERCIAL' },
  { id: 4, name: 'FINANCEIRO' },
];
const mockRoles = [
  { id: 1, name: 'ADMIN' },
  { id: 2, name: 'USER' },
];
const mockQueues = [
    { id: 1, name: 'SISTEMAS' },
    { id: 2, name: 'AX' },
    { id: 3, name: 'AGROTOPUS' },
];

const EditUser: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [originalEmail, setOriginalEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [emailError, setEmailError] = useState<string>('');
  const [isEmailChecking, setIsEmailChecking] = useState(false);

  useEffect(() => {
    if (!id) {
      toast.error("ID de usuário não encontrado.");
      navigate('/gerenciar-usuarios');
      return;
    }

    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/users/${id}`);
        setUser(response.data);
        setOriginalEmail(response.data.email);
      } catch (error) {
        toast.error("Não foi possível carregar os dados do usuário.");
        navigate('/gerenciar-usuarios');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'email') {
      setEmailError('');
    }
    setUser((prevUser: any) => ({ ...prevUser, [name]: value }));
  };

  const handleDepartmentChange = (selectedOption: any) => {
    setUser((prevUser: any) => ({
      ...prevUser,
      department_id: selectedOption.value,
      department: { id: selectedOption.value, name: selectedOption.label },
    }));
  };

  const handleRoleChange = (selectedOption: any) => {
    setUser((prevUser: any) => ({
      ...prevUser,
      roles: [{ id: selectedOption.value, name: selectedOption.label }],
    }));
  };
  
  const handleQueuesChange = (selectedOptions: any) => {
    setUser((prevUser: any) => ({
      ...prevUser,
      queues: selectedOptions.map((opt: any) => ({ id: opt.value, name: opt.label })),
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
      await api.put(`/users/${id}`, user);
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
    { label: 'EDITAR USUÁRIO', path: `/gerenciar-usuarios/editar/${id}` }
  ];

  if (isLoading || !user) {
    return <div className="loading-container">Carregando dados do usuário...</div>;
  }

  return (
    <div className="home-container">
      <Header userName={user.name} imageUrl={user.image_url} />
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
                options={mockDepartments.map(dep => ({ value: dep.id, label: dep.name }))}
                value={user.department ? { value: user.department.id, label: user.department.name } : null}
                onChange={handleDepartmentChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="role">Cargo (Perfil)<span className="required-star">*</span></label>
              <StyledSelect
                options={mockRoles.map(role => ({ value: role.id, label: role.name }))}
                value={user.roles && user.roles[0] ? { value: user.roles[0].id, label: user.roles[0].name } : null}
                onChange={handleRoleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="queues">Filas<span className="required-star">*</span></label>
              <StyledSelect
                isMulti
                options={mockQueues.map(queue => ({ value: queue.id, label: queue.name }))}
                value={user.queues ? user.queues.map((q: any) => ({ value: q.id, label: q.name })) : []}
                onChange={handleQueuesChange}
              />
            </div>

            <div className="form-group">
              <label>Status</label>
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