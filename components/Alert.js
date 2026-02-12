import React from 'react';

export const Alert = ({ type = 'info', message, onClose }) => {
  const bgColors = {
    success: 'bg-green-900 border-green-700 text-green-200',
    error: 'bg-red-900 border-red-700 text-red-200',
    warning: 'bg-yellow-900 border-yellow-700 text-yellow-200',
    info: 'bg-blue-900 border-blue-700 text-blue-200'
  };

  return (
    <div className={`border px-4 py-3 rounded mb-4 ${bgColors[type]}`}>
      <div className="flex items-center justify-between">
        <p>{message}</p>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-lg font-bold hover:opacity-70"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
