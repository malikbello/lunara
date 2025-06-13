
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext'; // Placeholder, actual Firebase Auth would be used
import { OnboardingProvider } from '@/contexts/OnboardingContext';

export const metadata: Metadata = {
  title: 'Lunara: AI Fertility Companion',
  description: 'Your personal AI guide to understanding and enhancing your fertility journey.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <OnboardingProvider>
            {children}
            <Toaster />
          </OnboardingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
