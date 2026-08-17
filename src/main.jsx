import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App.jsx';
import './index.css';
import './App.css';

// Global listener to prevent mouse wheel from changing number input values
document.addEventListener('wheel', function(event) {
  if (document.activeElement.type === 'number') {
    document.activeElement.blur();
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
