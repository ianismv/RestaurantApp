import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Star, ArrowRight, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageTransition, staggerContainer, fadeInUp } from '@/components/ui/page-transition';

export default function LandingPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background overflow-hidden">
        {/* Navigation */}
        <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30">
          <div className="container flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">🍽️</span>
              <span className="font-display text-xl font-semibold gradient-text">
                RestaurantApp
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link to="/register">
                <Button className="btn-glow">
                  Registrarme
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center pt-16 bg-hero-pattern">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
          </div>

          <div className="container relative z-10 text-center">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="max-w-4xl mx-auto"
            >
              <motion.div variants={fadeInUp} className="mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <Star className="h-4 w-4" />
                  Sistema de Reservas Premium
                </span>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
              >
                <span className="gradient-text">Reserva</span>
                <br />
                <span className="text-foreground">tu experiencia</span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto"
              >
                Gestiona tus reservas de manera elegante y sencilla.
                La mejor experiencia gastronómica comienza aquí.
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

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex items-start justify-center p-1">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-1.5 h-3 bg-primary rounded-full"
              />
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-secondary/30">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
                ¿Por qué elegirnos?
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Una plataforma diseñada para brindarte la mejor experiencia en reservas
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Calendar,
                  title: 'Reservas Instantáneas',
                  description: 'Reserva tu mesa en segundos con disponibilidad en tiempo real',
                },
                {
                  icon: Clock,
                  title: 'Gestión Flexible',
                  description: 'Modifica o cancela tus reservas cuando lo necesites',
                },
                {
                  icon: Utensils,
                  title: 'Experiencia Premium',
                  description: 'Interfaz elegante diseñada para una experiencia única',
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="glass-card-hover rounded-2xl p-8 text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="glass-card rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-amber-500/5 to-primary/5" />
              <div className="relative z-10">
                <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
                  ¿Listo para comenzar?
                </h2>
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
            <p className="text-sm text-muted-foreground">
              © 2024 RestaurantApp. Todos los derechos reservados.
            </p>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}
