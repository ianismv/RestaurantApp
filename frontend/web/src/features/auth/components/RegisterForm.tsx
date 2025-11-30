import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../components/ui/Card';

// ============================================================================
// REGISTER FORM COMPONENT
// ============================================================================

export const RegisterForm = () => {
  const { register, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = 'Debe contener al menos una mayúscula';
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = 'Debe contener al menos un número';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await register(email, password, confirmPassword);
    } catch (error) {
      console.error('Register error:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Crear Cuenta</CardTitle>
        <CardDescription>
          Completa los datos para registrarte en Restaurant Optimo
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            required
            disabled={isLoading}
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            helperText="Mínimo 8 caracteres, una mayúscula y un número"
            required
            disabled={isLoading}
          />

          <Input
            label="Confirmar Contraseña"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            required
            disabled={isLoading}
          />
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </Button>

          <div className="text-sm text-center text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <a href="/login" className="text-primary hover:underline font-medium">
              Inicia sesión aquí
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};