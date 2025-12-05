import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import Button from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../../../components/ui/Card';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// ============================================================================
// LOGIN FORM COMPONENT (PRO ANIMADO)
// ============================================================================
export const LoginForm = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // --------------------------------------------------------
  // Validación simple del formulario
  // --------------------------------------------------------
  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!email) newErrors.email = 'El email es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Email inválido';

    if (!password) newErrors.password = 'La contraseña es requerida';
    else if (password.length < 6) newErrors.password = 'La contraseña debe tener al menos 6 caracteres';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --------------------------------------------------------
  // Submit del formulario
  // --------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await login(email, password);

      // Obtener usuario actualizado del store
      const currentUser = useAuthStore.getState().user;

      // Toast personalizado según rol
      if (currentUser?.role === 'Admin') {
        toast.success('Bienvenido Admin!');
        navigate('/admin');
      } else if (currentUser) {
        toast.success(`Bienvenido, ${currentUser.name || currentUser.email}!`);
        navigate('/reservations');
      }

    } catch (err) {
      console.error('Login error:', err);
      // El toast de error ya se maneja en authStore
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-md mx-auto shadow-xl dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder a tu cuenta
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <motion.div
              whileFocus={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
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
            </motion.div>

            <motion.div
              whileFocus={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Input
                label="Contraseña"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                required
                disabled={isLoading}
              />
            </motion.div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="w-full text-white hover:bg-primary/90 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </motion.div>

            <div className="text-sm text-center text-muted-foreground">
              ¿No tienes cuenta?{' '}
              <a
                href="/register"
                className="text-primary hover:underline font-medium"
              >
                Regístrate aquí
              </a>
            </div>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
};
