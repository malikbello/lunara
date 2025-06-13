
"use client";

import React from 'react';
import OnboardingForm from '@/components/auth/OnboardingForm';
import AppLogo from '@/components/shared/AppLogo';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useRouter } from 'next/navigation';

const OnboardingPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { isOnboardingComplete, loading: onboardingLoading } = useOnboarding();
  const router = useRouter();

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    } else if (user && !onboardingLoading && isOnboardingComplete) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, isOnboardingComplete, onboardingLoading, router]);

  if (authLoading || onboardingLoading || (user && isOnboardingComplete)) {
     return <div className="flex min-h-screen items-center justify-center p-4 bg-background"><p className="text-foreground">Loading...</p></div>;
  }
  
  if (!user && !authLoading) { // Should be caught by layout, but as a fallback
    return <div className="flex min-h-screen items-center justify-center p-4 bg-background"><p className="text-foreground">Redirecting to login...</p></div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 flex flex-col items-center">
      <div className="mb-8 text-center">
        <AppLogo size="large" className="text-primary mb-2" />
        <h1 className="text-3xl font-headline font-semibold text-foreground">Welcome to Lunara!</h1>
        <p className="text-muted-foreground mt-2">Let's get started by setting up your profile.</p>
      </div>
      <OnboardingForm />
    </div>
  );
};

export default OnboardingPage;
