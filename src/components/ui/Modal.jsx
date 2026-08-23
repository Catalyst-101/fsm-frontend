import React from 'react';
import Button from './Button';

const Modal = ({ isOpen, onClose, title, children, footer, type = 'info' }) => {
  if (!isOpen) return null;

  const headerColors = {
    info: 'bg-[var(--color-primary)] text-white',
    warning: 'bg-[var(--color-accent)] text-[var(--color-primary)]',
    danger: 'bg-red-600 text-white'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div className="relative bg-[var(--color-background)] rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className={`${headerColors[type]} px-6 py-4 flex justify-between items-center`}>
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="text-current opacity-80 hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 text-[var(--color-text)]">
          {children}
        </div>
        
        {footer ? (
          <div className="px-6 py-4 bg-white/50 border-t border-gray-200 flex justify-end gap-3 rounded-b-xl">
            {footer}
          </div>
        ) : (
          <div className="px-6 py-4 bg-white/50 border-t border-gray-200 flex justify-end gap-3 rounded-b-xl">
            <Button onClick={onClose} variant="primary">OK</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
