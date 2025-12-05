// src/layouts/RootLayout.tsx (Nuevo)
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthStore } from "@/features/auth/stores/authStore";
import { Navbar } from "../components/layout/Navbar"; // <-- ¡EL COMPONENTE ÚNICO!
//import { Footer } from "../components/common/Footer"; // Suponiendo que tienes un Footer

export const RootLayout: React.FC = () => {
    const { isAuthenticated, user } = useAuthStore();
    
    // Aquí podrías pasarle props a la Navbar si lo necesita (rol, nombre, etc.)
    const userRole = user?.role || "Guest";

    return (
        <div className="flex flex-col min-h-screen">
            {/* 1. Navbar Única para toda la App */}
            <Navbar userRole={userRole} isAuthenticated={isAuthenticated} />
            
            {/* 2. Contenido de las páginas */}
            <main className="grow">
                <Outlet />
            </main>
            
            {/* 3. Footer único (Opcional) */}
            {/* <Footer /> */}
        </div>
    );
};