// src/components/layout/Navbar.tsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Utensils, Zap } from 'lucide-react';

import { useAuthStore } from '@/features/auth/stores/authStore';
import Button from '@/components/ui/Button'; 

// Componente simple de enlace de navegación
const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <Link 
        to={to} 
        className="text-zinc-200 hover:text-amber-500 transition-colors font-medium"
    >
        {children}
    </Link>
);


const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        navigate('/'); // Redirigir a la homepage después de cerrar sesión
    };

    // Determinar la ruta a la que debe ir el usuario logueado
    const getDashboardPath = () => {
        // user?.role es seguro porque isAuthenticated es true
        return user?.role === 'Admin' ? '/admin' : '/reservations'; 
    };

    return (
        <header className="py-4 backdrop-blur-md bg-zinc-950/70 border-b border-zinc-800">
            <div className="container mx-auto px-6 flex justify-between items-center">
                
                {/* Logo / Nombre del Restaurante */}
                <Link to="/" className="text-2xl font-bold text-amber-500 flex items-center gap-2">
                    <Utensils className="w-6 h-6" />
                    <span className="hidden sm:inline">RestoApp</span>
                </Link>

                {/* Navegación Principal */}
                <nav className="hidden md:flex gap-8">
                    <NavLink to="/">Inicio</NavLink>
                    <NavLink to="/menu">Menú</NavLink>
                    <NavLink to="/about">Nosotros</NavLink>
                </nav>

                {/* Acciones de Autenticación */}
                <div className="flex items-center gap-3">
                    {isAuthenticated ? (
                        <>
                            {/* Botón para ir al Dashboard/Reservas */}
                            <Link to={getDashboardPath()}>
                                <Button 
                                    variant="outline" 
                                    className="border-zinc-500 hover:bg-zinc-800/50 text-zinc-100 hover:text-amber-500"
                                    size="sm"
                                >
                                    {user?.role === 'Admin' ? <Zap className="w-4 h-4 mr-2" /> : <User className="w-4 h-4 mr-2" />}
                                    {user?.name || (user?.role === 'Admin' ? 'Admin' : 'Reservas')}
                                </Button>
                            </Link>
                            
                            {/* Botón de Logout */}
                            <Button 
                                onClick={handleLogout} 
                                variant="danger" 
                                className="bg-red-600 hover:bg-red-700 text-white"
                                size="sm"
                            >
                                <LogOut className="w-4 h-4" />
                            </Button>
                        </>
                    ) : (
                        <>
                            {/* Botones de Login y Registro si NO está logueado */}
                            <Link to="/login">
                                <Button variant="ghost" className="text-zinc-100 hover:bg-zinc-800">
                                    Iniciar Sesión
                                </Button>
                            </Link>
                            <Link to="/register">
                                <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                                    Registrarse
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;