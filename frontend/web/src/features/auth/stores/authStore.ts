import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';

import authApi from '../../../api/auth.api';
import type { User, LoginRequest, RegisterRequest } from '../../../types/api.types';

// ================================================================
// 📌 Tipado del estado
// ================================================================
export interface AuthState {
    user: User | null;

    accessToken: string | null;
    refreshToken: string | null;

    isAuthenticated: boolean;
    isLoading: boolean;

    // Mutadores
    setTokens: (access: string | null, refresh: string | null) => void;
    setUser: (user: User | null) => void;

    // Acciones
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>; 
    logout: () => void;

    refreshSession: () => Promise<string | null>;
    loadUserFromToken: () => Promise<void>;
    initializeAuth: () => Promise<void>;

    // Router helpers
    hasRole: (role: 'Admin' | 'User') => boolean;
}

// ================================================================
// 📌 Store principal Zustand
// ================================================================
export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,

            isAuthenticated: false,
            isLoading: true,

            // --------------------------------------------------------
            // SET TOKENS
            // --------------------------------------------------------
            setTokens: (access, refresh) => {
                set({
                    accessToken: access,
                    refreshToken: refresh,
                    isAuthenticated: !!access // 🔥 el secreto
                });
            },

            // --------------------------------------------------------
            // SET USER
            // --------------------------------------------------------
            setUser: (user) =>
                set({
                    user
                }),

            // --------------------------------------------------------
            // LOGOUT
            // --------------------------------------------------------
            logout: () => {
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false
                });

                toast.success('Sesión cerrada.');
            },

            // --------------------------------------------------------
            // LOGIN
            // --------------------------------------------------------
            login: async (email: string, password: string): Promise<void> => {
                const payload: LoginRequest = { email, password };

                try {
                    const res = await authApi.login(payload);

                    get().setTokens(res.accessToken, res.refreshToken);
                    get().setUser(res.user);

                    toast.success(`Bienvenido, ${res.user.name}!`);
                } catch {
                    toast.error('Email o contraseña incorrectos.');
                    set({ isAuthenticated: false });
                } finally {
                    set({ isLoading: false });
                }
            },

            // --------------------------------------------------------
            // REGISTER
            // --------------------------------------------------------

            register: async (data: RegisterRequest) => {
                try {
                    const res = await authApi.register(data);

                    // Auto-login después del registro
                    get().setTokens(res.accessToken, res.refreshToken);
                    get().setUser(res.user);

                    toast.success(`Cuenta creada. Bienvenido, ${res.user.name || 'usuario'}!`);
                } catch (err) {
                    toast.error('Error al registrarse: ' + (err instanceof Error ? err.message : 'Unknown'));
                    throw err; // para que el formulario capture el error
                } finally {
                    set({ isLoading: false });
                }
            },

            // --------------------------------------------------------
            // REFRESH SESSION
            // --------------------------------------------------------
            refreshSession: async () => {
                const refresh = get().refreshToken;
                if (!refresh) return null;

                try {
                    const res = await authApi.refreshToken(refresh);

                    get().setTokens(res.accessToken, res.refreshToken);

                    return res.accessToken;
                } catch {
                    get().logout();
                    return null;
                }
            },

            // --------------------------------------------------------
            // LOAD USER (ME)
            // --------------------------------------------------------
            loadUserFromToken: async () => {
                const access = get().accessToken;
                if (!access) return;

                try {
                    const user = await authApi.getCurrentUser();
                    get().setUser(user);
                } catch {
                    get().logout();
                }
            },

            // --------------------------------------------------------
            // INITIALIZE AUTH (🔥 para main.tsx)
            // --------------------------------------------------------
            initializeAuth: async () => {
                try {
                    const newAccess = await get().refreshSession();

                    if (newAccess) {
                        await get().loadUserFromToken();
                    }
                } catch (err) {
                    console.error('[AuthStore] initializeAuth failed:', err);
                } finally {
                    set({ isLoading: false });
                }
            },

            // --------------------------------------------------------
            // HAS ROLE (🔥 requerido por AppRouter)
            // --------------------------------------------------------
            hasRole: (role: 'Admin' | 'User'): boolean => {
                const user = get().user;
                return user?.role === role;
            }
        }),
        {
            name: 'auth-storage',
            partialize: (s) => ({
                accessToken: s.accessToken,
                refreshToken: s.refreshToken,
                user: s.user
            })
        }
    )
);
