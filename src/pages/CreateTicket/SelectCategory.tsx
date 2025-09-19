import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../Components/Header/Header';
import Breadcrumb from '../../Components/Breadcrumb/Breadcrumb';
import LoadingScreen from '../../Components/LoadingScreen/LoadingScreen';
import Pagination from '../../Components/Pagination/Pagination';
import './TicketForm.css';
import '../Home/home.css';
import api from '../../resources/api';
import { toast } from 'react-toastify';

interface Category {
  category_id: number;
  category_name: string;
  total: number;
}
interface LoggedInUser {
  name: string;
  image_url: string | null;
}

const SelectCategory: React.FC = () => {
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const fetchCategories = async (page: number) => {
    setIsPageLoading(true);
    try {
      const response = await api.get(`/categories/group-by?page=${page}&limit=12`);
      const responseData = response.data;

      setCategories(responseData.data || []);
      setCurrentPage(responseData.page || 1);

      const totalItems = responseData.total || 0;
      const limit = responseData.limit || 12;
      setTotalPages(Math.ceil(totalItems / limit));

    } catch (error) {
      toast.error("Não foi possível carregar as categorias.");
    } finally {
      setIsPageLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const meResponse = await api.get('/me');
        setUser(meResponse.data);
        await fetchCategories(1);
      } catch (error) {
        toast.error("Não foi possível carregar os dados. Verifique sua sessão.");
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [navigate]);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      fetchCategories(page);
    }
  };

  const breadcrumbItems = [
    { label: 'INÍCIO', path: '/inicio' },
    { label: 'NOVO CHAMADO', path: '/novo-chamado' }
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
          <h2 className='title'>CATEGORIAS</h2>
          <p className='sub-title'>Para começar, selecione a categoria do serviço que você precisa.</p>
        </div>

        <section className="action-grid">
          {isPageLoading ? (
            <LoadingScreen />
          ) : (
            categories.map(category => (
              <Link to={`/novo-chamado/${category.category_id}`} key={category.category_id} className="action-card">
                <h3>{category.category_name}</h3>
              </Link>
            ))
          )}
        </section>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isLoading={isPageLoading}
          />
        )}
      </main>
    </div>
  );
};

export default SelectCategory;
