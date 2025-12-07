import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, authApi } from '@/services/auth.api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;

  // Actions
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  initialize: () => Promise<void>;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: true,

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
      },

      setUser: (user) => {
        set({ user });
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await authApi.login({ email, password });
          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (email, password, name) => {
        set({ isLoading: true });
        try {
          const response = await authApi.register({ email, password, name });
          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          // 1. Intentar invalidar el refresh token en el backend
          await authApi.logout();
        } catch (error) {
          // Si falla, continuar igual (el usuario quiere desloguearse)
          console.error('Error al hacer logout en el backend:', error);
        } finally {
          // 2. Limpiar el estado de Zustand
          set({ 
            user: null, 
            accessToken: null, 
            refreshToken: null,
            isLoading: false 
          });
          
          // 3. Limpiar manualmente el localStorage de Zustand
          localStorage.removeItem('restaurant-auth');
          
          // 4. Opcional: redirigir al login
          window.location.href = '/login';
        }
      },

      fetchUser: async () => {
        const { accessToken } = get();
        if (!accessToken) {
          set({ isLoading: false });
          return;
        }
        try {
          const user = await authApi.getMe();
          set({ user, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
        }
      },

      initialize: async () => {
        const { accessToken, fetchUser } = get();
        if (accessToken) await fetchUser();
        else set({ isLoading: false });
      },

      isAuthenticated: () => !!get().user,
    }),
    {
      name: 'restaurant-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);
