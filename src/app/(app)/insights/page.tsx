
"use client";

import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { personalizedInsights, PersonalizedInsightsInput } from '@/ai/flows/personalized-insights';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Lightbulb, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

export default function InsightsPage() {
  const [insights, setInsights] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { cycleData, isOnboardingComplete } = useOnboarding();
  const { toast } = useToast();

  const fetchInsights = async (count = 3) => {
    if (!cycleData) {
      setInsights(["Please complete onboarding to get personalized insights."]);
      return;
    }
    setIsLoading(true);
    setInsights([]);
    try {
      const moodData = "User has logged varied moods recently, including stress and happiness."; // Example mood data
      const fetchedInsights: string[] = [];
      for (let i = 0; i < count; i++) {
        // Slightly vary input for potentially different insights if desired, or use fixed input
        const input: PersonalizedInsightsInput = {
          cycleData: `Last period: ${cycleData.lastPeriodDate}, Cycle length: ${cycleData.averageCycleLength} days, Period length: ${cycleData.averagePeriodLength} days. Current day of cycle: (calc based on today). Insight request #${i+1}`,
          moodData: moodData,
        };
        const result = await personalizedInsights(input);
        fetchedInsights.push(result.insights);
      }
      setInsights(fetchedInsights);
    } catch (error) {
      console.error("Failed to fetch personalized insights:", error);
      toast({
        title: "Error",
        description: "Could not fetch personalized insights. Please try again.",
        variant: "destructive",
      });
      setInsights(["Could not load insights at this time. Please try again."]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOnboardingComplete) {
      fetchInsights();
    } else {
       setInsights([]); // Clear insights if not onboarded
    }
  }, [cycleData, isOnboardingComplete]);

   if (!isOnboardingComplete && !isLoading) { // Check loading to prevent flash of this message
     return (
        <div className="space-y-6">
            <PageHeader
                title="My Personalized Insights"
                description="Unlock AI-generated insights tailored to your unique cycle and well-being."
            />
            <Alert variant="default" className="bg-accent text-accent-foreground border-accent-foreground/30">
            <Info className="h-4 w-4" />
            <AlertTitle>Onboarding Required</AlertTitle>
            <AlertDescription>
                Please complete your onboarding process to receive personalized insights.
            </AlertDescription>
            </Alert>
        </div>
     );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Personalized Insights"
        description="Unlock AI-generated insights tailored to your unique cycle and well-being."
        actions={
          <Button onClick={() => fetchInsights()} disabled={isLoading || !isOnboardingComplete} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh Insights
          </Button>
        }
      />

      {isLoading && (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="shadow-md">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-1" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && insights.length > 0 && (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {insights.map((insight, index) => (
            <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="font-headline text-lg text-card-foreground flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-yellow-400" />
                  Insight #{index + 1}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-card-foreground leading-relaxed">{insight}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {!isLoading && insights.length === 0 && isOnboardingComplete && (
         <Card className="shadow-md">
            <CardContent className="p-6 text-center text-card-foreground">
                <p>No insights generated yet. Click "Refresh Insights" to get started.</p>
            </CardContent>
         </Card>
      )}
    </div>
  );
}
