// src/pages/HomePage.tsx

import { Link, useNavigate } from 'react-router-dom';
import React, { useRef, useCallback, useEffect } from 'react';
import {
    motion,
    type Variants,
    useMotionValue,
    useSpring,
    useTransform,
    type MotionValue,
} from 'framer-motion';
import { useAuthStore } from '@/features/auth/stores/authStore';
import Navbar from '@/components/layout/Navbar'; // Importa el Navbar
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';


// ============================================================================
// VARIANTES DE ANIMACIÓN (Sin cambios)
// ============================================================================
const headerStagger: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            delayChildren: 0.3,
            staggerChildren: 0.08,
        },
    },
};

const textReveal: Variants = {
    hidden: { opacity: 0, y: 20, skewY: 5 },
    visible: {
        opacity: 1,
        y: 0,
        skewY: 0,
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

// ============================================================================
// TIPOS & DATA MOCK (Sin cambios)
// ============================================================================
interface Dish {
    title: string;
    price: string;
    img: string;
    tag: string;
}

interface SpotlightReturn {
    transformedX: MotionValue<number>;
    transformedY: MotionValue<number>;
}

const FEATURED_DISHES: Dish[] = [
    {
        title: 'Bife de Chorizo Dry Aged',
        price: '$18.500',
        img: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?auto=format&fit=crop&w=600&q=80',
        tag: 'Firma',
    },
    {
        title: 'Risotto de Hongos Silvestres',
        price: '$14.200',
        img: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=600&q=80',
        tag: 'Veggie',
    },
    {
        title: 'Salmón Patagónico',
        price: '$19.800',
        img: 'https://images.unsplash.com/photo-1467003909585-2f8a7270028d?auto=format&fit=crop&w=600&q=80',
        tag: 'Fresco',
    },
];

// ============================================================================
// HOOK SPOTLIGHT (Sin cambios)
// ============================================================================
const useSpotlight = (ref: React.RefObject<HTMLDivElement | null> ) : SpotlightReturn => {
    // ... (Lógica de useSpotlight sin cambios)
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!ref.current) return;
            const rect = ref.current.getBoundingClientRect();

            mouseX.set(e.clientX - rect.left);
            mouseY.set(e.clientY - rect.top);
        },
        [ref, mouseX, mouseY]
    );

    useEffect(() => {
        const currentRef = ref.current;
        if (currentRef) {
            currentRef.addEventListener('mousemove', handleMouseMove);
        }
        return () => {
            if (currentRef) {
                currentRef.removeEventListener('mousemove', handleMouseMove);
            }
        };
    }, [handleMouseMove, ref]);

    const springConfig = { damping: 100, stiffness: 500, mass: 1 };

    const smoothedX = useSpring(mouseX, springConfig);
    const smoothedY = useSpring(mouseY, springConfig);

    const transformedX = useTransform(smoothedX, (latest) => latest);
    const transformedY = useTransform(smoothedY, (latest) => latest);

    return { transformedX, transformedY };
};

// ============================================================================
// COMPONENTE PRINCIPAL (Lógica Corregida)
// ============================================================================
export const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, hasRole } = useAuthStore();

    const heroRef = useRef<HTMLDivElement>(null);
    const { transformedX, transformedY } = useSpotlight(heroRef);

    /**
     * Define la lógica de redirección del botón principal:
     * - AUTH Admin: /admin
     * - AUTH User: /reservations/new
     * - NO AUTH: /login
     */
    const handlePrimaryAction = () => {
        if (isAuthenticated) {
            if (hasRole('Admin')) {
                navigate('/admin'); 
            } else {
                navigate('/reservations/new'); 
            }
        } else {
            navigate('/login');
        }
    };

    // Obtener el texto del botón basado en el estado
    const getPrimaryButtonText = (isCta = false) => {
        if (isAuthenticated) {
            if (hasRole('Admin')) {
                return isCta ? 'Ir al Dashboard' : 'Gestión de Mesas';
            }
            return isCta ? 'Ir a Reservas' : 'Reservar Mi Mesa';
        }
        return isCta ? 'Crear Cuenta y Reservar' : 'Reservar Ahora';
    };


    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-500/30 flex flex-col">
            {/* Navbar */}
            <div className="absolute top-0 w-full z-50">
                <Navbar />
            </div>

            {/* HERO SECTION CON SPOTLIGHT */}
            <section
                ref={heroRef}
                className="relative h-screen w-full flex items-center justify-center overflow-hidden group"
            >
                {/* Background y Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1514362545857-3bc16549766b?q=80&w=1920&auto=format&fit=crop"
                        alt="Ambiente Restaurante"
                        className="w-full h-full object-cover opacity-50"
                    />
                    {/* Clase corregida: Tailwind usa from-[color] via-[color] to-[color] para gradientes */}
                    <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/60 to-black/40" /> 
                </div>

                {/* SPOTLIGHT EFFECT (Sin cambios) */}
                <motion.div
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-40"
                    style={{
                        background: `radial-gradient(400px circle at ${transformedX.get()}px ${transformedY.get()}px, rgba(255, 255, 255, 0.1), transparent 80%)`,
                    }}
                />

                {/* Contenido Hero */}
                <div className="relative z-10 container mx-auto px-6 text-center pt-20">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={headerStagger}
                        className="flex flex-col items-center gap-6"
                    >
                        {/* ... Título, Badge, Párrafo (sin cambios) ... */}

                        <motion.div
                            variants={textReveal}
                            className="flex flex-col sm:flex-row gap-4 mt-8"
                        >
                            <Button
                                size="lg"
                                className="bg-amber-600 hover:bg-amber-700 text-white px-8 text-lg shadow-lg shadow-amber-900/20 border-none"
                                onClick={handlePrimaryAction}
                            >
                                {getPrimaryButtonText()}
                            </Button>

                            <Link to="/menu">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="border-zinc-500 hover:bg-zinc-800/50 backdrop-blur-sm text-zinc-100 hover:text-white px-8 text-lg hover:border-white transition-all"
                                >
                                    Ver Menú
                                </Button>
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* FEATURED DISHES (Sin cambios relevantes) */}
            <section className="py-24 bg-zinc-950 relative z-10">
                {/* ... Contenido Feature Dishes sin cambios ... */}
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">
                                Destacados del Chef
                            </h2>
                            <p className="text-zinc-400">
                                Una selección curada para esta temporada.
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            className="text-amber-500 hover:text-amber-400 hover:bg-transparent p-0"
                        >
                            Ver todo el menú &rarr;
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {FEATURED_DISHES.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="h-full"
                            >
                                <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden hover:border-amber-500/50 transition-all duration-300 group cursor-pointer h-full flex flex-col hover:shadow-xl hover:shadow-amber-900/10">
                                    <div className="h-56 overflow-hidden relative">
                                        <img
                                            src={item.img}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                                        />
                                        <div className="absolute top-3 right-3">
                                            <Badge className="bg-black/70 backdrop-blur-md text-amber-400 border-none shadow-sm">
                                                {item.tag}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="p-6 flex flex-col grow">
                                        <h3 className="text-xl font-semibold text-zinc-100 mb-2 group-hover:text-amber-500 transition-colors">
                                            {item.title}
                                        </h3>
                                        <div className="mt-auto flex justify-between items-center pt-4 border-t border-zinc-800">
                                            <span className="text-2xl font-light text-zinc-200">
                                                {item.price}
                                            </span>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full w-10 h-10 p-0 flex items-center justify-center"
                                            >
                                                +
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA SECTION (Texto Corregido) */}
            <section className="py-20 bg-zinc-900 border-y border-zinc-800">
                <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                    <div className="order-2 md:order-1">
                        <h2 className="text-3xl font-bold text-white mb-6">
                            Reserva tu momento especial
                        </h2>
                        <p className="text-zinc-400 mb-6 leading-relaxed">
                            Ya sea una cena romántica, una reunión de negocios o una celebración
                            familiar, nuestro sistema de reservas te permite elegir tu mesa favorita
                            en tiempo real.
                        </p>
                        <Button
                            className="bg-white text-black hover:bg-zinc-200 px-8"
                            onClick={handlePrimaryAction}
                        >
                            {getPrimaryButtonText(true)} {/* Usar el texto CTA específico */}
                        </Button>
                    </div>
                    <div className="order-1 md:order-2 relative h-[400px] rounded-2xl overflow-hidden shadow-2xl shadow-black">
                        <img
                            src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80"
                            className="w-full h-full object-cover"
                            alt="Interior Restaurante"
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 text-center text-zinc-600 text-sm bg-black border-t border-zinc-900">
                <p>© 2024 RestaurantApp. Reservas inteligentes.</p>
            </footer>
        </div>
    );
};

export default HomePage;