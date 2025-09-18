import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Header from '../../Components/Header/Header';
import Breadcrumb from '../../Components/Breadcrumb/Breadcrumb';
import LoadingScreen from '../../Components/LoadingScreen/LoadingScreen';
import './TicketForm.css';
import '../Home/home.css';
import api from '../../resources/api';
import { toast } from 'react-toastify';

interface Service {
  id: number;
  name: string;
}

interface LoggedInUser {
  name: string;
  image_url: string | null;
}

const SelectService: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!categoryId) {
      toast.error("ID da Categoria não especificado.");
      navigate('/novo-chamado');
      return;
    }

    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [meResponse, servicesResponse, categoryResponse] = await Promise.all([
          api.get('/me'),
          api.get(`/categories/${categoryId}/services`),
          api.get(`/categories/${categoryId}`)
        ]);

        setUser(meResponse.data);
        setCategoryName(categoryResponse.data.name || `Categoria ${categoryId}`);
        setServices(Array.isArray(servicesResponse.data) ? servicesResponse.data : []);

      } catch (error) {
        toast.error("Não foi possível carregar os dados desta categoria.");
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [categoryId, navigate]);

  const breadcrumbItems = [
    { label: 'INÍCIO', path: '/inicio' },
    { label: 'NOVO CHAMADO', path: '/novo-chamado' },
    { label: categoryName.toUpperCase(), path: `/novo-chamado/${categoryId}` }
  ];

  if (isLoading || !user) {
    return <LoadingScreen />;
  }

  return (
    <div className="home-container">
      <Header imageUrl={user.image_url} />
      <main className="configs-content">
        <Breadcrumb items={breadcrumbItems} />
        <div className="ticket-flow-header">
          <h2 className='title'>SERVIÇOS DE {categoryName.toUpperCase()}</h2>
          <p className='sub-title'>Agora, escolha o serviço específico que você deseja solicitar.</p>
        </div>
        <section className="action-grid">
          {services.length > 0 ? (
            services.map(service => (
              <Link
                to={`/novo-chamado/${categoryId}/${service.id}`}
                key={service.id}
                className="action-card"
              >
                <h3>{service.name}</h3>
              </Link>
            ))
          ) : (
            <p>Nenhum serviço encontrado para esta categoria.</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default SelectService;
