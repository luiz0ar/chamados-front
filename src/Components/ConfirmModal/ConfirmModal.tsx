import React, { useEffect } from 'react';
import './ConfirmModal.css';
import { FaSpinner } from 'react-icons/fa';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
  isLoading: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, title, message, isLoading }) => {

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        if (!isLoading) {
          onConfirm();
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, onConfirm, isLoading]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={isLoading}>
            Cancelar
          </button>
          <button className="btn-confirm" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? <FaSpinner className="spinner" /> : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
