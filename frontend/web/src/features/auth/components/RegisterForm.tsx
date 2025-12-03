import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import  Button  from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../components/ui/Card';

// ============================================================================
// REGISTER FORM
// ============================================================================

export const RegisterForm = () => {
  const { register, isLoading } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  // ============================================================================
  // VALIDACIÓN LOCAL (Frontend-only)
  // ============================================================================

  const validateForm = () => {
    const e: Partial<typeof form> = {};

    if (!form.name.trim()) e.name = "Tu nombre es requerido";

    if (!form.email) {
      e.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Email inválido";
    }

    if (!form.password) {
      e.password = "La contraseña es requerida";
    } else if (form.password.length < 8) {
      e.password = "Debe tener al menos 8 caracteres";
    } else if (!/[A-Z]/.test(form.password)) {
      e.password = "Debe contener al menos una mayúscula";
    } else if (!/[0-9]/.test(form.password)) {
      e.password = "Debe contener al menos un número";
    }

    if (!form.confirmPassword) {
      e.confirmPassword = "Confirma tu contraseña";
    } else if (form.password !== form.confirmPassword) {
      e.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ============================================================================
  // SUBMIT
  // ============================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword
      });

    } catch (err) {
      console.error("Register error:", err);
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

          {/* NAME */}
          <Input
            label="Nombre"
            placeholder="Juan Pérez"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            error={errors.name}
            required
            disabled={isLoading}
          />

          {/* EMAIL */}
          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            error={errors.email}
            required
            disabled={isLoading}
          />

          {/* PASSWORD */}
          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
            error={errors.password}
            helperText="Mínimo 8 caracteres, una mayúscula y un número"
            required
            disabled={isLoading}
          />

          {/* CONFIRM */}
          <Input
            label="Confirmar Contraseña"
            type="password"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
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
            {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
          </Button>

          <div className="text-sm text-center text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <a href="/login" className="text-primary hover:underline font-medium">
              Inicia sesión aquí
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};
