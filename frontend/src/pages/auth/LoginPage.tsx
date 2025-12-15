import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageTransition } from '@/components/ui/page-transition';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const from = (location.state as any)?.from?.pathname || '/reservations';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor completa todos los campos');
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos',
        variant: 'destructive', // estilo de error
      });
      return;
    }

    try {
      await login(email, password);
      toast({
        title: '¡Bienvenido!',
        description: 'Has iniciado sesión correctamente',
        variant: 'default',
      });
      navigate(from, { replace: true });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Credenciales inválidas';
      setError(message);
      toast({
        title: 'Error de autenticación',
        description: message,
        variant: 'destructive',
      });
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-background bg-hero-pattern p-4">
        {/* Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="glass-card rounded-2xl p-8 border border-border/50">
            {/* Logo */}
            <Link to="/" className="flex items-center justify-center gap-2 mb-8">
              <span className="text-3xl">🍽️</span>
              <span className="font-display text-2xl font-semibold gradient-text">
                RestaurantApp
              </span>
            </Link>

            <div className="text-center mb-8">
              <h1 className="font-display text-2xl font-bold mb-2">
                Bienvenido de nuevo
              </h1>
              <p className="text-muted-foreground">
                Ingresa tus credenciales para continuar
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-4 mb-6 rounded-lg bg-destructive/10 text-destructive text-sm"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-elegant"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-elegant pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full btn-glow"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Iniciando sesión...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Iniciar Sesión
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">¿No tienes cuenta? </span>
              <Link to="/register" className="text-primary hover:underline font-medium">
                Regístrate
              </Link>
              </div>
              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Credenciales de Prueba: </span>
                <div>
                <p className="text-muted-foreground">👤 User: ianis@ianis.com/Ianis123</p>
                <p className="text-muted-foreground">👑 Admin: admin@bodegon.com/1b4601d6a237</p>
                </div>
            </div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
