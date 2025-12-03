import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import Button from '../components/ui/Button';

// ==================== TYPES ====================
interface StatCard {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
}

interface Activity {
  id: number;
  user: string;
  action: string;
  time: string;
  icon: React.ReactNode;
  color: string;
}

// ==================== COMPONENTS ====================
const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-700/50 rounded ${className}`} />
);

const StatsCard = ({ stat, index }: { stat: StatCard; index: number }) => {
  const isPositive = stat.change >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
          {stat.icon}
        </div>
        <div
          className={`flex items-center gap-1 text-sm font-medium ${
            isPositive ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          {Math.abs(stat.change)}%
        </div>
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
      <p className="text-sm text-gray-400">{stat.title}</p>
    </motion.div>
  );
};

const RecentActivity = ({ activities, isLoading }: { activities: Activity[]; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
        >
          <div className={`w-10 h-10 rounded-full ${activity.color} flex items-center justify-center shrink-0`}>
            {activity.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate">{activity.user}</p>
            <p className="text-sm text-gray-400 truncate">{activity.action}</p>
          </div>
          <span className="text-xs text-gray-500 whitespace-nowrap">{activity.time}</span>
        </motion.div>
      ))}
    </div>
  );
};

const Sidebar = ({
  isOpen,
  onClose,
  currentPath,
  onNavigate,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
}) => {
  const items = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: <Calendar className="w-5 h-5" />, label: 'Reservas', path: '/admin/reservations', badge: '12' },
    { icon: <Users className="w-5 h-5" />, label: 'Usuarios', path: '/admin/users' },
  ];

  return (
    <>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -280 }}
        className="fixed lg:sticky top-0 left-0 h-screen w-70 bg-gray-900 border-r border-gray-800 z-50 lg:z-0 flex flex-col"
        style={{ width: '280px' }}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Panel Admin</h2>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {items.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <motion.button
                key={item.path}
                onClick={() => {
                  onNavigate(item.path);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                  isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                whileHover={{ x: isActive ? 0 : 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="shrink-0">{item.icon}</span>
                <span className="flex-1 font-medium">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-4 h-4" />}
              </motion.button>
            );
          })}
        </nav>
      </motion.aside>
    </>
  );
};

// ==================== MAIN DASHBOARD ====================
export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('/admin/dashboard');

  const stats: StatCard[] = [
    { title: 'Total Reservas', value: '248', change: 12.5, icon: <Calendar className="w-6 h-6 text-blue-400" />, color: 'bg-blue-500/20' },
    { title: 'Usuarios Activos', value: '1,845', change: 8.2, icon: <Users className="w-6 h-6 text-green-400" />, color: 'bg-green-500/20' },
    { title: 'Pendientes', value: '42', change: -3.1, icon: <Clock className="w-6 h-6 text-yellow-400" />, color: 'bg-yellow-500/20' },
    { title: 'Tasa Confirmación', value: '94.2%', change: 5.8, icon: <TrendingUp className="w-6 h-6 text-purple-400" />, color: 'bg-purple-500/20' },
  ];

  const recentActivities: Activity[] = [
    { id: 1, user: 'Juan Pérez', action: 'Creó una nueva reserva para 4 personas', time: 'Hace 5 min', icon: <CheckCircle className="w-5 h-5 text-green-400" />, color: 'bg-green-500/20' },
    { id: 2, user: 'María González', action: 'Canceló su reserva del 15/12', time: 'Hace 12 min', icon: <XCircle className="w-5 h-5 text-red-400" />, color: 'bg-red-500/20' },
    { id: 3, user: 'Carlos Rodríguez', action: 'Se registró en el sistema', time: 'Hace 25 min', icon: <Users className="w-5 h-5 text-blue-400" />, color: 'bg-blue-500/20' },
    { id: 4, user: 'Ana Martínez', action: 'Confirmó su reserva para el 20/12', time: 'Hace 1 hora', icon: <CheckCircle className="w-5 h-5 text-green-400" />, color: 'bg-green-500/20' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-900 to-gray-800 flex">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} currentPath={currentPath} onNavigate={setCurrentPath} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <nav className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                  <Menu className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg" />
                  <span className="text-xl font-bold text-white hidden sm:block">RestaurantApp</span>
                </div>
              </div>
              <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-full" />
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
              <p className="text-gray-400">Bienvenido al panel de administración</p>
            </div>

            {/* Stats Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                  <StatsCard key={stat.title} stat={stat} index={index} />
                ))}
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Actividad Reciente</h2>
                <Button variant="ghost" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  Ver todo
                </Button>
              </div>
              <RecentActivity activities={recentActivities} isLoading={isLoading} />
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
