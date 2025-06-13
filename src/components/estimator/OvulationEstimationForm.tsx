
"use client";

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { estimateTimeToOvulation, EstimateTimeToOvulationInput, EstimateTimeToOvulationOutput } from '@/ai/flows/estimate-ovulation-flow';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

const estimationSchema = z.object({
  additionalCycleData: z.string().optional().describe("BBT, ovulation test results, symptoms, etc."),
});

type EstimationFormData = z.infer<typeof estimationSchema>;

export default function OvulationEstimationForm() {
  const { cycleData, isOnboardingComplete } = useOnboarding();
  const [estimationResult, setEstimationResult] = useState<EstimateTimeToOvulationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const { control, handleSubmit, reset } = useForm<EstimationFormData>({
    resolver: zodResolver(estimationSchema),
  });

  const onSubmit = async (data: EstimationFormData) => {
    if (!cycleData) {
      setError("Please complete your onboarding first to provide basic cycle data.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setEstimationResult(null);

    const baseCycleInfo = `Last period started on ${new Date(cycleData.lastPeriodDate).toLocaleDateString()}. Average cycle length is ${cycleData.averageCycleLength} days. Average period length is ${cycleData.averagePeriodLength} days.`;
    const fullCycleData = `${baseCycleInfo} ${data.additionalCycleData || ''}`.trim();

    try {
      const input: EstimateTimeToOvulationInput = { cycleData: fullCycleData };
      const result = await estimateTimeToOvulation(input);
      setEstimationResult(result);
    } catch (err) {
      console.error("Ovulation estimation error:", err);
      setError("Failed to estimate ovulation. The AI model might be temporarily unavailable. Please try again later.");
      toast({
        title: "Estimation Error",
        description: "Could not estimate ovulation time. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOnboardingComplete) {
     return (
        <Alert variant="default" className="bg-accent text-accent-foreground border-accent-foreground/30">
          <Info className="h-4 w-4" />
          <AlertTitle>Onboarding Required</AlertTitle>
          <AlertDescription>
            Please complete your onboarding process to use the ovulation estimator. This provides the basic data needed for estimation.
          </AlertDescription>
        </Alert>
     );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl text-card-foreground">Estimate Your Ovulation</CardTitle>
          <CardDescription className="text-card-foreground/80">
            Provide any additional cycle data like BBT, ovulation test results, or symptoms for a more accurate estimation. Your basic cycle data from onboarding will be automatically included.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="additionalCycleData" className="text-card-foreground">Additional Cycle Data (Optional)</Label>
              <Controller
                name="additionalCycleData"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="additionalCycleData"
                    placeholder="e.g., BBT today was 36.7°C, positive ovulation test yesterday, noticed fertile cervical mucus..."
                    rows={4}
                    {...field}
                    className="bg-input text-foreground placeholder:text-muted-foreground"
                  />
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {isLoading ? 'Estimating...' : 'Estimate Ovulation'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {isLoading && (
        <Card className="shadow-md">
          <CardHeader><CardTitle className="text-card-foreground">Estimation in Progress...</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {estimationResult && !isLoading && (
        <Card className="shadow-xl bg-gradient-to-br from-primary/20 to-accent/20 border-primary/50">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-foreground flex items-center">
              <CheckCircle2 className="h-6 w-6 mr-2 text-green-600" />
              Ovulation Estimation Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-foreground/90">
            <p>
              <strong>Estimated Time to Ovulation:</strong> {estimationResult.timeToOvulationDays} days
            </p>
            <p>
              <strong>Confidence Level:</strong> 
              <span className={`font-semibold ml-1 px-2 py-0.5 rounded-full text-xs ${
                estimationResult.confidenceLevel.toLowerCase() === 'high' ? 'bg-green-200 text-green-800' :
                estimationResult.confidenceLevel.toLowerCase() === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                'bg-red-200 text-red-800'
              }`}>
                {estimationResult.confidenceLevel}
              </span>
            </p>
            <div>
              <strong className="block mb-1">Personalized Tips:</strong>
              <p className="text-sm bg-background/50 p-3 rounded-md border border-border">
                {estimationResult.additionalTips.split('\n').map((tip, index) => <span key={index}>{tip}<br/></span>)}
              </p>
            </div>
          </CardContent>
          <CardFooter>
             <Button variant="outline" onClick={() => { setEstimationResult(null); reset(); }} className="text-foreground">
                Make a new estimation
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
