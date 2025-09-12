import React, { useState, useEffect } from 'react';
import './CrudModal.css';
import { FaSpinner, FaTimes, FaCog } from 'react-icons/fa';

interface CrudItem {
  id: number;
  name: string;
}

interface CrudModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<any>;
  title: string;
  isLoading: boolean;
  currentItem?: CrudItem | null;
  showServicesButton?: boolean;
  onServicesClick?: () => void;
}

const CrudModal: React.FC<CrudModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
  isLoading,
  currentItem,
  showServicesButton = false,
  onServicesClick
}) => {
  const [itemName, setItemName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setItemName(currentItem?.name || '');
    }
  }, [isOpen, currentItem]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
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
  }, [isOpen, onClose, itemName, isLoading, onSave]);

  const handleSave = async () => {
    if (isLoading || !itemName.trim()) return;
    await onSave(itemName);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close-button" onClick={onClose}><FaTimes /></button>
        </div>
        <div className="modal-body">
          <div className="input-group">
            <div className="input-wrapper">
              <input
                type="text"
                className="login-input"
                placeholder="Nome do item"
                value={itemName.toUpperCase()}
                onChange={(e) => setItemName(e.target.value)}
                autoFocus
              />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          {showServicesButton && (
            <button className="btn-services-button" onClick={onServicesClick}>
              <FaCog /> Serviços
            </button>
          )}
          <div style={{ flex: 1 }}></div>
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-confirm" onClick={handleSave} disabled={isLoading || !itemName.trim()}>
            {isLoading ? <FaSpinner className="spinner" /> : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrudModal;
