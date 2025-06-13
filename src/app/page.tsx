
"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Icons } from '@/components/shared/Icons';

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { isOnboardingComplete, loading: onboardingLoading } = useOnboarding();

  useEffect(() => {
    if (authLoading || onboardingLoading) {
      return; // Wait until loading is false
    }

    if (!user) {
      router.replace('/login');
    } else if (!isOnboardingComplete) {
      router.replace('/onboarding');
    } else {
      router.replace('/dashboard');
    }
  }, [user, isOnboardingComplete, authLoading, onboardingLoading, router]);

  // Display a loading state while determining route
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Icons.spinner className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-lg text-foreground">Loading Lunara...</p>
    </div>
  );
}
