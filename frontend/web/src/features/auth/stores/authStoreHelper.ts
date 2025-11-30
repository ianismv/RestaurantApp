import { useAuthStore, type AuthState } from './authStore'; 

/**
 * Hook para obtener el estado y las acciones del store de autenticación (Zustand)
 * fuera de los componentes de React.
 * * Esto es crucial para que los interceptores de Axios (en client.ts) puedan 
 * acceder a las funciones de manejo de sesión (refreshSession, logout) sin
 * crear una dependencia circular.
 */
export const getAuthStore = (): AuthState => {
    // Usamos .getState() de Zustand, que es el método no-reactivo y seguro
    // para obtener el estado y las acciones en cualquier parte de la aplicación.
    return useAuthStore.getState();
};