import { LucideIcon } from 'lucide-react';

export type Theme = 'light' | 'dark';
export type EmotionKey = string;

export interface EmotionLevel {
  level: number;
  label: string;
  valence: number;
  arousal: number;
  desc: string;
  examples: string;
  regulation: string;
}

export interface EmotionScale {
  name: string;
  icon: LucideIcon;
  color: string;
  valenceBase: number;
  colorKey: string;
  levels: EmotionLevel[];
}

export interface ContextData {
  location: string;
  company: string[];
  trigger: string;
  duration: string;
  copingStrategies: string[];
  bodySensations: string[];
  sleepHours: number;
  energy: number;
  notes: string;
  customTimestamp?: string;
  secondaryEmotion: string | null;
  secondaryLevel: number;
  customValence: number;
  customArousal: number;
}

export interface Assessment extends ContextData {
  id?: number;
  pseudoId?: string;
  timestamp: string;
  emotion: string; // key of emotionalScales
  level: number;
}

export interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info';
}

// Neurochemistry Types
export interface DecayProfile {
  peakTime: number; // minutos até o pico
  decayRate: number; // taxa de decaimento
}

export interface HormoneData {
  name: string;
  color: string;
  description: string;
  decayProfile: DecayProfile;
}

export interface NeuroInfo {
  description: string;
  recoveryEstimate: string;
  hormones: HormoneData[];
}
