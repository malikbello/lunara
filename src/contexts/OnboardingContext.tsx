
"use client";

import type { UserCycleData } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface OnboardingContextType {
  isOnboardingComplete: boolean;
  cycleData: UserCycleData | null;
  completeOnboarding: (data: UserCycleData) => void;
  updateCycleData: (data: UserCycleData) => void;
  loading: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [cycleData, setCycleData] = useState<UserCycleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedOnboardingStatus = localStorage.getItem('lunara-onboarding-complete') === 'true';
      const storedCycleData = localStorage.getItem('lunara-cycle-data');
      
      setIsOnboardingComplete(storedOnboardingStatus);
      if (storedCycleData) {
        setCycleData(JSON.parse(storedCycleData));
      }
      setLoading(false);
    }
  }, []);

  const completeOnboarding = (data: UserCycleData) => {
    localStorage.setItem('lunara-onboarding-complete', 'true');
    localStorage.setItem('lunara-cycle-data', JSON.stringify(data));
    setIsOnboardingComplete(true);
    setCycleData(data);
  };
  
  const updateCycleData = (data: UserCycleData) => {
    localStorage.setItem('lunara-cycle-data', JSON.stringify(data));
    setCycleData(data);
  };

  return (
    <OnboardingContext.Provider value={{ isOnboardingComplete, cycleData, completeOnboarding, updateCycleData, loading }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
