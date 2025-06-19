
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Smile, Frown, Meh, Edit3 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { MoodLog } from '@/lib/types';

const calculateFertilityScore = () => {
  const [score, setScore] = useState(0);
  useEffect(() => {
    setScore(Math.floor(Math.random() * 100) + 1);
  }, []);
  return score;
}

const moodOptions = [
  { mood: 'Happy', icon: <Smile className="h-6 w-6 text-green-500" /> }, // Keeping icon colors distinct for mood
  { mood: 'Okay', icon: <Meh className="h-6 w-6 text-yellow-500" /> },
  { mood: 'Sad', icon: <Frown className="h-6 w-6 text-blue-500" /> },
  { mood: 'Stressed', icon: <Frown className="h-6 w-6 text-red-500" /> },
  { mood: 'Energetic', icon: <Smile className="h-6 w-6 text-orange-500" /> },
];


export default function DailyOverview() {
  const fertilityScore = calculateFertilityScore();
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  const [moodNotes, setMoodNotes] = useState('');
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
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
    logs = logs.filter(log => log.date !== today);
    logs.push(newLog);
    localStorage.setItem('lunara-mood-logs', JSON.stringify(logs));

    toast({ title: "Mood Logged!", description: `You've logged your mood as ${currentMood}.` });
    setIsMoodModalOpen(false);
  };
  
  const getScoreDependentClasses = () => {
    if (fertilityScore > 70) return {
      circleStroke: "stroke-accent", // Peach/Coral for high
      progressBg: "bg-accent",
      text: "High chance"
    };
    if (fertilityScore > 40) return {
      circleStroke: "stroke-secondary", // Lighter Wine/Rose for medium
      progressBg: "bg-secondary",
      text: "Medium chance"
    };
    return {
      circleStroke: "stroke-destructive", // Red for low
      progressBg: "bg-destructive",
      text: "Low chance"
    };
  };

  const scoreClasses = getScoreDependentClasses();

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="font-headline text-xl text-card-foreground">Daily Fertility Score</CardTitle>
          <CardDescription className="text-card-foreground/80">Your estimated fertility level today.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center pt-2">
          <div className="relative h-36 w-36">
            <svg className="transform -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
              <circle cx="18" cy="18" r="16" fill="none" className="stroke-border/50" strokeWidth="2.5"></circle>
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                className={`transition-all duration-500 ease-out ${scoreClasses.circleStroke}`}
                strokeWidth="2.5"
                strokeDasharray={`${fertilityScore}, 100`}
                strokeLinecap="round"
              ></circle>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold text-foreground">{fertilityScore}</span>
            </div>
          </div>
          <Progress value={fertilityScore} className={`w-full mt-6 h-2.5 ${scoreClasses.progressBg}`} />
          <p className="mt-3 text-sm text-muted-foreground font-medium">
            {scoreClasses.text}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="font-headline text-xl text-card-foreground">How are you feeling?</CardTitle>
          <CardDescription className="text-card-foreground/80">Log your mood, symptoms, or lifestyle notes.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center">
            {currentMood && !isMoodModalOpen ? (
                <div className="text-center p-4 rounded-lg bg-accent/10 w-full">
                    <p className="text-lg text-card-foreground mb-2">Today's mood: <span className="font-semibold">{currentMood}</span></p>
                    {moodOptions.find(o => o.mood === currentMood)?.icon}
                    <Button variant="outline" size="sm" onClick={() => setIsMoodModalOpen(true)} className="mt-4 border-primary/50 text-primary hover:bg-primary/10">
                        <Edit3 className="mr-2 h-4 w-4" /> Edit Mood
                    </Button>
                </div>
            ) : (
                 <Button onClick={() => setIsMoodModalOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 text-base">
                    Log Today's Mood
                 </Button>
            )}
        </CardContent>
      </Card>

      <Dialog open={isMoodModalOpen} onOpenChange={setIsMoodModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle className="font-headline">Log Your Mood & Notes</DialogTitle>
            <DialogDescription>Select how you're feeling and add any notes (e.g., lifestyle, symptoms, habits).</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex justify-around gap-2 flex-wrap">
              {moodOptions.map(({ mood, icon }) => (
                <Button
                  key={mood}
                  variant={currentMood === mood ? "default" : "outline"}
                  onClick={() => handleMoodSelect(mood)}
                  className={`flex flex-col items-center h-auto p-3 ${currentMood === mood ? 'bg-primary text-primary-foreground' : 'text-card-foreground hover:bg-accent/20'}`}
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
                placeholder="Any specific feelings, events, lifestyle notes, or observations..."
                className="bg-input text-foreground placeholder:text-muted-foreground"
                rows={3}
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
