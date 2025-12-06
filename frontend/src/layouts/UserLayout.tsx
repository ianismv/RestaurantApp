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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fafafa] to-[#f0f0f6] dark:from-[#0f0f11] dark:to-[#1a1a1d] transition-all">

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/50 dark:bg-black/20 border-b border-border/40 shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🍽️</span>
            <span className="font-display text-xl font-semibold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
              RestaurantApp
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'flex items-center gap-2 text-sm font-medium transition-all hover:text-primary hover:scale-[1.02]',
                  location.pathname === link.to
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>

          {/* User menu */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{user?.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/50"
          >
            <nav className="container py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    location.pathname === link.to
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-secondary/50'
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}

              <div className="border-t border-border/50 pt-2 mt-2">
                <div className="px-4 py-2 text-sm text-muted-foreground">
                  {user?.name}
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 w-full text-sm text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar Sesión
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </header>

      {/* Main */}
      <main className="container py-8">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white/60 dark:bg-black/30 shadow-xl backdrop-blur-lg p-6 border border-border/30 transition-all">
          <Outlet />
        </div>
      </main>

    </div>
  );
}
