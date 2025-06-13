
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLogo from '@/components/shared/AppLogo';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/shared/Icons'; // Assuming an Icons component for Google icon

const LoginPage = () => {
  const { signInWithGoogle, loading: authLoading, user } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (user) {
      router.replace('/dashboard'); // Or onboarding if not completed
    }
  }, [user, router]);

  const handleSignIn = async () => {
    await signInWithGoogle();
    // Router push is handled within signInWithGoogle based on onboarding status
  };

  if (authLoading || user) {
    // Show a loading spinner or skeleton screen while checking auth or redirecting
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <AppLogo size="large" />
          </div>
          <CardTitle className="font-headline text-2xl text-card-foreground">Welcome to Lunara</CardTitle>
          <CardDescription className="text-card-foreground/80">
            Your personal AI guide to understanding and enhancing your fertility journey.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button 
            onClick={handleSignIn} 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={authLoading}
            aria-label="Sign in with Google"
          >
            {authLoading ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.google className="mr-2 h-5 w-5" />
            )}
            Sign in with Google
          </Button>
          <p className="text-center text-xs text-muted-foreground px-4">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
