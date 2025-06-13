
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress'; // Using Progress for score for now
import { Smile, Frown, Meh, Edit3 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { MoodLog } from '@/lib/types';

// Placeholder for fertility score calculation
const calculateFertilityScore = () => Math.floor(Math.random() * 100) + 1;

const moodOptions = [
  { mood: 'Happy', icon: <Smile className="h-6 w-6 text-green-500" /> },
  { mood: 'Okay', icon: <Meh className="h-6 w-6 text-yellow-500" /> },
  { mood: 'Sad', icon: <Frown className="h-6 w-6 text-blue-500" /> },
  { mood: 'Stressed', icon: <Frown className="h-6 w-6 text-red-500" /> }, // Example, use appropriate icon
  { mood: 'Energetic', icon: <Smile className="h-6 w-6 text-orange-500" /> },
];


export default function DailyOverview() {
  const [fertilityScore, setFertilityScore] = useState(0);
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  const [moodNotes, setMoodNotes] = useState('');
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setFertilityScore(calculateFertilityScore());
    // Load today's mood if already logged
    const today = new Date().toISOString().split('T')[0];
    const storedMoodsRaw = localStorage.getItem('lunara-mood-logs');
    if (storedMoodsRaw) {
      const storedMoods: MoodLog[] = JSON.parse(storedMoodsRaw);
      const todayMoodLog = storedMoods.find(log => log.date === today);
      if (todayMoodLog) {
        setCurrentMood(todayMoodLog.mood);
        setMoodNotes(todayMoodLog.notes || '');
      }
    }
  }, []);

  const handleMoodSelect = (mood: string) => {
    setCurrentMood(mood);
  };

  const handleSaveMood = () => {
    if (!currentMood) {
      toast({ title: "Select a mood", description: "Please select how you're feeling today.", variant: "destructive" });
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    const newLog: MoodLog = { id: Date.now().toString(), date: today, mood: currentMood, notes: moodNotes };
    
    let logs: MoodLog[] = [];
    const storedLogsRaw = localStorage.getItem('lunara-mood-logs');
    if (storedLogsRaw) {
      logs = JSON.parse(storedLogsRaw);
    }
    // Remove existing log for today if any, then add new one
    logs = logs.filter(log => log.date !== today);
    logs.push(newLog);
    localStorage.setItem('lunara-mood-logs', JSON.stringify(logs));

    toast({ title: "Mood Logged!", description: `You've logged your mood as ${currentMood}.` });
    setIsMoodModalOpen(false);
  };
  
  const scoreColor = fertilityScore > 70 ? 'bg-green-500' : fertilityScore > 40 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="font-headline text-xl text-card-foreground">Daily Fertility Score</CardTitle>
          <CardDescription className="text-card-foreground/80">Your estimated fertility level today.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center">
          <div className="relative h-32 w-32"> {/* Placeholder for ProgressRing */}
            <svg className="transform -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
              <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-gray-200 dark:text-gray-700" strokeWidth="2"></circle>
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                className={`stroke-current ${fertilityScore > 70 ? 'text-green-500' : fertilityScore > 40 ? 'text-yellow-500' : 'text-red-500'}`}
                strokeWidth="2"
                strokeDasharray={`${fertilityScore}, 100`}
                strokeLinecap="round"
              ></circle>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-foreground">{fertilityScore}</span>
            </div>
          </div>
          <Progress value={fertilityScore} className={`w-full mt-4 h-3 ${scoreColor}`} />
          <p className="mt-2 text-sm text-muted-foreground">
            {fertilityScore > 70 ? "High chance" : fertilityScore > 40 ? "Medium chance" : "Low chance"}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="font-headline text-xl text-card-foreground">How are you feeling?</CardTitle>
          <CardDescription className="text-card-foreground/80">Log your mood for today.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center">
            {currentMood && !isMoodModalOpen ? (
                <div className="text-center">
                    <p className="text-lg text-card-foreground">Today's mood: <span className="font-semibold">{currentMood}</span></p>
                    {moodOptions.find(o => o.mood === currentMood)?.icon}
                    <Button variant="outline" size="sm" onClick={() => setIsMoodModalOpen(true)} className="mt-4">
                        <Edit3 className="mr-2 h-4 w-4" /> Edit Mood
                    </Button>
                </div>
            ) : (
                 <Button onClick={() => setIsMoodModalOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Log Today's Mood
                 </Button>
            )}
        </CardContent>
      </Card>

      <Dialog open={isMoodModalOpen} onOpenChange={setIsMoodModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle className="font-headline">Log Your Mood</DialogTitle>
            <DialogDescription>Select how you're feeling and add any notes.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex justify-around gap-2 flex-wrap">
              {moodOptions.map(({ mood, icon }) => (
                <Button
                  key={mood}
                  variant={currentMood === mood ? "default" : "outline"}
                  onClick={() => handleMoodSelect(mood)}
                  className={`flex flex-col items-center h-auto p-3 ${currentMood === mood ? 'bg-primary text-primary-foreground' : 'text-card-foreground'}`}
                  aria-pressed={currentMood === mood}
                  aria-label={`Select mood: ${mood}`}
                >
                  {icon}
                  <span className="mt-1 text-xs">{mood}</span>
                </Button>
              ))}
            </div>
            <div className="space-y-1">
              <Label htmlFor="moodNotes" className="text-left text-card-foreground">Notes (optional)</Label>
              <Textarea
                id="moodNotes"
                value={moodNotes}
                onChange={(e) => setMoodNotes(e.target.value)}
                placeholder="Any specific feelings, events, or observations..."
                className="bg-input text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMoodModalOpen(false)} className="text-card-foreground">Cancel</Button>
            <Button onClick={handleSaveMood} className="bg-primary hover:bg-primary/90 text-primary-foreground">Save Mood</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
