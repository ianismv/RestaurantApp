import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Table2,
  UtensilsCrossed,
  Calendar,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Menu,
  X,
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const navLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/tables', label: 'Mesas', icon: Table2 },
  { to: '/admin/dishes', label: 'Platos', icon: UtensilsCrossed },
  { to: '/admin/reservations', label: 'Reservas', icon: Calendar },
  { to: '/admin/users', label: 'Usuarios', icon: User },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebarCollapse } = useUIStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string, end?: boolean) => {
    if (end) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar desktop */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 280 }}
        className="hidden sm:flex fixed left-0 top-0 h-screen glass-card border-r border-border/50 z-50 flex-col"
      >
        <SidebarContent
          user={user}
          sidebarCollapsed={sidebarCollapsed}
          navLinks={navLinks}
          isActive={isActive}
          toggleSidebarCollapse={toggleSidebarCollapse}
          handleLogout={handleLogout}
          isLoggingOut={isLoggingOut}
        />
      </motion.aside>

      {/* Sidebar mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            className="fixed inset-0 z-50 bg-background/95 glass-card p-4 flex flex-col sm:hidden"
          >
            <div className="flex justify-end mb-4">
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <SidebarContent
              user={user}
              sidebarCollapsed={false}
              navLinks={navLinks}
              isActive={isActive}
              toggleSidebarCollapse={() => {}}
              handleLogout={() => {
                handleLogout();
                setMobileOpen(false);
              }}
              isLoggingOut={isLoggingOut}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 transition-all duration-300 sm:ml-[280px]">
        {/* Mobile top bar */}
        <div className="sm:hidden flex items-center justify-between p-4 border-b border-border/50">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
          <span className="font-semibold text-lg animate-pulse">Admin</span>
        </div>
        <div className="p-4 sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function SidebarContent({
  user,
  sidebarCollapsed,
  navLinks,
  isActive,
  toggleSidebarCollapse,
  handleLogout,
  isLoggingOut,
}: any) {
  return (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border/50">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍽️</span>
            <span className="font-display text-lg font-semibold gradient-text">
              Admin
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebarCollapse}
          className="h-8 w-8 shrink-0"
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navLinks.map((link: any) => (
          <Link
            key={link.to}
            to={link.to}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
              isActive(link.to, link.end)
                ? 'bg-primary/10 text-primary border-l-2 border-primary'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            )}
          >
            <link.icon className="h-5 w-5 shrink-0" />
            {!sidebarCollapsed && <span className="text-sm font-medium whitespace-nowrap">{link.label}</span>}
          </Link>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-border/50">
        <div className={cn('flex items-center gap-3 mb-3', sidebarCollapsed && 'justify-center')}>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="h-5 w-5 text-primary" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={cn('w-full justify-start text-muted-foreground hover:text-foreground', sidebarCollapsed && 'justify-center px-2')}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!sidebarCollapsed && <span className="ml-2">{isLoggingOut ? 'Cerrando...' : 'Cerrar Sesión'}</span>}
        </Button>
      </div>
    </>
  );
}
