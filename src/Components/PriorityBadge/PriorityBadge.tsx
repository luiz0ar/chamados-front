import React from 'react';
import './PriorityBadge.css';

interface PriorityBadgeProps {
  priorityName: string;
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priorityName }) => {
  const getPriorityClass = (name: string) => {
    switch (name.toUpperCase()) {
      case '0 - SEM':
        return 'no-priority';
      case '1 - BAIXA':
        return 'priority-low';
      case '2 - MÉDIA':
        return 'priority-medium';
      case '3 - ALTA':
        return 'priority-high';
      case '4 - URGENTE':
        return 'priority-urgent';
      case '5 - CRÍTICA':
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
