
"use client";

import type { User as FirebaseUser } from 'firebase/auth'; // Assuming Firebase is used
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Mock User type, actual FirebaseUser would be more complex
export interface User extends Partial<FirebaseUser> {
  id: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock auth functions - replace with actual Firebase calls
const mockSignInWithGoogle = async (): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
  const mockUser: User = {
    id: 'mock-user-id',
    email: 'user@example.com',
    displayName: 'Mock User',
    photoURL: 'https://placehold.co/100x100.png',
  };
  localStorage.setItem('lunara-user', JSON.stringify(mockUser));
  return mockUser;
};

const mockSignOut = async (): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  localStorage.removeItem('lunara-user');
};

const getMockUserFromStorage = (): User | null => {
  if (typeof window === 'undefined') return null;
  const storedUser = localStorage.getItem('lunara-user');
  return storedUser ? JSON.parse(storedUser) : null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = getMockUserFromStorage();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const signedInUser = await mockSignInWithGoogle();
      setUser(signedInUser);
      // Check if onboarding is complete, if not, redirect. This logic can be refined.
      const onboardingComplete = localStorage.getItem('lunara-onboarding-complete') === 'true';
      if (!onboardingComplete) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error("Sign in failed", error);
      // Handle error (e.g., show toast)
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await mockSignOut();
      setUser(null);
      localStorage.removeItem('lunara-onboarding-complete'); // Clear onboarding status on sign out
      router.push('/login');
    } catch (error) {
      console.error("Sign out failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
