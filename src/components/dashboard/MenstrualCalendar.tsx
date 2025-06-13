
"use client";

import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { addDays, subDays, format, parseISO, differenceInDays, startOfDay } from 'date-fns';

// Simplified ovulation and fertile window calculation logic
const calculateCycleEvents = (lastPeriodDateStr: string, cycleLength: number, periodLength: number) => {
  if (!lastPeriodDateStr || !cycleLength || !periodLength) return { periodDays: [], fertileWindow: [], ovulationDay: null };

  const lastPeriodDate = startOfDay(parseISO(lastPeriodDateStr));
  
  const periodDays: Date[] = [];
  for (let i = 0; i < periodLength; i++) {
    periodDays.push(addDays(lastPeriodDate, i));
  }

  // Simplified: Ovulation is typically 14 days before next period
  const estimatedNextPeriodStart = addDays(lastPeriodDate, cycleLength);
  const ovulationDay = subDays(estimatedNextPeriodStart, 14);

  const fertileWindow: Date[] = [];
  // Fertile window is typically 5 days before ovulation + ovulation day
  for (let i = 5; i >= 0; i--) {
    fertileWindow.push(subDays(ovulationDay, i));
  }
  
  // Also add one day after ovulation
  fertileWindow.push(addDays(ovulationDay,1));


  // Calculate for a few cycles (e.g., current and next two)
  const allEvents = { periodDays: [...periodDays], fertileWindow: [...fertileWindow], ovulationDays: [ovulationDay] };

  for (let cycle = 1; cycle <= 2; cycle++) { // Next two cycles
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


  return { 
    periodDays: allEvents.periodDays, 
    fertileWindow: allEvents.fertileWindow.sort((a,b) => a.getTime() - b.getTime()), 
    ovulationDays: allEvents.ovulationDays 
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
    period: 'bg-red-200 text-red-800 rounded-full font-semibold',
    fertile: 'bg-green-200 text-green-800 rounded-full',
    ovulation: 'bg-blue-300 text-blue-900 rounded-full font-bold ring-2 ring-blue-500',
    today: 'bg-primary text-primary-foreground rounded-full'
  };
  
  const selectedDay = date ? startOfDay(date) : null;
  let dayStatus = "Regular day";
  if (selectedDay) {
      if (events.ovulationDays.some(d => differenceInDays(d, selectedDay) === 0)) dayStatus = "Predicted Ovulation Day";
      else if (events.fertileWindow.some(d => differenceInDays(d, selectedDay) === 0)) dayStatus = "Fertile Window";
      else if (events.periodDays.some(d => differenceInDays(d, selectedDay) === 0)) dayStatus = "Period Day";
  }


  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 col-span-1 md:col-span-2 lg:col-span-2">
      <CardHeader>
        <CardTitle className="font-headline text-xl text-card-foreground">Menstrual Calendar</CardTitle>
        <CardDescription className="text-card-foreground/80">Track your cycle, fertile windows, and ovulation.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col lg:flex-row gap-4 items-start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border border-input bg-popover text-popover-foreground shadow-sm p-0"
          modifiers={modifiers}
          modifiersClassNames={modifiersClassNames}
          numberOfMonths={typeof window !== 'undefined' && window.innerWidth >= 768 ? 2 : 1} // Show 2 months on wider screens
        />
        <div className="mt-4 lg:mt-0 lg:ml-4 p-4 border border-input rounded-md bg-accent/30 w-full lg:max-w-xs">
            <h3 className="font-semibold text-lg text-foreground mb-2">
                {date ? format(date, "PPP") : "Select a date"}
            </h3>
            <p className="text-sm text-muted-foreground">{dayStatus}</p>
            <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center"><Badge className="bg-red-200 text-red-800 mr-2 w-20 justify-center">Period</Badge> Predicted period day</div>
                <div className="flex items-center"><Badge className="bg-green-200 text-green-800 mr-2 w-20 justify-center">Fertile</Badge> Predicted fertile day</div>
                <div className="flex items-center"><Badge className="bg-blue-300 text-blue-900 mr-2 w-20 justify-center">Ovulation</Badge> Predicted ovulation day</div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
