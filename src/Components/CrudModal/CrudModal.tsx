import React, { useState, useEffect } from 'react';
import './CrudModal.css';
import { FaSpinner, FaTimes } from 'react-icons/fa';

interface CrudItem {
  id: number;
  name: string;
}

interface CrudModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
  title: string;
  isLoading: boolean;
  currentItem?: CrudItem | null;
}

const CrudModal: React.FC<CrudModalProps> = ({ isOpen, onClose, onSave, title, isLoading, currentItem }) => {
  const [itemName, setItemName] = useState('');

  const handleSave = async () => {
    if (isLoading || !itemName.trim()) return;
    await onSave(itemName);
  };

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
  }, [isOpen, onClose, itemName, isLoading]);

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
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                autoFocus
              />
            </div>
          </div>
        </div>
        <div className="modal-footer">
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
