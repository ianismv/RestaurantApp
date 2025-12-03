import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import type { LoginRequest, RegisterRequest } from '../../../types/api.types';

/**
 * ✅ Hook profesional de autenticación
 * - Login, Register, Logout
 * - Redirecciones según rol
 * - Estado derivado: isAuthenticated, isAdmin, isUser
 */
export const useAuth = () => {
  const navigate = useNavigate();

  const {
    user,
    accessToken,
    isLoading,
    login,
    logout,
    register,
  } = useAuthStore();

  // ----------------------------------------------------------
  // Derivados del estado
  // ----------------------------------------------------------
  const isAuthenticated = Boolean(accessToken);
  const isAdmin = user?.role === 'Admin';
  const isUser = user?.role === 'User';

  // ----------------------------------------------------------
  // LOGIN
  // ----------------------------------------------------------
  const handleLogin = async (credentials: LoginRequest) => {
    try {
      await login(credentials.email, credentials.password);

      // Redirección automática según rol
      if (user?.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/reservations');
      }
    } catch (err) {
      console.error('[useAuth] login error:', err);
      // El toast ya se muestra en el store
    }
  };

  // ----------------------------------------------------------
  // LOGOUT
  // ----------------------------------------------------------
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('[useAuth] logout error:', err);
    }
  };

  // ----------------------------------------------------------
  // REGISTER
  // ----------------------------------------------------------
  const handleRegister = async (data: RegisterRequest) => {
    try {
      await register(data);

      // Después de registrar, redirige según rol asignado
      if (user?.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/reservations');
      }
    } catch (err) {
      console.error('[useAuth] register error:', err);
    }
  };

  // ----------------------------------------------------------
  // Retorno del hook
  // ----------------------------------------------------------
  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    isUser,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
  };
};
