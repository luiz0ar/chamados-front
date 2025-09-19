import React, { useState, useEffect, useMemo } from 'react';
import { FaSpinner, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../resources/api';
import StyledSelect from '../StyledSelect/StyledSelect';
import type { SingleValue } from 'react-select';
import './CrudModal.css';

interface CrudItem {
  id: number;
  name: string;
  time_limit?: number;
  priority_id?: number;
}
interface SaveData {
  name: string;
  time_limit?: number;
  priority_id?: number;
}
interface Priority {
  id: number;
  name: string;
}
type SelectOption = {
  value: number;
  label: string;
};


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
  showTimeLimitField = false
}) => {
  const [formData, setFormData] = useState({ name: '', time_limit: '', priority_id: '' });
  const [priorities, setPriorities] = useState<Priority[]>([]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: currentItem?.name || '',
        time_limit: String(currentItem?.time_limit || ''),
        priority_id: String(currentItem?.priority_id || '')
      });
    }
  }, [isOpen, currentItem]);

  useEffect(() => {
    const fetchPriorities = async () => {
      try {
        const response = await api.get('/priorities');
        setPriorities(response.data || []);
      } catch (error) {
        toast.error('Não foi possível carregar as prioridades.');
      }
    };

    if (isOpen && showTimeLimitField) {
      fetchPriorities();
    }
  }, [isOpen, showTimeLimitField]);


  const handleSave = async () => {
    if (isLoading || !formData.name.trim() || (showTimeLimitField && (!formData.time_limit || !formData.priority_id))) {
      toast.warn('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const dataToSave: SaveData = { name: formData.name };
    if (showTimeLimitField) {
      dataToSave.time_limit = Number(formData.time_limit);
      dataToSave.priority_id = Number(formData.priority_id);
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
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, formData, isLoading, handleSave]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePriorityChange = (selectedOption: SingleValue<SelectOption>) => {
    setFormData(prev => ({
      ...prev,
      priority_id: selectedOption ? String(selectedOption.value) : ''
    }));
  };

  const priorityOptions = useMemo(() => priorities.map(p => ({
    value: p.id,
    label: p.name
  })), [priorities]);

  const selectedPriority = useMemo(() =>
    priorityOptions.find(option => option.value === Number(formData.priority_id)) || null,
    [formData.priority_id, priorityOptions]
  );


  if (!isOpen) {
    return null;
  }

  const isSaveDisabled = isLoading || !formData.name.trim() || (showTimeLimitField && (!formData.time_limit.toString().trim() || !formData.priority_id));

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
              onChange={handleInputChange}
              autoFocus
            />
          </div>

          {showTimeLimitField && (
            <>
              <div className="form-group">
                <label>Limite de Tempo (em minutos)</label>
                <input
                  type="number"
                  name="time_limit"
                  className="login-input"
                  placeholder="Ex: 60"
                  value={formData.time_limit}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Prioridade</label>
                <StyledSelect
                  options={priorityOptions}
                  value={selectedPriority}
                  onChange={handlePriorityChange}
                  placeholder="Selecione..."
                  isClearable
                />
              </div>
            </>
          )}
        </div>
        <div className="modal-footer">
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
