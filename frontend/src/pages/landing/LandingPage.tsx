import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Utensils, Star, ArrowRight, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageTransition, staggerContainer, fadeInUp } from '@/components/ui/page-transition';
import { useAuthStore } from '@/stores/authStore';
import { useState } from 'react';

export default function LandingPage() {
  const { user } = useAuthStore();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <PageTransition>
      <div
        className="min-h-screen overflow-hidden relative"
        onMouseMove={(e) =>
          setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight })
        }
        style={{
          background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, #fff9c4, #ffecb3, #ffe082)`,
          transition: 'background 0.15s',
        }}
      >
        {/* Header */}
        <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/30 border-b border-border/20 shadow-lg">
          <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 relative">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">🍽️</span>
              <span className="font-display text-xl font-semibold gradient-text">RestaurantApp</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-4">
              {!user ? (
                <>
                  <Link to="/login">
                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="btn-glow">Registrarme</Button>
                  </Link>
                </>
              ) : user.role === 'Admin' ? (
                <Link to="/admin">
                  <Button className="bg-primary text-white hover:bg-primary-dark btn-glow">
                    Admin Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/reservations">
                  <Button className="btn-glow">Mis reservas</Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-white/40 rounded-lg transition-all"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menú móvil"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Mobile Dropdown */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-16 right-4 left-4 bg-white/95 backdrop-blur-md rounded-lg shadow-lg flex flex-col gap-2 p-4 md:hidden z-50"
                >
                  {!user ? (
                    <>
                      <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-center py-2">
                          Iniciar Sesión
                        </Button>
                      </Link>
                      <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full btn-glow py-2">Registrarme</Button>
                      </Link>
                    </>
                  ) : user.role === 'Admin' ? (
                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-primary text-white hover:bg-primary-dark btn-glow py-2">
                        Admin Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/reservations" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full btn-glow py-2">Mis reservas</Button>
                    </Link>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
          {/* Background blobs */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
            <div
              className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-float"
              style={{ animationDelay: '-3s' }}
            />
          </div>

          <div className="container relative z-10 text-center max-w-4xl mx-auto">
            <motion.div variants={staggerContainer} initial="hidden" animate="show">
              <motion.div variants={fadeInUp} className="mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <Star className="h-4 w-4" />
                  Sistema de Reservas Premium
                </span>
              </motion.div>

              <motion.h1 variants={fadeInUp} className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
                <span className="gradient-text">Reserva</span>
                <br />
                <span className="text-foreground">tu experiencia</span>
              </motion.h1>

              <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
                Gestiona tus reservas de manera elegante y sencilla. La mejor experiencia gastronómica comienza aquí.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button size="lg" className="btn-glow text-lg px-8 py-6 group">
                    Comenzar ahora
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                    Ya tengo cuenta
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24">
          <div className="container">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">¿Por qué elegirnos?</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Una plataforma diseñada para brindarte la mejor experiencia en reservas
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Calendar, title: 'Reservas Instantáneas', description: 'Reserva tu mesa en segundos con disponibilidad en tiempo real' },
                { icon: Clock, title: 'Gestión Flexible', description: 'Modifica o cancela tus reservas cuando lo necesites' },
                { icon: Utensils, title: 'Experiencia Premium', description: 'Interfaz elegante diseñada para una experiencia única' },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="glass-card-hover rounded-2xl p-8 text-center shadow-md hover:shadow-xl transition"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="glass-card rounded-3xl p-12 md:p-16 text-center relative overflow-hidden shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-amber-500/5 to-primary/5" />
              <div className="relative z-10">
                <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">¿Listo para comenzar?</h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                  Únete a nuestra plataforma y disfruta de la forma más elegante de gestionar tus reservas
                </p>
                <Link to="/register">
                  <Button size="lg" className="btn-glow text-lg px-8 py-6">
                    Crear cuenta gratis
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-border/50">
          <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🍽️</span>
              <span className="font-display font-semibold gradient-text">RestaurantApp</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2024 RestaurantApp. Todos los derechos reservados.</p>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}
