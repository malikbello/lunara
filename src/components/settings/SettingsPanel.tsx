
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Edit3, Save, ActivitySquare, ShieldAlert, Smartphone, Watch } from "lucide-react"; // Added Smartphone, Watch
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { useOnboarding } from '@/contexts/OnboardingContext'; 
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
  const [appleHealthConnected, setAppleHealthConnected] = useState(false);
  const [fitbitConnected, setFitbitConnected] = useState(false);
  const [otherWearablesConnected, setOtherWearablesConnected] = useState(false);
  const { toast } = useToast();

  const { control, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm<CycleFormData>({
    resolver: zodResolver(cycleDataSchema),
    defaultValues: { 
      lastPeriodDate: new Date(), 
      averageCycleLength: 28, 
      averagePeriodLength: 5, 
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
    // Load integration statuses from localStorage
    setIsIncognitoMode(localStorage.getItem('lunara-incognito') === 'true');
    setGoogleFitConnected(localStorage.getItem('lunara-googlefit-connected') === 'true');
    setAppleHealthConnected(localStorage.getItem('lunara-applehealth-connected') === 'true');
    setFitbitConnected(localStorage.getItem('lunara-fitbit-connected') === 'true');
    setOtherWearablesConnected(localStorage.getItem('lunara-otherwearables-connected') === 'true');

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

  const createToggleHandler = (
    name: string, 
    connectedState: boolean, 
    setter: React.Dispatch<React.SetStateAction<boolean>>,
    storageKey: string
  ) => {
    return () => {
      const newStatus = !connectedState;
      setter(newStatus);
      localStorage.setItem(storageKey, String(newStatus));
      toast({ title: `${name} ${newStatus ? 'Connected' : 'Disconnected'}`, description: newStatus ? `Successfully connected to ${name}.` : `Disconnected from ${name}.`});
    };
  };

  const toggleGoogleFit = createToggleHandler("Google Fit", googleFitConnected, setGoogleFitConnected, 'lunara-googlefit-connected');
  const toggleAppleHealth = createToggleHandler("Apple Health", appleHealthConnected, setAppleHealthConnected, 'lunara-applehealth-connected');
  const toggleFitbit = createToggleHandler("Fitbit", fitbitConnected, setFitbitConnected, 'lunara-fitbit-connected');
  const toggleOtherWearables = createToggleHandler("Other Wearables", otherWearablesConnected, setOtherWearablesConnected, 'lunara-otherwearables-connected');


  if (!isOnboardingComplete && !cycleData) {
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
          <CardDescription className="text-card-foreground/80">Update your menstrual cycle information. This is used for baseline predictions.</CardDescription>
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
          <CardDescription className="text-card-foreground/80">Connect your wearables and health apps for passive data collection (e.g., BBT, sleep, stress, heart rate).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-md border border-border bg-accent/20">
            <Label htmlFor="google-fit-switch" className="flex items-center space-x-2">
              <img src="https://www.gstatic.com/images/branding/product/1x/fitness_48dp.png" alt="Google Fit" className="h-6 w-6" data-ai-hint="google fit logo"/>
              <div className="flex flex-col">
                <span className="font-medium text-card-foreground">Google Fit</span>
                <span className="text-xs text-muted-foreground">Sync health data.</span>
              </div>
            </Label>
            <Switch
              id="google-fit-switch"
              checked={googleFitConnected}
              onCheckedChange={toggleGoogleFit}
              aria-label="Toggle Google Fit connection"
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-md border border-border bg-accent/20">
            <Label htmlFor="apple-health-switch" className="flex items-center space-x-2">
              <Smartphone className="h-6 w-6 text-card-foreground/80"/>
              <div className="flex flex-col">
                <span className="font-medium text-card-foreground">Apple Health</span>
                <span className="text-xs text-muted-foreground">Sync from iPhone/Watch.</span>
              </div>
            </Label>
            <Switch
              id="apple-health-switch"
              checked={appleHealthConnected}
              onCheckedChange={toggleAppleHealth}
              aria-label="Toggle Apple Health connection"
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-md border border-border bg-accent/20">
            <Label htmlFor="fitbit-switch" className="flex items-center space-x-2">
              <Watch className="h-6 w-6 text-card-foreground/80"/>
               <div className="flex flex-col">
                <span className="font-medium text-card-foreground">Fitbit</span>
                <span className="text-xs text-muted-foreground">Sync from Fitbit devices.</span>
              </div>
            </Label>
            <Switch
              id="fitbit-switch"
              checked={fitbitConnected}
              onCheckedChange={toggleFitbit}
              aria-label="Toggle Fitbit connection"
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-md border border-border bg-accent/20">
            <Label htmlFor="other-wearables-switch" className="flex items-center space-x-2">
              <ActivitySquare className="h-6 w-6 text-card-foreground/80" />
               <div className="flex flex-col">
                <span className="font-medium text-card-foreground">Other Wearables</span>
                <span className="text-xs text-muted-foreground">Connect other smart devices.</span>
              </div>
            </Label>
            <Switch
              id="other-wearables-switch"
              checked={otherWearablesConnected}
              onCheckedChange={toggleOtherWearables}
              aria-label="Toggle other wearables connection"
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
        </CardContent>
      </Card>
    </div>
  );
}
