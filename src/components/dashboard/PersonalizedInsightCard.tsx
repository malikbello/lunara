
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { personalizedInsights, PersonalizedInsightsInput } from '@/ai/flows/personalized-insights'; // Adjust path as needed
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Lightbulb, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function PersonalizedInsightCard() {
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { cycleData } = useOnboarding();
  const { toast } = useToast();

  const fetchInsight = async () => {
    if (!cycleData) {
      // Potentially set insight to a default message or leave null
      setInsight("Please complete onboarding to get personalized insights.");
      return;
    }
    setIsLoading(true);
    try {
      // Mock mood data for now. In a real app, this would come from user logs.
      const moodData = "User reported feeling energetic and positive recently.";
      const input: PersonalizedInsightsInput = {
        cycleData: `Last period: ${cycleData.lastPeriodDate}, Cycle length: ${cycleData.averageCycleLength} days, Period length: ${cycleData.averagePeriodLength} days.`,
        moodData: moodData,
      };
      const result = await personalizedInsights(input);
      setInsight(result.insights);
    } catch (error) {
      console.error("Failed to fetch personalized insight:", error);
      toast({
        title: "Error",
        description: "Could not fetch personalized insights. Please try again.",
        variant: "destructive",
      });
      setInsight("Could not load insights at this time. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsight();
  }, [cycleData]); // Re-fetch if cycleData changes

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="font-headline text-xl text-card-foreground">Daily Insight</CardTitle>
          <CardDescription className="text-card-foreground/80">Personalized tip for your day.</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={fetchInsight} disabled={isLoading} aria-label="Refresh insight">
          {isLoading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : insight ? (
          <div className="flex items-start space-x-3">
            <Lightbulb className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-1" />
            <p className="text-sm text-card-foreground leading-relaxed">{insight}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No insights available at the moment.</p>
        )}
      </CardContent>
    </Card>
  );
}
