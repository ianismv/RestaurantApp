import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Home, LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navLinks = [
  { to: '/reservations', label: 'Mis Reservas', icon: Calendar },
  { to: '/reservations/create', label: 'Nueva Reserva', icon: Home },
];

export function UserLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  return (
    <div
      className="min-h-screen overflow-hidden relative"
      onMouseMove={(e) =>
        setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight })
      }
      style={{
        background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, #fff9c4, #ffecb3, #ffe082)`,
        transition: 'background 0.15s',
      }}
    >
      {/* Partículas flotantes */}
      <motion.div
        animate={{ x: [0, 20, 0], y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
        className="absolute w-2 h-2 bg-yellow-400 rounded-full opacity-50 top-32 left-10"
      />
      <motion.div
        animate={{ x: [0, -15, 0], y: [0, 15, 0] }}
        transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
        className="absolute w-3 h-3 bg-yellow-300 rounded-full opacity-40 top-1/2 right-20"
      />

      {/* Header fijo y flotante */}
      <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/30 border-b border-border/20 shadow-lg">
        <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🍽️</span>
            <span className="font-display text-xl font-semibold gradient-text">
              RestaurantApp
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 hover:shadow-lg hover:text-white hover:bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500',
                  location.pathname === link.to
                    ? 'bg-yellow-200 text-yellow-800'
                    : 'text-muted-foreground'
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{user?.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-muted-foreground hover:text-foreground hover:scale-105 transition-transform"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/20 backdrop-blur-md bg-white/20"
          >
            <nav className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 hover:shadow-md hover:bg-yellow-200',
                    location.pathname === link.to
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'text-muted-foreground hover:bg-secondary/10'
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-border/20 pt-2 mt-2">
                <div className="px-4 py-2 text-sm text-muted-foreground">{user?.name}</div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 w-full text-sm text-muted-foreground hover:text-foreground hover:scale-105 transition-transform"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar Sesión
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </header>

      {/* Main Content */}
      <main className="w-full max-w-6xl mx-auto px-4 py-8 pt-28 relative">
        <Outlet />
      </main>
    </div>
  );
}
