import { LoginForm } from '../features/auth/components/LoginForm';

export const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            🍽️ Restaurant App
          </h1>
          <p className="text-muted-foreground">
            Sistema de Gestión de Reservas
          </p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
};