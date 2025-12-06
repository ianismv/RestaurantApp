import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

export function useAuth() {
  const {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    initialize,
  } = useAuthStore();

  const hasHydrated = useAuthStore.persist.hasHydrated(); // 👈

  useEffect(() => {
    if (hasHydrated) {
      initialize();
    }
  }, [hasHydrated, initialize]);

  const isAdmin = user?.role === "Admin";
  const isUser = user?.role === "User";

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    isUser,
    login,
    register,
    logout,
  };
}
