import React from 'react';

const AlertModal = ({ isOpen, title, message, type = 'info', onClose }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <span className="material-symbols-outlined text-green-500 text-4xl">check_circle</span>;
      case 'error':
        return <span className="material-symbols-outlined text-red-500 text-4xl">error</span>;
      case 'warning':
        return <span className="material-symbols-outlined text-orange-500 text-4xl">warning</span>;
      default:
        return <span className="material-symbols-outlined text-blue-500 text-4xl">info</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden transform transition-all animate-scale-in">
        <div className="p-6 text-center">
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 mb-6">{message}</p>
          
          <button
            onClick={onClose}
            className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-white font-semibold py-2.5 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
