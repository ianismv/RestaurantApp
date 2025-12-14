import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  LogOut, 
  User, 
  Menu, 
  X, 
  Home,
  Bell,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navLinks = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/reservations', label: 'Mis Reservas', icon: Calendar },
];

export function UserLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

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
      {/* PARTÍCULAS FLOTANTES */}
      <motion.div
        animate={{ x: [0, 20, 0], y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
        className="absolute w-2 h-2 bg-yellow-400 rounded-full opacity-50 top-32 left-10 pointer-events-none"
      />
      <motion.div
        animate={{ x: [0, -15, 0], y: [0, 15, 0] }}
        transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
        className="absolute w-3 h-3 bg-yellow-300 rounded-full opacity-40 top-1/2 right-20 pointer-events-none"
      />
      <motion.div
        animate={{ x: [0, 10, 0], y: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        className="absolute w-2.5 h-2.5 bg-yellow-500 rounded-full opacity-30 bottom-1/3 left-1/3 pointer-events-none"
      />

      {/* BACKGROUND BLOBS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '-3s' }}
        />
      </div>

      {/* HEADER PREMIUM */}
      <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/30 border-b border-border/20 shadow-lg">
        <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4">
          
          {/* LOGO */}
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <motion.span
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="text-2xl"
            >
              🍽️
            </motion.span>
            <span className="font-display text-xl font-semibold gradient-text">
              RestaurantApp
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    'relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105',
                    isActive
                      ? 'bg-white/50 text-yellow-800 shadow-md'
                      : 'text-muted-foreground hover:bg-white/30 hover:text-foreground'
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* USER MENU DESKTOP */}
          <div className="hidden md:flex items-center gap-3">

            {/* Perfil */}
            <div className="flex items-center gap-2 text-sm bg-white/30 px-3 py-1.5 rounded-lg">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{user?.name}</span>
            </div>

            {/* Logout */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-muted-foreground hover:text-foreground hover:bg-white/30 hover:scale-105 transition-all rounded-lg"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isLoggingOut ? 'Saliendo...' : 'Salir'}
            </Button>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden p-2 hover:bg-white/30 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-border/20 backdrop-blur-md bg-white/20"
            >
              <nav className="px-4 py-4 space-y-2">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all',
                        isActive
                          ? 'bg-white/50 text-yellow-800 shadow-md'
                          : 'text-muted-foreground hover:bg-white/30'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <link.icon className="h-4 w-4" />
                        <span>{link.label}</span>
                      </div>
                      {isActive && <ChevronRight className="h-4 w-4 text-primary" />}
                    </Link>
                  );
                })}

                {/* User Info Mobile */}
                <div className="border-t border-border/20 pt-3 mt-3 space-y-2">
                  <div className="px-4 py-2 text-sm bg-white/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium ">{user?.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>

                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center gap-2 px-4 py-3 w-full text-sm text-muted-foreground hover:text-foreground hover:bg-white/30 rounded-lg transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                    {isLoggingOut ? 'Cerrando Sesión...' : 'Cerrar Sesión'}
                  </button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* MAIN CONTENT */}
      <main className="w-full max-w-6xl mx-auto px-4 py-8 pt-28 relative">
        <Outlet />
      </main>

    </div>
  );
}