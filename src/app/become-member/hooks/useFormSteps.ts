import { useState } from 'react';

export type FormStep = 'user' | 'home' | 'images' | 'amenities' | 'submit';

export const useFormSteps = () => {
  const [currentStep, setCurrentStep] = useState<FormStep>('user');
  const steps: FormStep[] = ['user', 'home', 'images', 'amenities', 'submit'];

  const goToNextStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const getProgress = () => {
    return ((steps.indexOf(currentStep) + 1) / steps.length) * 100;
  };

  return {
    currentStep,
    setCurrentStep,
    goToNextStep,
    goToPreviousStep,
    getProgress,
    isFirstStep: currentStep === steps[0],
    isLastStep: currentStep === steps[steps.length - 1],
  };
}; 