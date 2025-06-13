
"use client";

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { UserCycleData } from '@/lib/types';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const onboardingSchema = z.object({
  lastPeriodDate: z.date({ required_error: "Please select the first day of your last period." }),
  averageCycleLength: z.coerce.number().min(15, "Cycle length must be at least 15 days.").max(60, "Cycle length cannot exceed 60 days."),
  averagePeriodLength: z.coerce.number().min(1, "Period length must be at least 1 day.").max(15, "Period length cannot exceed 15 days."),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const OnboardingForm = () => {
  const { completeOnboarding } = useOnboarding();
  const router = useRouter();
  const { toast } = useToast();

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      averageCycleLength: 28,
      averagePeriodLength: 5,
    },
  });

  const onSubmit = (data: OnboardingFormData) => {
    const cycleData: UserCycleData = {
      ...data,
      lastPeriodDate: data.lastPeriodDate.toISOString(),
    };
    completeOnboarding(cycleData);
    toast({
      title: "Onboarding Complete!",
      description: "Welcome to Lunara. Your journey starts now.",
    });
    router.push('/dashboard');
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-card-foreground">Tell Us About Your Cycle</CardTitle>
        <CardDescription className="text-card-foreground/80">
          This information helps Lunara personalize your experience. You can update it later in settings.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="lastPeriodDate" className="text-card-foreground">First Day of Last Period</Label>
            <Controller
              name="lastPeriodDate"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal border-input hover:bg-accent/50",
                        !field.value && "text-muted-foreground"
                      )}
                      aria-label="Select last period date"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-popover text-popover-foreground">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.lastPeriodDate && <p className="text-sm text-destructive">{errors.lastPeriodDate.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="averageCycleLength" className="text-card-foreground">Average Cycle Length (days)</Label>
            <Controller
              name="averageCycleLength"
              control={control}
              render={({ field }) => <Input id="averageCycleLength" type="number" placeholder="e.g., 28" {...field} className="bg-input text-foreground placeholder:text-muted-foreground" />}
            />
            {errors.averageCycleLength && <p className="text-sm text-destructive">{errors.averageCycleLength.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="averagePeriodLength" className="text-card-foreground">Average Period Length (days)</Label>
            <Controller
              name="averagePeriodLength"
              control={control}
              render={({ field }) => <Input id="averagePeriodLength" type="number" placeholder="e.g., 5" {...field} className="bg-input text-foreground placeholder:text-muted-foreground" />}
            />
            {errors.averagePeriodLength && <p className="text-sm text-destructive">{errors.averagePeriodLength.message}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Complete Onboarding'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default OnboardingForm;

