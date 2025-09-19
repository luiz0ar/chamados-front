import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Tooltip } from 'react-tooltip';
import api from '../../resources/api';
import Header from '../../Components/Header/Header';
import Breadcrumb from '../../Components/Breadcrumb/Breadcrumb';
import { FaSearch, FaPlus, FaArrowRight, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import LoadingScreen from '../../Components/LoadingScreen/LoadingScreen';
import PriorityBadge from '../../Components/PriorityBadge/PriorityBadge';
import TicketDetailsModal from '../../Components/TicketDetailsModal/TicketDetailsModal';
import './TicketManagement.css';
import '../GlobalConfigs/GlobalConfigs.css';

interface LookupItem {
  id: number;
  name: string;
}
interface TicketSummary {
  id: number;
  states_id: number;
  services_id: number;
  created_by: number;
  priority: number;
  created_at: string;
  assigned_to?: number | null;
}
interface UserDetails {
  id: number;
  name: string;
  department: {
    id: number;
    name: string;
  };
}

interface FullTicketDetails {
  id: number;
  description: string;
  user?: UserDetails;
}

type TicketFilterType = 'all' | 'open' | 'in_queue';
type SortKey = keyof TicketSummary;

const TicketManagement: React.FC = () => {
  const [kpiData, setKpiData] = useState({ abertos: 0, na_fila: 0 });
  const [user, setUser] = useState<any>(null);
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<TicketFilterType>('in_queue');
  const navigate = useNavigate();
  const [isTicketsLoading, setIsTicketsLoading] = useState(false);
  const [priorities, setPriorities] = useState<LookupItem[]>([]);
  const [states, setStates] = useState<LookupItem[]>([]);
  const [allUsers, setAllUsers] = useState<LookupItem[]>([]);
  const [services, setServices] = useState<LookupItem[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<FullTicketDetails | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRowTooltipVisible, setIsRowTooltipVisible] = useState(false);

  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({
    key: 'id',
    direction: 'desc'
  });

  const fetchTicketsByFilter = async (filter: TicketFilterType) => {
    setActiveFilter(filter);
    setIsTicketsLoading(true);
    let endpoint = '/tickets';
    if (filter === 'in_queue') endpoint = '/my-tickets';
    if (filter === 'open') endpoint = '/my-assigned-tickets';

    try {
      const response = await api.get(endpoint);
      let ticketsData = response.data.data || response.data || [];

      if (filter === 'in_queue') {
        ticketsData = ticketsData.filter((ticket: TicketSummary) => ticket.assigned_to === null);
      }

      setTickets(ticketsData);
    } catch (error) {
      toast.error("Não foi possível carregar os chamados.");
    } finally {
      setIsTicketsLoading(false);
    }
  };

  useEffect(() => {
    const fetchPageData = async () => {
      setIsLoading(true);
      try {
        const [meResponse, myTicketsResponse, openTicketsResponse, prioritiesResponse, statesResponse, servicesResponse, usersResponse] = await Promise.all([
          api.get('/me'),
          api.get('/my-tickets'),
          api.get('/my-assigned-tickets'),
          api.get('/priorities'),
          api.get('/states'),
          api.get('/services'),
          api.get('/users')
        ]);

        setUser(meResponse.data);
        const openTickets = openTicketsResponse.data.data || openTicketsResponse.data || [];
        const allMyTickets = myTicketsResponse.data.data || myTicketsResponse.data || [];
        const unassignedTickets = allMyTickets.filter((ticket: TicketSummary) => ticket.assigned_to === null);

        setTickets(unassignedTickets);

        setKpiData({
          abertos: openTickets.length,
          na_fila: unassignedTickets.length
        });
        setPriorities(prioritiesResponse.data || []);
        setStates(statesResponse.data || []);
        setServices(servicesResponse.data.data || servicesResponse.data || []);
        setAllUsers(usersResponse.data.data || usersResponse.data || []);

      } catch (error) {
        toast.error("Não foi possível carregar os dados. Verifique sua sessão.");
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPageData();
  }, [navigate]);

  const findNameById = useCallback((list: LookupItem[], id: number) => {
    const item = list.find(p => p.id === id);
    return item ? item.name : 'N/A';
  }, []);

  const handleViewDetails = async (ticket: TicketSummary) => {
    setIsDetailsModalOpen(true);
    setIsDetailsLoading(true);
    setSelectedTicket({ id: ticket.id, description: 'Carregando...' });
    try {
      const [ticketDetailsResponse, userDetailsResponse] = await Promise.all([
        api.get(`/tickets/${ticket.id}`),
        api.get(`/users/${ticket.created_by}`)
      ]);
      const ticketData = ticketDetailsResponse.data;
      const userData = userDetailsResponse.data;
      const fullTicketDetails: FullTicketDetails = { ...ticketData, user: userData };
      setSelectedTicket(fullTicketDetails);
    } catch (error) {
      toast.error("Não foi possível carregar os detalhes do chamado.");
      setIsDetailsModalOpen(false);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const handleAssignTicket = async (ticketId: number) => {
    if (!user?.id) {
      toast.error("Não foi possível identificar o seu usuário. Por favor, recarregue a página.");
      return;
    }
    try {
      await api.put(`/tickets/${ticketId}/assign`, { assigned_to: user.id });
      toast.success(`Chamado #${ticketId} assumido com sucesso!`);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      toast.error(`Não foi possível assumir o chamado #${ticketId}.`);
    }
  };

  const handleCloseModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedTicket(null);
  };

  const requestSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const processedTickets = useMemo(() => {
    let sortableTickets = [...tickets];

    sortableTickets.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortConfig.key) {
        case 'priority':
          aValue = findNameById(priorities, a.priority);
          bValue = findNameById(priorities, b.priority);
          break;
        case 'states_id':
          aValue = findNameById(states, a.states_id);
          bValue = findNameById(states, b.states_id);
          break;
        case 'services_id':
          aValue = findNameById(services, a.services_id);
          bValue = findNameById(services, b.services_id);
          break;
        case 'created_by':
          aValue = findNameById(allUsers, a.created_by);
          bValue = findNameById(allUsers, b.created_by);
          break;
        default:
          aValue = a[sortConfig.key]!;
          bValue = b[sortConfig.key]!;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    if (!searchTerm) return sortableTickets;

    const lowercasedFilter = searchTerm.toLowerCase();
    return sortableTickets.filter(ticket => {
      const priorityName = findNameById(priorities, ticket.priority).toLowerCase();
      const stateName = findNameById(states, ticket.states_id).toLowerCase();
      const serviceName = findNameById(services, ticket.services_id).toLowerCase();
      const requesterName = findNameById(allUsers, ticket.created_by).toLowerCase();

      return (
        String(ticket.id).includes(lowercasedFilter) ||
        priorityName.includes(lowercasedFilter) ||
        stateName.includes(lowercasedFilter) ||
        serviceName.includes(lowercasedFilter) ||
        requesterName.includes(lowercasedFilter)
      );
    });
  }, [tickets, searchTerm, sortConfig, priorities, states, services, allUsers, findNameById]);

  const getSortIcon = (key: SortKey) => {
    if (sortConfig.key !== key) {
      return <FaSort className="sort-icon" />;
    }
    return sortConfig.direction === 'asc' ? <FaSortUp className="sort-icon active" /> : <FaSortDown className="sort-icon active" />;
  };

  const breadcrumbItems = [{ label: 'INÍCIO', path: '/inicio' }, { label: 'GESTÃO DE CHAMADOS', path: '/gestao-chamados' }];

  if (isLoading || !user) { return <LoadingScreen />; }

  return (
    <div className="home-container">
      <Header imageUrl={user?.image_url} />
      <main className="configs-content">
        <Breadcrumb items={breadcrumbItems} />
        <section className="kpi-grid">
          <div className={`kpi-card ${activeFilter === 'open' ? 'active' : ''}`} onClick={() => fetchTicketsByFilter('open')}>
            <div className="value">{kpiData.abertos}</div>
            <div className="label">Abertos</div>
          </div>
          <div className={`kpi-card ${activeFilter === 'in_queue' ? 'active' : ''}`} onClick={() => fetchTicketsByFilter('in_queue')}>
            <div className="value">{kpiData.na_fila}</div>
            <div className="label">Na Fila</div>
          </div>
        </section>
        <section className="crud-area">
          <div className="toolbar">
            <div className="filters">
              <div className="search-container-configs">
                <FaSearch className="search-icon-configs" />
                <input type="text" placeholder="Pesquisar..." className="search-input-configs" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
            <button className="add-button" onClick={() => navigate('/novo-chamado')}>
              <FaPlus /> ABRIR CHAMADO
            </button>
          </div>
          <div className="table-container">
            <table className="data-table ticket-table">
              <thead>
                <tr>
                  <th style={{ width: '100px', textAlign: 'center' }}>Ações</th>
                  <th className="sortable-header" onClick={() => requestSort('id')}>
                    Nº Chamado {getSortIcon('id')}
                  </th>
                  <th className="sortable-header" onClick={() => requestSort('priority')}>
                    Prioridade {getSortIcon('priority')}
                  </th>
                  <th className="sortable-header" onClick={() => requestSort('states_id')}>
                    Estado {getSortIcon('states_id')}
                  </th>
                  <th className="sortable-header" onClick={() => requestSort('services_id')}>
                    Serviço {getSortIcon('services_id')}
                  </th>
                  <th className="sortable-header" onClick={() => requestSort('created_by')}>
                    Solicitante {getSortIcon('created_by')}
                  </th>
                  <th className="sortable-header" onClick={() => requestSort('created_at')}>
                    Data de Abertura {getSortIcon('created_at')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {isTicketsLoading ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center' }}><LoadingScreen /></td></tr>
                ) : (
                  processedTickets.map(ticket => (
                    <tr
                      key={ticket.id}
                      onClick={() => handleViewDetails(ticket)}
                      onMouseEnter={() => setIsRowTooltipVisible(true)}
                      onMouseLeave={() => setIsRowTooltipVisible(false)}
                      data-tooltip-id={isRowTooltipVisible ? "details-tooltip" : ""}
                    >
                      <td>
                        <div className="actions-cell">
                          <button
                            className="action-button assign"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAssignTicket(ticket.id);
                            }}
                            onMouseEnter={() => setIsRowTooltipVisible(false)}
                            onMouseLeave={() => setIsRowTooltipVisible(true)}
                            data-tooltip-id="assign-tooltip"
                            data-tooltip-content="Assumir Chamado"
                          >
                            <FaArrowRight />
                          </button>
                        </div>
                      </td>
                      <td>{ticket.id}</td>
                      <td><PriorityBadge priorityName={findNameById(priorities, ticket.priority)} /></td>
                      <td>{findNameById(states, ticket.states_id)}</td>
                      <td>{findNameById(services, ticket.services_id)}</td>
                      <td>{findNameById(allUsers, ticket.created_by)}</td>
                      <td>{new Date(ticket.created_at).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <Tooltip id="details-tooltip" content="Visualizar detalhes do chamado" />
      <Tooltip id="assign-tooltip" />
      <TicketDetailsModal isOpen={isDetailsModalOpen} onClose={handleCloseModal} ticket={selectedTicket} isLoading={isDetailsLoading} />
    </div>
  );
};

export default TicketManagement;
