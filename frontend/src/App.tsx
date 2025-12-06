import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import { useAuthStore } from "@/stores/authStore";

// Layouts
import { UserLayout } from "@/layouts/UserLayout";
import { AdminLayout } from "@/layouts/AdminLayout";

// Routes
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PublicRoute } from "@/components/auth/PublicRoute";

// Pages
import LandingPage from "@/pages/landing/LandingPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ReservationsListPage from "@/pages/reservations/ReservationsListPage";
import CreateReservationPage from "@/pages/reservations/CreateReservationPage";
import ReservationDetailPage from "@/pages/reservations/ReservationDetailPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import TablesListPage from "@/pages/admin/tables/TablesListPage";
import TableFormPage from "@/pages/admin/tables/TableFormPage";
import DishesListPage from "@/pages/admin/dishes/DishesListPage";
import DishFormPage from "@/pages/admin/dishes/DishFormPage";
import AdminReservationsPage from "@/pages/admin/reservations/AdminReservationsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const { isLoading, initialize } = useAuthStore();

  React.useEffect(() => {
    initialize();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-white bg-black">
        Cargando sesión...
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

              {/* User Routes */}
              <Route element={<ProtectedRoute allowedRoles={["User", "Admin"]}><UserLayout /></ProtectedRoute>}>
                <Route path="/reservations" element={<ReservationsListPage />} />
                <Route path="/reservations/create" element={<CreateReservationPage />} />
                <Route path="/reservations/:id" element={<ReservationDetailPage />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={["Admin"]}><AdminLayout /></ProtectedRoute>}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/tables" element={<TablesListPage />} />
                <Route path="/admin/tables/create" element={<TableFormPage />} />
                <Route path="/admin/tables/:id/edit" element={<TableFormPage />} />
                <Route path="/admin/dishes" element={<DishesListPage />} />
                <Route path="/admin/dishes/create" element={<DishFormPage />} />
                <Route path="/admin/dishes/:id/edit" element={<DishFormPage />} />
                <Route path="/admin/reservations" element={<AdminReservationsPage />} />
                <Route path="/admin/reservations/:id" element={<ReservationDetailPage />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
