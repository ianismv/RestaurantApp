import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../../../api/auth.api';
import type { User, LoginRequest, RegisterRequest, AuthResponse } from '../../../types/api.types';
import { toast } from 'sonner';

// ============================================================================
// AUTH STORE STATE
// ============================================================================

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: (showToast?: boolean) => Promise<void>; // ✅ Agregar parámetro opcional
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
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      // ====================================================================
      // LOGIN
      // ====================================================================
      login: async (credentials: LoginRequest): Promise<void> => {
        set({ isLoading: true });
        try {
          const response = await authApi.login(credentials);

          localStorage.setItem('access_token', response.accessToken);
          localStorage.setItem('refresh_token', response.refreshToken);

          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          toast.success('¡Bienvenido!', { description: `Hola ${response.user.email}` });
        } catch (error: unknown) {
          set({ isLoading: false });
          if (error instanceof Error) {
            toast.error('Fallo en el login', { description: error.message });
            throw error;
          } else {
            toast.error('Fallo en el login', { description: 'Error desconocido' });
            throw new Error('Error desconocido en login');
          }
        }
      },

      // ====================================================================
      // REGISTER
      // ====================================================================
      register: async (data: RegisterRequest): Promise<void> => {
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

          toast.success('¡Cuenta creada!', { description: 'Tu cuenta ha sido creada exitosamente' });
        } catch (error: unknown) {
          set({ isLoading: false });
          if (error instanceof Error) {
            toast.error('Fallo en el registro', { description: error.message });
            throw error;
          } else {
            toast.error('Fallo en el registro', { description: 'Error desconocido' });
            throw new Error('Error desconocido en register');
          }
        }
      },

      // ====================================================================
      // LOGOUT
      // ====================================================================
      logout: async (showToast: boolean = true) => {
        const { refreshToken } = get();
        try {
          if (refreshToken) await authApi.logout(refreshToken);
        } catch (error) {
          console.error('Error en logout:', error);
        } finally {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');

          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });

          // ✅ Solo mostrar toast si se llama manualmente (no desde interceptor)
          if (showToast) {
            toast.success('Sesión cerrada', { 
              description: 'Has cerrado sesión correctamente' 
            });
          }
        }
      },

      // ====================================================================
      // SET USER
      // ====================================================================
      setUser: (user) => set({ user }),

      // ====================================================================
      // REFRESH SESSION
      // ====================================================================
      refreshSession: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          await get().logout(false); // ✅ false = no mostrar toast
          throw new Error('No refresh token available');
        }

        try {
          const response: AuthResponse = await authApi.refreshToken(refreshToken);

          localStorage.setItem('access_token', response.accessToken);
          localStorage.setItem('refresh_token', response.refreshToken);

          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error('Error refreshing session:', error);
          await get().logout(false); // ✅ false = no mostrar toast
          throw error;
        }
      },

      // ====================================================================
      // INITIALIZE AUTH — al iniciar la app
      // ====================================================================
      initializeAuth: async () => {
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');

        if (!accessToken || !refreshToken) {
          set({ isLoading: false });
          return;
        }

        set({ isLoading: true });

        try {
          const user: User = await authApi.getCurrentUser();

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
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
