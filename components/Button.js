import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-bold rounded focus:outline-none transition-colors';
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white disabled:opacity-50',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50',
    danger: 'bg-red-600 hover:bg-red-700 text-white disabled:opacity-50',
    success: 'bg-green-600 hover:bg-green-700 text-white disabled:opacity-50',
    outline: 'border-2 border-blue-400 text-white hover:bg-blue-400 hover:text-gray-900'
  };

  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-6 py-2 text-base',
    lg: 'px-8 py-3 text-lg'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
