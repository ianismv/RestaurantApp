import { RegisterForm } from '../features/auth/components/RegisterForm';

export const RegisterPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            🍽️ Restaurant Optimo
          </h1>
          <p className="text-muted-foreground">
            Crea tu cuenta y comienza a reservar
          </p>
        </div>
        
        <RegisterForm />
      </div>
    </div>
  );
};