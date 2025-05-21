// src/components/common/Button.jsx
import React from 'react';
import './Button.css';

const Button = ({ 
  onClick, 
  children, 
  variant = 'primary', 
  size = 'medium',
  type = 'button',
  disabled = false,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const buttonClasses = [
    'button',
    `button-${variant}`,
    `button-${size}`,
    fullWidth ? 'button-full-width' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;