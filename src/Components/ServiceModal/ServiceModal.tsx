import React, { useState, useEffect } from 'react';
import StyledSelect from '../StyledSelect/StyledSelect';
import { FaSpinner, FaTimes } from 'react-icons/fa';
import '../ServiceModal/ServiceModal.css';

interface Service {
  value: number;
  label: string;
}

interface ServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedServices: Service[]) => Promise<void>;
  allServices: Service[];
  initialSelectedServices: Service[];
  isLoading: boolean;
}

const ServicesModal: React.FC<ServicesModalProps> = ({
  isOpen, onClose, onSave, allServices, initialSelectedServices, isLoading
}) => {
  const [selectedServices, setSelectedServices] = useState(initialSelectedServices);

  useEffect(() => {
    setSelectedServices(initialSelectedServices);
  }, [initialSelectedServices]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        if (!isLoading) {
          onSave(selectedServices);
        }
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, onSave, selectedServices, isLoading]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Associar Serviços à Fila</h2>
          <button className="modal-close-button" onClick={onClose}><FaTimes /></button>
        </div>
        <div className="modal-body">
          <StyledSelect
            isMulti
            options={allServices}
            value={selectedServices}
            onChange={(options) => setSelectedServices(options as Service[])}
            placeholder="Selecione os serviços..."
          />
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-confirm" onClick={() => onSave(selectedServices)} disabled={isLoading}>
            {isLoading ? <FaSpinner className="spinner" /> : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServicesModal;
