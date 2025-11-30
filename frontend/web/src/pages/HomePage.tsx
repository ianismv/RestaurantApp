// src/pages/HomePage.tsx
import { useAuth } from '../features/auth/hooks/useAuth';
import { Button } from '../components/ui/Button';

export const HomePage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">¡Bienvenido!</h1>
        <p className="text-muted-foreground mb-6">
          Usuario: {user?.email} | Rol: {user?.role}
        </p>
        <Button onClick={logout} variant="destructive">
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
};