
export interface UserCycleData {
  lastPeriodDate: string; // ISO string
  averageCycleLength: number; // in days
  averagePeriodLength: number; // in days
}

export interface MoodLog {
  id: string;
  date: string; // ISO string
  mood: string; // e.g., "Happy", "Sad", "Stressed"
  notes?: string;
}

export interface SymptomLog {
  id: string;
  date: string; // ISO string
  symptom: string;
  intensity?: 'mild' | 'moderate' | 'severe';
  notes?: string;
}

export interface BBTLog {
  id: string;
  date: string; // ISO string
  temperature: number; // Celsius or Fahrenheit
}

export interface OvulationTestLog {
  id: string;
  date: string; // ISO string
  result: 'positive' | 'negative' | 'peak';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'luna';
  text: string;
  timestamp: number;
}
