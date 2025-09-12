import React, { useState, useEffect, useMemo } from 'react';
import Select, { components } from 'react-select';
import type { SingleValue, MultiValue } from 'react-select';
import './StyledSelect.css';
import { FaTimes } from 'react-icons/fa';

interface SelectOption {
  value: number | string;
  label: string;
}

interface StyledSelectProps {
  options: SelectOption[];
  value: SingleValue<SelectOption> | MultiValue<SelectOption>;
  onChange: (selectedOption: SingleValue<SelectOption> | MultiValue<SelectOption>) => void;
  placeholder?: string;
  isMulti?: boolean;
  showAllOption?: boolean;
  isClearable?: boolean;
}

const CustomMultiValueRemove = (props: any) => {
  return (
    <div
      data-tooltip-id="app-tooltip"
      data-tooltip-content="Remover"
    >
      <components.MultiValueRemove {...props}>
        <FaTimes size="0.8em" />
      </components.MultiValueRemove>
    </div>
  );
};

const CustomClearIndicator = (props: any) => {
  return (
    <div
      data-tooltip-id="app-tooltip"
      data-tooltip-content="Limpar seleção"
    >
      <components.ClearIndicator {...props} />
    </div>
  );
};

const StyledSelect: React.FC<StyledSelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  isMulti = false,
  showAllOption = false,
  isClearable = false
}) => {
  const [displayValue, setDisplayValue] = useState(value);

  const processedOptions = useMemo(() => {
    if (showAllOption && isMulti) {
      return [{ value: 'all', label: 'TODOS' }, ...options];
    }
    return options;
  }, [options, showAllOption, isMulti]);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const handleFocus = () => {
    if (!isMulti) {
      setDisplayValue(null);
    }
  };

  const handleBlur = () => {
    if (!isMulti) {
      if (!displayValue || (Array.isArray(displayValue) && displayValue.length === 0)) {
        setDisplayValue(value);
      }
    }
  };

  const handleChange = (selectedOption: SingleValue<SelectOption> | MultiValue<SelectOption>) => {
    if (showAllOption && isMulti && Array.isArray(selectedOption)) {
      const allOptionValue = 'all';
      const isAllSelected = selectedOption.some(opt => opt.value === allOptionValue);
      const wasAllPreviouslySelected = Array.isArray(value) && value.length === options.length;
      
      if (isAllSelected && !wasAllPreviouslySelected) {
        onChange(options);
        setDisplayValue(options);
        return;
      } else if (isAllSelected && wasAllPreviouslySelected) {
        onChange([]);
        setDisplayValue([]);
        return;
      }
    }
    
    setDisplayValue(selectedOption);
    onChange(selectedOption);
  };

  return (
    <div className="react-select-container">
      <Select
        options={processedOptions}
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder || 'Selecione...'}
        classNamePrefix="react-select"
        noOptionsMessage={() => 'Nenhuma opção encontrada'}
        isMulti={isMulti}
        isClearable={isClearable}
        components={{
          MultiValueRemove: CustomMultiValueRemove,
          ClearIndicator: CustomClearIndicator
        }}
        closeMenuOnSelect={!isMulti}
      />
    </div>
  );
};

export default StyledSelect;