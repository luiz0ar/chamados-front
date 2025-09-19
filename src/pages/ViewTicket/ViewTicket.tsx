import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../resources/api';
import './ViewTicket.css';
import Header from '../../Components/Header/Header';
import Breadcrumb from '../../Components/Breadcrumb/Breadcrumb';
import LoadingScreen from '../../Components/LoadingScreen/LoadingScreen';
import { FaPaperclip } from 'react-icons/fa';

interface TicketDetails {
  id: number;
  description: string;
  priority: number;
  created_by: number;
  assigned_to: number;
  states_id: number;
  attachments?: { id: number; url: string; file_name: string }[];
}

interface LookupItem {
  id: number;
  name: string;
}

const ViewTicket: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [user, setUser] = useState<any>(null); // Usuário logado
  const [allUsers, setAllUsers] = useState<LookupItem[]>([]);
  const [priorities, setPriorities] = useState<LookupItem[]>([]);
  const [states, setStates] = useState<LookupItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchTicketData = async () => {
      setIsLoading(true);
      try {
        const [
          ticketResponse,
          meResponse,
          usersResponse,
          prioritiesResponse,
          statesResponse
        ] = await Promise.all([
          api.get(`/tickets/${id}`),
          api.get('/me'),
          api.get('/users'),
          api.get('/priorities'),
          api.get('/states')
        ]);

        setTicket(ticketResponse.data);
        setUser(meResponse.data);
        setAllUsers(usersResponse.data.data || usersResponse.data || []);
        setPriorities(prioritiesResponse.data || []);
        setStates(statesResponse.data || []);

      } catch (err) {
        setError('Não foi possível carregar os detalhes do chamado.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicketData();
  }, [id]);

  const usersMap = useMemo(() => new Map(allUsers.map(u => [u.id, u.name])), [allUsers]);
  const prioritiesMap = useMemo(() => new Map(priorities.map(p => [p.id, p.name])), [priorities]);
  const statesMap = useMemo(() => new Map(states.map(s => [s.id, s.name])), [states]);

  if (isLoading || !user) {
    return <LoadingScreen />;
  }

  if (error || !ticket) {
    return <div>{error || 'Chamado não encontrado.'}</div>;
  }

  const breadcrumbItems = [
    { label: 'INÍCIO', path: '/inicio' },
    { label: `MEU CHAMADO Nº${ticket.id}`, path: `/tickets/${ticket.id}` }
  ];

  return (
    <div className="view-ticket-container">
      <Header imageUrl={user.image_url} />
      <main className="view-ticket-content">
        <Breadcrumb items={breadcrumbItems} />

        <div className="ticket-layout">
          <section className="ticket-main">
            <div className="ticket-panel description-panel">
              <h3>Descrição</h3>
              <p>{ticket.description}</p>
            </div>

            <div className="ticket-info-pills">
              <div className="info-pill">
                <span className="pill-label">Prioridade</span>
                <span className="pill-value">{prioritiesMap.get(ticket.priority)}</span>
              </div>
              <div className="info-pill">
                <span className="pill-label">Status</span>
                <span className="pill-value">{statesMap.get(ticket.states_id) || 'N/A'}</span>
              </div>
              <div className="info-pill">
                <span className="pill-label">Solicitante</span>
                <span className="pill-value">{usersMap.get(ticket.created_by)}</span>
              </div>
              <div className="info-pill">
                <span className="pill-label">Assumido por</span>
                <span className="pill-value">{usersMap.get(ticket.assigned_to) || 'AGUARDANDO ATENDIMENTO'}</span>
              </div>
            </div>
          </section>

          {ticket.attachments && ticket.attachments.length > 0 && (
            <section className="ticket-panel attachments-panel">
              <h3>Anexos</h3>
              <ul className="attachment-list">
                {ticket.attachments.map(file => (
                  <li key={file.id}>
                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="attachment-item">
                      <FaPaperclip />
                      <span>{file.file_name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default ViewTicket;
