import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-6 py-2.5 rounded font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)]",
    secondary: "bg-white text-[var(--color-primary)] border border-gray-300 hover:bg-gray-50",
    accent: "bg-[var(--color-accent)] text-[var(--color-primary)] hover:brightness-110",
    danger: "bg-red-600 text-white hover:bg-red-700",
    outline: "bg-transparent text-[var(--color-primary)] border border-[var(--color-primary)] hover:bg-gray-100"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
