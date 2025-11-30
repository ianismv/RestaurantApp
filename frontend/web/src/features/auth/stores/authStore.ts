import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { authApi } from '../../../api/auth.api';

import type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from '../../../types/api.types';

// ============================================================================
// AUTH STATE INTERFACE
// ============================================================================

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: (showToast?: boolean) => Promise<void>;
  refreshSession: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  setUser: (user: User) => void;
}

// ============================================================================
// AUTH STORE — ROBUSTO Y SIN ERRORES
// ============================================================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      // ============================================================================
      // LOGIN
      // ============================================================================
      login: async (credentials) => {
        set({ isLoading: true });

        try {
          const response = await authApi.login(credentials);

          // Persistir tokens manualmente
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
        } catch (err) {
          set({ isLoading: false });

          const message =
            err instanceof Error ? err.message : 'Error desconocido';

          toast.error('Fallo en el login', { description: message });

          // Relanzar para que LoginPage pueda manejarlo
          throw new Error(message);
        }
      },

      // ============================================================================
      // REGISTER
      // ============================================================================
      register: async (data) => {
        set({ isLoading: true });

        try {
          const response = await authApi.register(data);

          localStorage.setItem('access_token', response.accessToken);
          localStorage.setItem('refresh_token', response.refreshToken);

          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          toast.success('¡Cuenta creada con éxito!');
        } catch (err) {
          set({ isLoading: false });

          const message =
            err instanceof Error ? err.message : 'Error desconocido';

          toast.error('Fallo en el registro', { description: message });

          throw new Error(message);
        }
      },

      // ============================================================================
      // LOGOUT
      // ============================================================================
      logout: async (showToast = true) => {
        const { refreshToken } = get();

        try {
          if (refreshToken) {
            await authApi.logout(refreshToken);
          }
        } catch {
          // No mostramos toast ni errors aquí.
          // El logout del backend es best-effort.
        }

        // Limpieza total
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });

        if (showToast) {
          toast.success('Sesión cerrada correctamente');
        }
      },

      // ============================================================================
      // REFRESH SESSION
      // ============================================================================
      refreshSession: async () => {
        const { refreshToken } = get();

        if (!refreshToken) {
          await get().logout(false);
          throw new Error('No refresh token available');
        }

        try {
          const response: AuthResponse = await authApi.refreshToken(
            refreshToken
          );

          localStorage.setItem('access_token', response.accessToken);
          localStorage.setItem('refresh_token', response.refreshToken);

          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
          });
        } catch (err) {
          console.error('Error refreshing session:', err);
          await get().logout(false);
          throw err;
        }
      },

      // ============================================================================
      // INITIALIZE AUTH
      // ============================================================================
      initializeAuth: async () => {
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');

        // No había tokens en storage → usuario no autenticado
        if (!accessToken || !refreshToken) {
          set({ isLoading: false });
          return;
        }

        set({ isLoading: true });

        try {
          const user = await authApi.getCurrentUser();

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          // Si falla, limpiamos estado
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

      // ============================================================================
      // SET USER
      // ============================================================================
      setUser: (user) => set({ user }),
    }),

    // ============================================================================
    // PERSISTENCIA
    // ============================================================================
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

