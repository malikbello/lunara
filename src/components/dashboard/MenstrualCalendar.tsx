
"use client";

import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { addDays, subDays, format, parseISO, differenceInDays, startOfDay } from 'date-fns';

const calculateCycleEvents = (lastPeriodDateStr: string, cycleLength: number, periodLength: number) => {
  if (!lastPeriodDateStr || !cycleLength || !periodLength) return { periodDays: [], fertileWindow: [], ovulationDays: [] };

  const lastPeriodDate = startOfDay(parseISO(lastPeriodDateStr));
  
  const periodDays: Date[] = [];
  for (let i = 0; i < periodLength; i++) {
    periodDays.push(addDays(lastPeriodDate, i));
  }

  const estimatedNextPeriodStart = addDays(lastPeriodDate, cycleLength);
  const ovulationDay = subDays(estimatedNextPeriodStart, 14);

  const fertileWindow: Date[] = [];
  for (let i = 5; i >= 0; i--) {
    fertileWindow.push(subDays(ovulationDay, i));
  }
  fertileWindow.push(addDays(ovulationDay,1));

  const allEvents = { periodDays: [...periodDays], fertileWindow: [...fertileWindow], ovulationDays: [ovulationDay] };

  // Calculate for a few future and past cycles for broader display
  for (let cycle = 1; cycle <= 3; cycle++) { // future cycles
    const currentLPD = addDays(lastPeriodDate, cycleLength * cycle);
    for (let i = 0; i < periodLength; i++) {
      allEvents.periodDays.push(addDays(currentLPD, i));
    }
    const currentEstimatedNextPeriod = addDays(currentLPD, cycleLength);
    const currentOvulationDay = subDays(currentEstimatedNextPeriod, 14);
    allEvents.ovulationDays.push(currentOvulationDay);
    for (let i = 5; i >= 0; i--) {
      allEvents.fertileWindow.push(subDays(currentOvulationDay, i));
    }
    allEvents.fertileWindow.push(addDays(currentOvulationDay,1));
  }
  for (let cycle = 1; cycle <= 2; cycle++) { // past cycles
    const currentLPD = subDays(lastPeriodDate, cycleLength * cycle);
    for (let i = 0; i < periodLength; i++) {
      allEvents.periodDays.push(addDays(currentLPD, i));
    }
    const currentEstimatedNextPeriod = addDays(currentLPD, cycleLength);
    const currentOvulationDay = subDays(currentEstimatedNextPeriod, 14);
    allEvents.ovulationDays.push(currentOvulationDay);
    for (let i = 5; i >= 0; i--) {
      allEvents.fertileWindow.push(subDays(currentOvulationDay, i));
    }
     allEvents.fertileWindow.push(addDays(currentOvulationDay,1));
  }


  return { 
    periodDays: allEvents.periodDays.map(d => startOfDay(d)), 
    fertileWindow: allEvents.fertileWindow.map(d => startOfDay(d)).sort((a,b) => a.getTime() - b.getTime()), 
    ovulationDays: allEvents.ovulationDays.map(d => startOfDay(d))
  };
};


export default function MenstrualCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { cycleData } = useOnboarding();
  const [events, setEvents] = useState<{ periodDays: Date[], fertileWindow: Date[], ovulationDays: Date[] }>({ periodDays: [], fertileWindow: [], ovulationDays: [] });

  useEffect(() => {
    if (cycleData) {
      const { lastPeriodDate, averageCycleLength, averagePeriodLength } = cycleData;
      setEvents(calculateCycleEvents(lastPeriodDate, averageCycleLength, averagePeriodLength));
    }
  }, [cycleData]);

  const modifiers = {
    period: events.periodDays,
    fertile: events.fertileWindow,
    ovulation: events.ovulationDays,
  };

  const modifiersClassNames = {
    period: 'bg-destructive/20 text-destructive-foreground font-semibold !rounded-full',
    fertile: 'bg-accent/30 text-accent-foreground !rounded-full',
    ovulation: 'bg-secondary/40 text-secondary-foreground font-bold ring-2 ring-secondary !rounded-full',
    today: 'bg-primary text-primary-foreground !rounded-full'
  };
  
  const selectedDay = date ? startOfDay(date) : null;
  let dayStatus = "Regular day";
  let dayStatusColor = "text-muted-foreground";

  if (selectedDay) {
      if (events.ovulationDays.some(d => differenceInDays(d, selectedDay) === 0)) {
        dayStatus = "Predicted Ovulation Day";
        dayStatusColor = "text-secondary font-semibold"; // Use theme color
      } else if (events.fertileWindow.some(d => differenceInDays(d, selectedDay) === 0)) {
        dayStatus = "Fertile Window";
        dayStatusColor = "text-accent font-semibold"; // Use theme color
      } else if (events.periodDays.some(d => differenceInDays(d, selectedDay) === 0)) {
        dayStatus = "Period Day";
        dayStatusColor = "text-destructive font-semibold"; // Use theme color
      }
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 col-span-1 md:col-span-2 lg:col-span-2">
      <CardHeader>
        <CardTitle className="font-headline text-xl text-card-foreground">Menstrual Calendar</CardTitle>
        <CardDescription className="text-card-foreground/80">Track your cycle, fertile windows, and ovulation.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col lg:flex-row gap-6 items-start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border border-input bg-popover text-popover-foreground shadow p-0 self-center lg:self-start"
          modifiers={modifiers}
          modifiersClassNames={modifiersClassNames}
          numberOfMonths={1} // Changed to always display 1 month
        />
        <div className="mt-4 lg:mt-0 p-4 border border-input rounded-md bg-card w-full lg:max-w-sm flex-grow">
            <h3 className="font-semibold text-lg text-card-foreground mb-2">
                {date ? format(date, "PPP") : "Select a date"}
            </h3>
            <p className={`text-sm ${dayStatusColor}`}>{dayStatus}</p>
            <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center">
                  <Badge variant="outline" className="border-destructive/50 text-destructive mr-3 px-2 py-0.5">Period</Badge> Predicted period day
                </div>
                <div className="flex items-center">
                  <Badge variant="outline" className="border-accent/50 text-accent mr-3 px-2 py-0.5">Fertile</Badge> Predicted fertile day
                </div>
                <div className="flex items-center">
                  <Badge variant="outline" className="border-secondary/50 text-secondary mr-3 px-2 py-0.5">Ovulation</Badge> Predicted ovulation day
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
