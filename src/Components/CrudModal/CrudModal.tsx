import React, { useState, useEffect } from 'react';
import './CrudModal.css';
import { FaSpinner, FaTimes, FaCog } from 'react-icons/fa';

interface CrudItem {
  id: number;
  name: string;
  time_limit?: number;
}

interface SaveData {
  name: string;
  time_limit?: number;
}

interface CrudModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SaveData) => Promise<any>;
  title: string;
  isLoading: boolean;
  currentItem?: CrudItem | null;
  showServicesButton?: boolean;
  onServicesClick?: () => void;
  showTimeLimitField?: boolean;
}

const CrudModal: React.FC<CrudModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
  isLoading,
  currentItem,
  showServicesButton = false,
  onServicesClick,
  showTimeLimitField = false
}) => {
  const [formData, setFormData] = useState({ name: '', time_limit: '' });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: currentItem?.name || '',
        time_limit: String(currentItem?.time_limit || '')
      });
    }
  }, [isOpen, currentItem]);

  const handleSave = async () => {
    if (isLoading || !formData.name.trim() || (showTimeLimitField && !formData.time_limit)) return;

    const dataToSave: SaveData = { name: formData.name };
    if (showTimeLimitField) {
      dataToSave.time_limit = Number(formData.time_limit);
    }
    await onSave(dataToSave);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Enter') {
        event.preventDefault();
        handleSave();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, formData, isLoading, onSave]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) {
    return null;
  }

  const isSaveDisabled = isLoading || !formData.name.trim() || (showTimeLimitField && !formData.time_limit.toString().trim());

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close-button" onClick={onClose}><FaTimes /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Nome</label>
            <input
              type="text"
              name="name"
              className="login-input"
              placeholder="Nome do item"
              value={formData.name.toUpperCase()}
              onChange={handleChange}
              autoFocus
            />
          </div>

          {showTimeLimitField && (
            <div className="form-group">
              <label>Limite de Tempo (em minutos)</label>
              <input
                type="number"
                name="time_limit"
                className="login-input"
                placeholder="Ex: 60"
                value={formData.time_limit}
                onChange={handleChange}
              />
            </div>
          )}
        </div>
        <div className="modal-footer">
          {showServicesButton && (
            <button className="btn-secondary services-button" onClick={onServicesClick}>
              <FaCog /> Serviços
            </button>
          )}
          <div style={{ flex: 1 }}></div>
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-confirm" onClick={handleSave} disabled={isSaveDisabled}>
            {isLoading ? <FaSpinner className="spinner" /> : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrudModal;
