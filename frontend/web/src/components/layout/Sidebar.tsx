// Sidebar.tsx
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Calendar, Users, Settings, LogOut, Menu } from 'lucide-react';
import Button from '../ui/Button';

interface SidebarItem {
  name: string;
  icon: React.ReactNode;
  path: string;
}

const sidebarItems: SidebarItem[] = [
  { name: 'Inicio', icon: <Home className="w-5 h-5" />, path: '/' },
  { name: 'Reservas', icon: <Calendar className="w-5 h-5" />, path: '/reservations' },
  { name: 'Usuarios', icon: <Users className="w-5 h-5" />, path: '/admin/users' },
  { name: 'Ajustes', icon: <Settings className="w-5 h-5" />, path: '/settings' }
];

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <motion.aside
      animate={{ width: isOpen ? 64 : 16 }}
      className="bg-gray-950/80 backdrop-blur-lg border-r border-gray-800 min-h-screen flex flex-col transition-all duration-300 relative"
    >
      {/* Toggle Button */}
      <div className="flex justify-end p-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="p-1"
        >
          <Menu className="w-5 h-5 text-yellow-400" />
        </Button>
      </div>

      {/* Items */}
      <nav className="mt-6 flex flex-col gap-2 px-2">
        {sidebarItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
               ${isActive ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-300 hover:bg-gray-800/40 hover:text-white'}`
            }
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-3"
            >
              {item.icon}
              {isOpen && <span className="font-medium">{item.name}</span>}
            </motion.div>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto p-4">
        <Button
          variant="outline"
          size="md"
          className="w-full flex items-center justify-center gap-2 text-yellow-400"
        >
          <LogOut className="w-5 h-5" />
          {isOpen && 'Cerrar Sesión'}
        </Button>
      </div>
    </motion.aside>
  );
};
