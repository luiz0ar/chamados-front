import React from 'react';
import { FaTimes, FaSpinner } from 'react-icons/fa';
import './TicketDetailsModal.css';

interface TicketDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: any;
  isLoading: boolean;
}


const TicketDetailsModal: React.FC<TicketDetailsModalProps> = ({ isOpen, onClose, ticket, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Detalhes Chamado #{ticket?.id}</h2>
          <button className="modal-close-button" onClick={onClose}><FaTimes /></button>
        </div>
        <div className="modal-body">
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <FaSpinner className="spinner" />
            </div>
          ) : (
            <div className="details-grid">
              <div className="detail-item">
                <span className="label">Solicitante</span>
                <span className="value">{ticket?.user?.name || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Setor</span>
                <span className="value">{ticket?.user?.department?.name || 'N/A'}</span>
              </div>
              <div className="detail-item detail-description">
                <span className="label">Descrição</span>
                <p className="value">{ticket.description || 'Nenhuma descrição fornecida.'}</p>
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsModal;
