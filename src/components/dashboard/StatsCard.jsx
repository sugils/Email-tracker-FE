// src/components/dashboard/StatsCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './StatsCard.css';

const StatsCard = ({ title, value, icon, color, link }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const iconBgStyle = {
    backgroundColor: `${color}15`, // Using hex alpha for background transparency
  };

  const iconStyle = {
    color: color,
  };

  const borderStyle = {
    borderLeftColor: isHovered ? color : 'transparent',
    borderLeftWidth: '4px',
    borderLeftStyle: 'solid',
    transition: 'all 0.3s ease'
  };

  const renderContent = () => (
    <>
      <div className="stats-card-header">
        <div className="stats-card-title-wrapper">
          <div className="stats-card-icon" style={iconBgStyle}>
            <span className="material-icons" style={iconStyle}>
              {icon}
            </span>
          </div>
          <p className="stats-card-title">{title}</p>
        </div>
      </div>
      <h3 className="stats-card-value">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </h3>
      <div className="stats-card-footer">
        <span className="stats-card-subtitle">Total {title.toLowerCase()}</span>
        {link && (
          <span className={`material-icons stats-card-arrow ${isHovered ? 'animate' : ''}`}>
            arrow_forward
          </span>
        )}
      </div>
    </>
  );

  if (link) {
    return (
      <Link 
        to={link} 
        className="stats-card"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={borderStyle}
      >
        {renderContent()}
      </Link>
    );
  }

  return <div className="stats-card">{renderContent()}</div>;
};

export default StatsCard;