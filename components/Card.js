import React from 'react';

export const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
