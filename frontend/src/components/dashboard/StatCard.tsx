import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import type { StatCardConfig } from '@/config/dashboardTheme';
import { fadeInUp } from '@/components/ui/page-transition';

interface StatCardProps {
  config: StatCardConfig;
  value: number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

export function StatCard({ config, value, trend, subtitle }: StatCardProps) {
  const { title, icon: Icon, href, color, bgColor, hoverBg, gradient } = config;

  return (
    <motion.div variants={fadeInUp} className="h-full">
      <Link to={href} className="block h-full">
        <div
          className={`stat-card group cursor-pointer h-full relative overflow-hidden transition-all duration-300 ${hoverBg}`}
        >
          {/* Gradient Background */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
          />

          {/* Content */}
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <motion.div
                className={`h-14 w-14 rounded-xl ${bgColor} flex items-center justify-center shadow-sm`}
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <Icon className={`h-7 w-7 ${color}`} />
              </motion.div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
            </div>

            {/* Value */}
            <div className="mb-2">
              <div className="flex items-end gap-2">
                <p className="text-4xl font-bold tracking-tight">{value}</p>
                {trend && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-1 text-sm font-medium mb-1 ${
                      trend.isPositive
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {trend.isPositive ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span>{Math.abs(trend.value)}%</span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Title and Subtitle */}
            <p className="text-sm font-medium text-foreground/90">{title}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>

          {/* Hover Effect Border */}
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/20 rounded-2xl transition-colors duration-300" />
        </div>
      </Link>
    </motion.div>
  );
}