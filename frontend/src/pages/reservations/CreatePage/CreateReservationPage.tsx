import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageTransition, staggerContainer, fadeInUp } from '@/components/ui/page-transition';
import { useReservations } from '@/hooks/useReservations';
import { StepSearch } from './StepSearch';
import { StepSelect } from './StepSelect';
import { StepConfirm } from './StepConfirm';
import { StepDishes } from './StepDishes';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CreateReservationPage() {
  const navigate = useNavigate();
  const form = useReservations();
  const [step, setStep] = useState<'search' | 'select' | 'confirm' | 'dishes'>('search');

  const stepLabels = ['Buscar', 'Seleccionar', 'Confirmar', 'Platos'];

  const stepIndex = ['search', 'select', 'confirm', 'dishes'].indexOf(step);

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold">Nueva Reserva</h1>
          <p className="text-muted-foreground mt-1">Selecciona fecha, hora y número de personas</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4">
          {stepLabels.map((label, index) => {
            const isActive = index === stepIndex;
            const isCompleted = index < stepIndex;

            return (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                    isActive && 'bg-primary text-primary-foreground',
                    isCompleted && 'bg-primary/20 text-primary',
                    !isActive && !isCompleted && 'bg-secondary text-muted-foreground'
                  )}
                >
                  {index + 1}
                </div>
                <span className={cn('text-sm hidden sm:block', isActive ? 'text-foreground font-medium' : 'text-muted-foreground')}>
                  {label}
                </span>
                {index < 3 && <ArrowRight className="h-4 w-4 text-muted-foreground mx-2 hidden sm:block" />}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass-card rounded-2xl p-8"
        >
          {step === 'search' && <StepSearch form={form} onNext={() => setStep('select')} />}
          {step === 'select' && <StepSelect form={form} onNext={() => setStep('confirm')} onBack={() => setStep('search')} />}
          {step === 'confirm' && <StepConfirm form={form} onNext={() => setStep('dishes')} onBack={() => setStep('select')} />}
          {step === 'dishes' && <StepDishes form={form} onNext={() => navigate('/reservations')} onBack={() => setStep('confirm')} />}
        </motion.div>
      </div>
    </PageTransition>
  );
}
