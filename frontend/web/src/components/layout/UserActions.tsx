// src/components/layout/UserActions.tsx

import React from 'react';
import { LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // ⭐ IMPORTANTE: Necesitamos el hook del Router

import  Button  from '@/components/ui/Button'; 
import { useAuthStore } from '@/features/auth/stores/authStore'; // Usar el store que nos pasaste

interface UserActionsProps {
    role: 'Admin' | 'User';
}

export const UserActions: React.FC<UserActionsProps> = ({ role }) => {
    // ⭐ OBTENER LA FUNCIÓN LOGOUT Y NAVIGATE ⭐
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    
    const textColor = role === 'Admin' ? 'text-blue-400' : 'text-green-400';
    const roleText = role === 'Admin' ? 'Admin' : 'Cliente';
    const firstName = user?.name?.split(' ')[0] || roleText;

    const handleLogoutClick = () => {
        logout(); // 1. Limpia el estado en Zustand
        navigate('/'); // 2. ⭐ REDIRIGE inmediatamente al Homepage público
    };

    return (
        <motion.div 
            className="flex items-center space-x-3 md:space-x-4 ml-auto"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
        >
            <span className={`hidden sm:inline-flex text-sm font-light text-zinc-400 items-center`}>
                Hola, 
                <span className={`font-semibold ml-1 ${textColor}`}>
                    {firstName}
                </span>
            </span>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                    variant="danger" 
                    size="sm"
                    onClick={handleLogoutClick} // ⭐ USAR el nuevo handler
                    className="font-medium text-sm px-3 sm:px-4"
                    leftIcon={<LogOut className="h-4 w-4" />}
                >
                    Salir
                </Button>
            </motion.div>
        </motion.div>
    );
};