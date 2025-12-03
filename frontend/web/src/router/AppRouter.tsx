/* eslint-disable no-irregular-whitespace */
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import type { ReactElement } from "react";

// Pages
import Homepage from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { ReservationPage } from "../pages/ReservationPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";

// Layout
import { DashboardLayout } from "../components/layout/DashboardLayout";

// Store
import { useAuthStore } from "../features/auth/stores/authStore";
import { Spinner } from "../components/ui/Spinner";

// ============================================================================
// LOADING SCREEN
// ============================================================================
const LoadingScreen = (): ReactElement => (
  <div className="min-h-screen flex items-center justify-center bg-gray-900">
    <Spinner size="xl" />
  </div>
);

// ============================================================================
// PUBLIC ROUTE
// ============================================================================
const PublicRoute = ({ children }: { children: ReactElement }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation(); // 🔥 ahora sí se usa

  if (isLoading) return <LoadingScreen />;

  if (isAuthenticated) {
    const target = user?.role === "Admin" ? "/admin" : "/reservations";

    return (
      <Navigate
        to={target}
        replace
        state={{ from: location.pathname }} // 🔥 evita warning + UX pro
      />
    );
  }

  return children;
};

// ============================================================================
// PRIVATE ROUTE
// ============================================================================
const PrivateRoute = ({ children }: { children: ReactElement }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) return <LoadingScreen />;

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }} // 🔥 navegación natural
      />
    );
  }

  return children;
};

// ============================================================================
// ROLE-BASED ROUTE
// ============================================================================
const RoleRoute = ({
  children,
  requiredRole,
}: {
  children: ReactElement;
  requiredRole: "Admin" | "User";
}) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) return <LoadingScreen />;

  // Si no está logeado, vuelve al login
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // Si el rol coincide, OK
  if (user.role === requiredRole) return children;

  // Redirigir según su rol real
  const fallback = user.role === "Admin" ? "/admin" : "/reservations";

  return (
    <Navigate
      to={fallback}
      replace
      state={{ from: location.pathname }}
    />
  );
};

// ============================================================================
// ROUTER PRINCIPAL
// ============================================================================
export const AppRouter = (): ReactElement => {
  return (
    <Routes>
      {/* ===================== PUBLIC ===================== */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Homepage />
          </PublicRoute>
        }
      />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* ==================== PRIVATE ===================== */}
      <Route
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        {/* USER */}
        <Route
          path="/reservations"
          element={
            <RoleRoute requiredRole="User">
              <ReservationPage />
            </RoleRoute>
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <RoleRoute requiredRole="Admin">
              <AdminDashboardPage />
            </RoleRoute>
          }
        />
      </Route>

      {/* ==================== NOT FOUND ==================== */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
