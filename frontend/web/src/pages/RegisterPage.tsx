// RegisterPage.tsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChefHat } from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { RegisterForm } from '../features/auth/components/RegisterForm';

export const RegisterPage = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-linear-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center px-4 py-16">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center gap-2 mb-8 group">
            <ChefHat className="w-10 h-10 text-blue-400 group-hover:rotate-12 transition-transform duration-500" />
            <span className="text-2xl font-bold text-white">RestaurantApp</span>
          </Link>

          {/* Register Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <RegisterForm />
          </motion.div>

          {/* Info Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-4 bg-gray-800/30 rounded-lg border border-gray-700 text-center"
          >
            <p className="text-xs text-gray-500 mb-2">
              Al registrarte, aceptás nuestros términos y condiciones
            </p>
            <div className="text-xs text-gray-400">
              <p>✨ Creá tu cuenta en segundos y comenzá a reservar</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </PageWrapper>
  );
};