import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../Components/Header/Header';
import Breadcrumb from '../../Components/Breadcrumb/Breadcrumb';
import LoadingScreen from '../../Components/LoadingScreen/LoadingScreen';
import StyledSelect from '../../Components/StyledSelect/StyledSelect';
import { FaPaperclip, FaSpinner, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../resources/api';
import './TicketForm.css';
import '../EditUser/EditUser.css';

interface ServiceDetails {
  id: number;
  name: string;
  slas_id: number;
  priority_id: number;
  queue_id: number;
  form_of_request_id: number;
  sla_limited: boolean;
}
interface LoggedInUser {
  id: number;
  name: string;
  image_url: string | null;
  department_id: number;
}
interface Priority {
  id: number;
  name: string;
}


const TicketForm: React.FC = () => {
  const { categoryId, serviceId } = useParams<{ categoryId: string, serviceId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [service, setService] = useState<ServiceDetails | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    priority: 1,
  });

  useEffect(() => {
    const fetchPageData = async () => {
      setIsLoading(true);
      try {
        const [meRes, serviceRes, categoryRes, prioritiesRes] = await Promise.all([
          api.get('/me'),
          api.get(`/services/${serviceId}`),
          api.get(`/categories/${categoryId}`),
          api.get('/priorities'),
        ]);

        const serviceData: ServiceDetails = serviceRes.data;
        setUser(meRes.data);
        setService(serviceData);
        setCategoryName(categoryRes.data.name);
        setPriorities(prioritiesRes.data || []);
        setFormData(prev => ({ ...prev, priority: serviceData.priority_id || 1 }));

      } catch (error) {
        toast.error("Não foi possível carregar os dados para este chamado.");
        navigate('/novo-chamado');
      } finally {
        setIsLoading(false);
      }
    };

    if (serviceId && categoryId) {
      fetchPageData();
    }
  }, [serviceId, categoryId, navigate]);

  const handleFormChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePriorityChange = (selectedOption: any) => {
    setFormData(prev => ({ ...prev, priority: selectedOption ? selectedOption.value : 1 }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeAttachment = (fileToRemove: File) => {
    setAttachments(prev => prev.filter(file => file !== fileToRemove));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!formData.description.trim()) {
    toast.error("Por favor, preencha a descrição.");
    return;
  }
  if (!user || !service) {
    toast.error("Dados do usuário ou serviço não carregados. Tente novamente.");
    return;
  }

  setIsSaving(true);

  const ticketPayload = {
    states_id: 1,
    services_id: service.id,
    created_by: user.id,
    departament_id: user.department_id,
    slas_id: 1,
    priority: formData.priority,
    queue_id: 1,
    form_of_request_id: 1,
    sla_limited: true,
    description: formData.description,
  };

  const dataToSubmit = new FormData();
  Object.entries(ticketPayload).forEach(([key, value]) => {
    dataToSubmit.append(key, String(value));
  });

  attachments.forEach(file => {
    dataToSubmit.append('attachments[]', file);
  });

  try {
    await api.post('/tickets', dataToSubmit, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    toast.success("Chamado aberto com sucesso!");
    navigate('/gestao-chamados');
  } catch (error) {
    console.error("Erro ao abrir chamado:", error);
    toast.error("Não foi possível abrir o chamado. Verifique o console para mais detalhes.");
  } finally {
    setIsSaving(false);
  }
};

  const breadcrumbItems = [
    { label: 'INÍCIO', path: '/inicio' },
    { label: 'NOVO CHAMADO', path: '/novo-chamado' },
    { label: categoryName.toUpperCase(), path: `/novo-chamado/${categoryId}` },
    { label: service?.name.toUpperCase() || '', path: `/novo-chamado/${categoryId}/${serviceId}` },
  ];

  if (isLoading) {
    return <LoadingScreen />;
  }

  const priorityOptions = priorities.map(p => ({ value: p.id, label: p.name }));
  const selectedPriority = priorityOptions.find(p => p.value === formData.priority) || null;

  return (
    <div className="home-container">
      <Header imageUrl={user?.image_url} />
      <main className="configs-content">
        <Breadcrumb items={breadcrumbItems} />
        <form className="edit-user-form" onSubmit={handleSubmit}>
          <div className="ticket-flow-header">
            <h2 className='title'>ABRIR CHAMADO: {service?.name.toUpperCase()}</h2>
            <p className='sub-title'>Preencha os detalhes abaixo para criar sua solicitação.</p>
          </div>
          <div className="form-grid-single-col">
            <div className="form-group">
              <label htmlFor="priority">Prioridade<span className="required-star">*</span></label>
              <StyledSelect
                options={priorityOptions}
                value={selectedPriority}
                onChange={handlePriorityChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Descrição<span className="required-star">*</span></label>
              <textarea
                id="description"
                name="description"
                rows={8}
                className="form-input"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Descreva detalhadamente sua necessidade ou problema..."
              />
            </div>
            <div className="form-group">
              <label>Anexos</label>
              <div className="attachment-area">
                <label htmlFor="file-upload" className="attachment-button">
                  <FaPaperclip /> Escolher arquivo(s)
                </label>
                <input id="file-upload" type="file" multiple onChange={handleFileChange} />
                <div className="attachment-list">
                  {attachments.map((file, index) => (
                    <div key={index} className="attachment-tag">
                      {file.name}
                      <button type="button" className="remove-attachment-btn" onClick={() => removeAttachment(file)}>
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>Cancelar</button>
            <button type="submit" className="btn-confirm" disabled={isSaving}>
              {isSaving ? <FaSpinner className="spinner" /> : 'Solicitar'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default TicketForm;
