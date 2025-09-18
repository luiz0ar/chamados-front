import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import './MyTicketsWidget.css';
import { FaEye } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';

interface AssignedTicket {
  id: number;
  services_id: number;
}

interface Service {
  id: number;
  name: string;
}

interface Props {
  tickets: AssignedTicket[];
  services: Service[];
}

const MyTicketsWidget: React.FC<Props> = ({ tickets, services }) => {
  const servicesMap = useMemo(() =>
    new Map(services.map(service => [service.id, service.name])),
    [services]
  );

  return (
    <aside className="assigned-tickets-widget">
      <header className="assigned-widget-header">
        <h3>Aguardando Atendimento</h3>
        <span className="assigned-ticket-count-badge">{tickets.length}</span>
      </header>
      <div className="assigned-widget-content">
        <ul className="assigned-ticket-list">
          {tickets.map(ticket => (
            <li key={ticket.id}>
              <Link to={`/tickets/${ticket.id}`} className="assigned-ticket-item">
                <span className="assigned-ticket-info">
                  <span className="assigned-ticket-id">#{ticket.id}</span>
                  <span className="assigned-ticket-service">
                    {servicesMap.get(ticket.services_id) || 'Serviço não encontrado'}
                  </span>
                </span>
                <FaEye className="assigned-ticket-view-icon" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default MyTicketsWidget;
