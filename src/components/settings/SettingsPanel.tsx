
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Edit3, Save, ActivitySquare, ShieldAlert } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { useOnboarding, OnboardingProvider } from '@/contexts/OnboardingContext'; // Ensure OnboardingProvider is available if this component isn't nested
import type { UserCycleData } from '@/lib/types';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

const cycleDataSchema = z.object({
  lastPeriodDate: z.date({ required_error: "Please select the first day of your last period." }),
  averageCycleLength: z.coerce.number().min(15).max(60),
  averagePeriodLength: z.coerce.number().min(1).max(15),
});
type CycleFormData = z.infer<typeof cycleDataSchema>;

export default function SettingsPanel() {
  const { cycleData, updateCycleData, isOnboardingComplete } = useOnboarding();
  const [isIncognitoMode, setIsIncognitoMode] = useState(false);
  const [googleFitConnected, setGoogleFitConnected] = useState(false);
  const { toast } = useToast();

  const { control, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm<CycleFormData>({
    resolver: zodResolver(cycleDataSchema),
    defaultValues: { // Provide default values to prevent undefined initial state
      lastPeriodDate: new Date(), // Sensible default, will be overridden by reset
      averageCycleLength: 0, // Will be overridden, use 0 or a typical value
      averagePeriodLength: 0, // Will be overridden
    }
  });
  
  useEffect(() => {
    if (cycleData) {
      reset({
        lastPeriodDate: parseISO(cycleData.lastPeriodDate),
        averageCycleLength: cycleData.averageCycleLength,
        averagePeriodLength: cycleData.averagePeriodLength,
      });
    }
    // Load incognito & fit status from localStorage or settings
    setIsIncognitoMode(localStorage.getItem('lunara-incognito') === 'true');
    setGoogleFitConnected(localStorage.getItem('lunara-googlefit-connected') === 'true');

  }, [cycleData, reset]);

  const handleCycleDataUpdate = (data: CycleFormData) => {
    const updatedCycleData: UserCycleData = {
      ...data,
      lastPeriodDate: data.lastPeriodDate.toISOString(),
    };
    updateCycleData(updatedCycleData);
    toast({ title: "Cycle Data Updated", description: "Your cycle information has been saved." });
  };

  const toggleIncognitoMode = () => {
    const newMode = !isIncognitoMode;
    setIsIncognitoMode(newMode);
    localStorage.setItem('lunara-incognito', String(newMode));
    toast({ title: `Incognito Mode ${newMode ? 'Enabled' : 'Disabled'}`, description: newMode ? "Activity will not be logged." : "Activity logging resumed." });
  };

  const toggleGoogleFit = () => {
    // Placeholder for actual Google Fit connection logic
    const newStatus = !googleFitConnected;
    setGoogleFitConnected(newStatus);
    localStorage.setItem('lunara-googlefit-connected', String(newStatus));
    toast({ title: `Google Fit ${newStatus ? 'Connected' : 'Disconnected'}`, description: newStatus ? "Successfully connected to Google Fit." : "Disconnected from Google Fit."});
  };

  if (!isOnboardingComplete && !cycleData) { // Check cycleData too, as it might load slightly after isOnboardingComplete
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline text-card-foreground">Settings Unavailable</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-card-foreground/80">Please complete the onboarding process to access settings.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl text-card-foreground flex items-center"><Edit3 className="mr-2 h-5 w-5"/>Cycle Data</CardTitle>
          <CardDescription className="text-card-foreground/80">Update your menstrual cycle information.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(handleCycleDataUpdate)}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="lastPeriodDateSet" className="text-card-foreground">First Day of Last Period</Label>
               <Controller
                  name="lastPeriodDate"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="lastPeriodDateSet"
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal mt-1 border-input hover:bg-accent/50",
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
              {errors.lastPeriodDate && <p className="text-sm text-destructive mt-1">{errors.lastPeriodDate.message}</p>}
            </div>
            <div>
              <Label htmlFor="averageCycleLengthSet" className="text-card-foreground">Average Cycle Length (days)</Label>
              <Controller
                name="averageCycleLength"
                control={control}
                render={({ field }) => <Input id="averageCycleLengthSet" type="number" {...field} value={field.value ?? ''} className="mt-1 bg-input text-foreground placeholder:text-muted-foreground" />}
              />
              {errors.averageCycleLength && <p className="text-sm text-destructive mt-1">{errors.averageCycleLength.message}</p>}
            </div>
            <div>
              <Label htmlFor="averagePeriodLengthSet" className="text-card-foreground">Average Period Length (days)</Label>
              <Controller
                name="averagePeriodLength"
                control={control}
                render={({ field }) => <Input id="averagePeriodLengthSet" type="number" {...field} value={field.value ?? ''} className="mt-1 bg-input text-foreground placeholder:text-muted-foreground" />}
              />
              {errors.averagePeriodLength && <p className="text-sm text-destructive mt-1">{errors.averagePeriodLength.message}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting || !isDirty} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Save className="mr-2 h-4 w-4"/> {isSubmitting ? "Saving..." : "Save Cycle Data"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl text-card-foreground flex items-center"><ActivitySquare className="mr-2 h-5 w-5"/>Integrations</CardTitle>
          <CardDescription className="text-card-foreground/80">Manage connections to other services.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-md border border-border bg-accent/20">
            <Label htmlFor="google-fit-switch" className="flex flex-col space-y-1">
              <span className="font-medium text-card-foreground">Google Fit</span>
              <span className="text-xs text-muted-foreground">Sync your health data from Google Fit.</span>
            </Label>
            <Switch
              id="google-fit-switch"
              checked={googleFitConnected}
              onCheckedChange={toggleGoogleFit}
              aria-label="Toggle Google Fit connection"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl text-card-foreground flex items-center"><ShieldAlert className="mr-2 h-5 w-5"/>Privacy</CardTitle>
          <CardDescription className="text-card-foreground/80">Control your privacy settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center justify-between p-3 rounded-md border border-border bg-accent/20">
            <Label htmlFor="incognito-switch" className="flex flex-col space-y-1">
              <span className="font-medium text-card-foreground">Incognito Mode</span>
              <span className="text-xs text-muted-foreground">When enabled, your activity and logs won't be saved.</span>
            </Label>
            <Switch
              id="incognito-switch"
              checked={isIncognitoMode}
              onCheckedChange={toggleIncognitoMode}
              aria-label="Toggle Incognito Mode"
            />
          </div>
          {/* Add more privacy settings here, e.g., data export, account deletion request */}
        </CardContent>
      </Card>
    </div>
  );
}
