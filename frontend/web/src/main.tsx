import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { Toaster } from 'sonner';
import { AppRouter } from './router/AppRouter';

import { useAuthStore } from './features/auth/stores/authStore';
import './index.css';

// ============================================================================
// INICIALIZAR APP
// ============================================================================
const startApp = async () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Root element not found');

  // Loading inicial simple
  rootElement.innerHTML = `
    <div style="
      display:flex;
      align-items:center;
      justify-content:center;
      height:100vh;
      color:white;
      background:#111;
      font-size:20px;
    ">
      Cargando aplicación...
    </div>
  `;

  try {
    console.log('[main] Inicializando autenticación...');
    await useAuthStore.getState().initializeAuth();
  } catch (error) {
    console.error('[main] Error al inicializar:', error);
  }

  // Renderizar aplicación completa
  createRoot(rootElement).render(
    <StrictMode>
      <BrowserRouter>
        <AppRouter />
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </StrictMode>
  );
};

startApp();
