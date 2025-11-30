import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../../../api/auth.api';
import type { User, LoginRequest, RegisterRequest } from '../../../types/api.types';
import { toast } from 'sonner';

// ============================================================================
// AUTH STORE STATE
// ============================================================================

interface AuthState {
  // Estado
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Acciones
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  refreshSession: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

// ============================================================================
// AUTH STORE
// ============================================================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      // ======================================================================
      // LOGIN
      // ======================================================================
      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const response = await authApi.login(credentials);

          // Guardar tokens
          localStorage.setItem('access_token', response.accessToken);
          localStorage.setItem('refresh_token', response.refreshToken);

          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          toast.success('¡Bienvenido!', {
            description: `Hola ${response.user.email}`,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // ======================================================================
      // REGISTER
      // ======================================================================
      register: async (data) => {
        set({ isLoading: true });
        try {
          const response = await authApi.register(data);

          // Guardar tokens
          localStorage.setItem('access_token', response.accessToken);
          localStorage.setItem('refresh_token', response.refreshToken);

          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          toast.success('¡Cuenta creada!', {
            description: 'Tu cuenta ha sido creada exitosamente',
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // ======================================================================
      // LOGOUT
      // ======================================================================
      logout: async () => {
        const { refreshToken } = get();

        try {
          if (refreshToken) {
            await authApi.logout(refreshToken);
          }
        } catch (error) {
          console.error('Error durante logout:', error);
        } finally {
          // Limpiar todo
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');

          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });

          toast.success('Sesión cerrada', {
            description: 'Has cerrado sesión correctamente',
          });
        }
      },

      // ======================================================================
      // SET USER
      // ======================================================================
      setUser: (user) => {
        set({ user });
      },

      // ======================================================================
      // REFRESH SESSION
      // ======================================================================
      refreshSession: async () => {
        const { refreshToken } = get();

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        try {
          const response = await authApi.refreshToken(refreshToken);

          localStorage.setItem('access_token', response.accessToken);
          localStorage.setItem('refresh_token', response.refreshToken);

          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
          });
        } catch (error) {
          // Si falla el refresh, cerrar sesión
          get().logout();
          throw error;
        }
      },

      // ======================================================================
      // INITIALIZE AUTH (verificar sesión al cargar app)
      // ======================================================================
      initializeAuth: async () => {
        const accessToken = localStorage.getItem('access_token');

        if (!accessToken) {
          set({ isLoading: false });
          return;
        }

        set({ isLoading: true });

        try {
          const user = await authApi.getCurrentUser();
          set({
            user,
            accessToken,
            refreshToken: localStorage.getItem('refresh_token'),
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: unknown) {
          console.error('Failed to initialize auth:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage', // Nombre en localStorage
      partialize: (state) => ({
        // Solo persistir estos campos
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);