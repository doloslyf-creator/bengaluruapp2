import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface OnboardingContextType {
  isOnboardingActive: boolean;
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
  skipOnboarding: () => void;
  restartOnboarding: () => void;
  isStepActive: (stepId: string) => boolean;
  completeOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

interface OnboardingProviderProps {
  children: ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  // Define onboarding steps for different pages
  const onboardingSteps = {
    'find-property': [
      'property-type-select',
      'zone-select', 
      'budget-slider',
      'bhk-selection',
      'find-button'
    ],
    'property-results': [
      'filters-button',
      'sort-dropdown',
      'view-toggle',
      'property-card',
      'book-visit-button'
    ],
    'book-visit': [
      'property-details',
      'contact-form',
      'date-picker',
      'submit-booking'
    ],
    'consultation': [
      'consultation-type',
      'urgency-select',
      'contact-details',
      'submit-consultation'
    ]
  };

  const totalSteps = Object.values(onboardingSteps).flat().length;

  useEffect(() => {
    // Check if user has seen onboarding before
    const hasSeenBefore = localStorage.getItem('onboarding-completed');
    if (!hasSeenBefore) {
      // Start onboarding for first-time users
      const timer = setTimeout(() => {
        setIsOnboardingActive(true);
      }, 1000); // Delay to let page load
      return () => clearTimeout(timer);
    }
    setHasSeenOnboarding(true);
  }, []);

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const skipOnboarding = () => {
    setIsOnboardingActive(false);
    localStorage.setItem('onboarding-completed', 'true');
    setHasSeenOnboarding(true);
  };

  const completeOnboarding = () => {
    setIsOnboardingActive(false);
    localStorage.setItem('onboarding-completed', 'true');
    setHasSeenOnboarding(true);
  };

  const restartOnboarding = () => {
    setCurrentStep(0);
    setIsOnboardingActive(true);
    localStorage.removeItem('onboarding-completed');
    setHasSeenOnboarding(false);
  };

  const isStepActive = (stepId: string): boolean => {
    if (!isOnboardingActive) return false;
    
    // Find which page and step index this stepId belongs to
    let globalStepIndex = 0;
    for (const [page, steps] of Object.entries(onboardingSteps)) {
      const stepIndex = steps.indexOf(stepId);
      if (stepIndex !== -1) {
        return globalStepIndex + stepIndex === currentStep;
      }
      globalStepIndex += steps.length;
    }
    return false;
  };

  const value: OnboardingContextType = {
    isOnboardingActive,
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    skipOnboarding,
    restartOnboarding,
    isStepActive,
    completeOnboarding,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}