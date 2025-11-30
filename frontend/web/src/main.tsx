import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppRouter } from './router';
import './index.css';
import { useAuthStore } from './features/auth/stores/authStore';

// ============================================================================
// INICIALIZAR APP
// ============================================================================

const startApp = async () => {
  const root = document.getElementById('root');
  if (!root) throw new Error('Root element not found');

  // Mostrar loading inicial
  root.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;"><div>Cargando...</div></div>';

  try {
    // Inicializar auth SOLO UNA VEZ
    await useAuthStore.getState().initializeAuth();
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }

  // Renderizar app
  createRoot(root).render(
    <StrictMode>
      <BrowserRouter>
        <AppRouter />
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </StrictMode>
  );
};

startApp();

