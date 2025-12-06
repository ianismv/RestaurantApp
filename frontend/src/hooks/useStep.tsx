import { useState, useCallback } from 'react';
import { Step } from './useReservations';

export function useStep(initialStep: Step = 'search') {
  const [step, setStep] = useState<Step>(initialStep);

  const goNext = useCallback(() => {
    setStep(prev => {
      switch(prev) {
        case 'search': return 'select';
        case 'select': return 'confirm';
        case 'confirm': return 'dishes';
        default: return prev;
      }
    });
  }, []);

  const goBack = useCallback(() => {
    setStep(prev => {
      switch(prev) {
        case 'select': return 'search';
        case 'confirm': return 'select';
        case 'dishes': return 'confirm';
        default: return prev;
      }
    });
  }, []);

  return { step, goNext, goBack, setStep };
}
