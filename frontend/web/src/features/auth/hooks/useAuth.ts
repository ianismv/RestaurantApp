import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

// ============================================================================
// USE AUTH HOOK
// ============================================================================

export const useAuth = () => {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    initializeAuth,
  } = useAuthStore();

  // Inicializar auth al montar
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Helpers
  const isAdmin = user?.role === 'Admin';
  const isUser = user?.role === 'User';

  // Login wrapper
  const handleLogin = async (email: string, password: string) => {
    await login({ email, password });
    navigate('/');
  };

  // Register wrapper
  const handleRegister = async (
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    await register({ email, password, confirmPassword });
    navigate('/');
  };

  // Logout wrapper
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
    isUser,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };
};