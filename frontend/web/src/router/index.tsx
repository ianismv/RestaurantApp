import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { HomePage } from '../pages/HomePage';
import { useAuth } from '../features/auth/hooks/useAuth';
import { Spinner } from '../components/ui/Spinner';
import type { JSX } from 'react';

// ============================================================================
// PRIVATE ROUTE COMPONENT
// ============================================================================

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// ============================================================================
// APP ROUTER
// ============================================================================

export const AppRouter = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Private Routes */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <HomePage />
          </PrivateRoute>
        }
      />

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};