// src/components/layout/DashboardLayout.tsx (Anteriormente AdminLayout.tsx)

import { Outlet } from 'react-router-dom';
// Asegúrate de que Navbar y Sidebar son los correctos
import Navbar from './Navbar'; 
import {Sidebar} from './Sidebar';

/**
 * Este layout se aplica a todas las rutas privadas que requieren el sidebar 
 * (tanto para Admin como para User).
 * El router decide qué contenido (Outlet) se renderiza.
 */
export const DashboardLayout = () => {
    return (
        <div className="min-h-screen bg-zinc-950">
            {/* La Navbar superior debe ser full-width y fija,
              La Sidebar debe ser fija y con un offset de la Navbar.
            */}
            <header className="fixed top-0 w-full z-30">
                {/* Usamos el Navbar que diseñaste, 
                  aunque puede que quieras un Navbar diferente 
                  para el dashboard (ej. más simple). Lo mantengo por ahora.
                */}
                <Navbar /> 
            </header>

            {/* Sidebar (fija, visible en pantallas grandes) */}
            <aside className="fixed inset-y-0 left-0 z-20 w-64 pt-16 hidden lg:block bg-zinc-900 border-r border-zinc-800">
                <Sidebar />
            </aside>
            
            {/* Contenido Principal: pt-16 compensa la Navbar, lg:pl-64 compensa la Sidebar */}
            <main className="lg:pl-64 pt-16">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Aquí se renderiza la página (AdminDashboardPage o ReservationPage) */}
                    <Outlet />
                </div>
            </main>
        </div>
    );
};