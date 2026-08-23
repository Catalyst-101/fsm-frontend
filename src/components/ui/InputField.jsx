import React from 'react';

const InputField = ({ label, icon, error, warning, className = '', containerClassName = '', ...props }) => {
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && <label className="block font-semibold text-xs tracking-wider text-[var(--color-text)] mb-2 uppercase">{label}</label>}
      <div className={`relative rounded-lg border transition-all focus-within:border-[var(--color-secondary)] focus-within:border-2 bg-white
        ${error ? 'border-red-500' : warning ? 'border-[var(--color-accent)]' : 'border-gray-300'}`}>
        
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-gray-400">{icon}</span>
          </div>
        )}
        
        <input 
          className={`block w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-3 border-none bg-transparent focus:ring-0 text-sm text-[var(--color-text)] rounded-lg placeholder-gray-400 outline-none ${className}`} 
          {...props} 
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
      {warning && <p className="mt-1 text-xs text-[var(--color-accent)] font-medium">{warning}</p>}
    </div>
  );
};

export default InputField;
