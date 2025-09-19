import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import './MyTicketsWidget.css';
import { Tooltip } from 'react-tooltip';

interface MyTicket {
  id: number;
  services_id: number;
  description: string;
}
interface Service {
  id: number;
  name: string;
}
interface Props {
  tickets: MyTicket[];
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
        <h3>Minhas Solicitações</h3>
        <span className="assigned-ticket-count-badge">{tickets.length}</span>
      </header>
      <div className="assigned-widget-content">
        <ul className="assigned-ticket-list">
          {tickets.map(ticket => (
            <li
              key={ticket.id}
              data-tooltip-id="ticket-description-tooltip"
              data-tooltip-content={`Descrição: ${ticket.description}`}
            >
              <Link to={`/chamado/${ticket.id}`} className="assigned-ticket-item">
                <span className="assigned-ticket-info">
                  <span className="assigned-ticket-id">Nº{ticket.id}</span>
                  <span className="assigned-ticket-service">
                    {servicesMap.get(ticket.services_id) || 'Serviço não encontrado'}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <Tooltip
        id="ticket-description-tooltip"
        place="left"
        style={{textSizeAdjust: '30px', maxWidth: '300px', zIndex: 9999 }}
      />
    </aside>
  );
};

export default MyTicketsWidget;
