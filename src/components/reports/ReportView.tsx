
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, CalendarDays, Smile } from 'lucide-react';
import type { MoodLog, UserCycleData } from '@/lib/types';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function ReportView() {
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const { cycleData } = useOnboarding();
  const { toast } = useToast();

  useEffect(() => {
    const storedMoodsRaw = localStorage.getItem('lunara-mood-logs');
    if (storedMoodsRaw) {
      const storedMoods: MoodLog[] = JSON.parse(storedMoodsRaw);
      storedMoods.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
      setMoodLogs(storedMoods);
    }
  }, []);

  const exportDataToCSV = () => {
    if (!cycleData && moodLogs.length === 0) {
      toast({ title: "No Data to Export", description: "There is no cycle or mood data to export.", variant: "default"});
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    
    csvContent += "Category,Parameter,Value\r\n";
    if (cycleData) {
      csvContent += `Cycle Data,Last Period Date,${format(parseISO(cycleData.lastPeriodDate), "yyyy-MM-dd")}\r\n`;
      csvContent += `Cycle Data,Average Cycle Length,${cycleData.averageCycleLength} days\r\n`;
      csvContent += `Cycle Data,Average Period Length,${cycleData.averagePeriodLength} days\r\n`;
    } else {
      csvContent += `Cycle Data,N/A,N/A\r\n`;
    }
    csvContent += "\r\n"; 

    csvContent += "Date,Mood,Notes\r\n";
    moodLogs.forEach(log => {
      const notes = log.notes ? `"${log.notes.replace(/"/g, '""')}"` : ""; 
      csvContent += `${format(parseISO(log.date), "yyyy-MM-dd")},${log.mood},${notes}\r\n`;
    });

    if (moodLogs.length === 0) {
       csvContent += "No mood logs recorded,,\r\n";
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "lunara_report.csv");
    document.body.appendChild(link); 
    link.click();
    document.body.removeChild(link);
    toast({ title: "Report Exported", description: "Your data has been exported as CSV."});
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline text-xl text-card-foreground">Historical Data Report</CardTitle>
            <CardDescription className="text-card-foreground/80">View and export your logged cycle and mood data.</CardDescription>
          </div>
          <Button onClick={exportDataToCSV} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          {cycleData && (
            <div className="mb-6 p-4 border border-input rounded-lg bg-card shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                <CalendarDays className="mr-2 h-5 w-5 text-primary"/>Current Cycle Configuration
              </h3>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li><span className="font-medium text-foreground/90">Last Period Started:</span> {format(parseISO(cycleData.lastPeriodDate), "PPP")}</li>
                <li><span className="font-medium text-foreground/90">Average Cycle Length:</span> {cycleData.averageCycleLength} days</li>
                <li><span className="font-medium text-foreground/90">Average Period Length:</span> {cycleData.averagePeriodLength} days</li>
              </ul>
            </div>
          )}

          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
            <Smile className="mr-2 h-5 w-5 text-primary"/>Mood Logs
          </h3>
          {moodLogs.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-input bg-card shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/40">
                    <TableHead className="text-muted-foreground font-semibold">Date</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Mood</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {moodLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-accent/10">
                      <TableCell className="text-card-foreground py-3">{format(parseISO(log.date), "PPP")}</TableCell>
                      <TableCell className="text-card-foreground py-3">{log.mood}</TableCell>
                      <TableCell className="text-card-foreground py-3 max-w-xs truncate">{log.notes || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 px-4 border border-dashed border-border rounded-lg bg-muted/20">
              <p className="text-muted-foreground">No mood logs recorded yet.</p>
              <p className="text-sm text-muted-foreground mt-1">Start logging your mood on the dashboard to see it here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
