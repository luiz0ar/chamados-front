import React from 'react';
import { Link } from 'react-router-dom';
import './Breadcrumb.css';

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <header className="breadcrumb-header">
      {items.map((item, index) => (
        <React.Fragment key={item.path}>
          {index < items.length - 1 ? (
            <Link to={item.path} className="breadcrumb-link">
              {item.label}
            </Link>
          ) : (
            <span className="breadcrumb-active">{item.label}</span>
          )}
          {index < items.length - 1 && (
            <span className="breadcrumb-separator">{'>'}</span>
          )}
        </React.Fragment>
      ))}
    </header>
  );
};

export default Breadcrumb;
