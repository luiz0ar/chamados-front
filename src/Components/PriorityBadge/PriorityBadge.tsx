import React from 'react';
import './PriorityBadge.css';

interface PriorityBadgeProps {
  priorityName: string;
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priorityName }) => {
  const getPriorityClass = (name: string) => {
    switch (name.toUpperCase()) {
      case 'BAIXA':
        return 'priority-low';
      case 'MÉDIA':
        return 'priority-medium';
      case 'ALTA':
        return 'priority-high';
      case 'URGENTE':
        return 'priority-urgent';
      case 'CRÍTICA':
        return 'priority-critical';
      default:
        return 'priority-default';
    }
  };

  const priorityClass = getPriorityClass(priorityName);

  return (
    <span className={`priority-badge ${priorityClass}`}>
      {priorityName}
    </span>
  );
};

export default PriorityBadge;
