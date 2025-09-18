import React, { useState, useEffect } from 'react';
import StyledSelect from '../StyledSelect/StyledSelect';
import { FaSpinner, FaTimes } from 'react-icons/fa';
import '../CrudModal/CrudModal.css';

interface Permission {
  value: number;
  label: string;
}

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedPermissions: Permission[]) => Promise<void>;
  allPermissions: Permission[];
  initialSelectedPermissions: Permission[];
  isLoading: boolean;
}

const PermissionsModal: React.FC<PermissionsModalProps> = ({
  isOpen, onClose, onSave, allPermissions, initialSelectedPermissions, isLoading
}) => {
  const [selectedPermissions, setSelectedPermissions] = useState(initialSelectedPermissions);

  useEffect(() => {
    if (isOpen) {
      setSelectedPermissions(initialSelectedPermissions);
    }
  }, [isOpen, initialSelectedPermissions]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Enter') {
        event.preventDefault();
        if (!isLoading && selectedPermissions.length > 0) {
          onSave(selectedPermissions);
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, onSave, selectedPermissions, isLoading]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Adicionar Permissões à Função</h2>
          <button className="modal-close-button" onClick={onClose}><FaTimes /></button>
        </div>
        <div className="modal-body">
          <StyledSelect
            isMulti
            options={allPermissions}
            value={selectedPermissions}
            onChange={(options) => setSelectedPermissions(options as Permission[])}
            placeholder="Selecione as permissões..."
          />
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button
            className="btn-confirm"
            onClick={() => onSave(selectedPermissions)}
            disabled={isLoading || selectedPermissions.length === 0}
          >
            {isLoading ? <FaSpinner className="spinner" /> : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionsModal;
