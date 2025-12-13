import { LucideIcon } from 'lucide-react';

export type EmotionKey = 'alegria' | 'tristeza' | 'raiva' | 'medo' | 'surpresa' | 'nojo';
export type Theme = 'light' | 'dark';
export type ViewOption = 'scale' | 'history';

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
  colorKey: EmotionKey;
  levels: EmotionLevel[];
}

export interface EmotionColor {
  light: string;
  main: string;
  dark: string;
  glow: string;
  chart: string;
}

export interface AssessmentContext {
  location: string;
  company: string[];
  trigger: string;
  duration: string;
  copingStrategies: string[];
  sleepHours: number;
  energy: number;
  notes: string;
  aiAdvice?: string;
}

export interface Assessment extends AssessmentContext {
  id: number;
  timestamp: string;
  emotion: EmotionKey;
  level: number;
}

export interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

// Novos tipos para Neurociência
export interface Hormone {
  name: string;
  color: string;
  description: string;
  // Fator de pico (0-1), Fator de decaimento (quanto maior, mais rápido sai)
  decayProfile: { peakTime: number; decayRate: number };
}

export interface NeuroChemistry {
  hormones: Hormone[];
  description: string;
  recoveryEstimate: string; // Estimativa de tempo para voltar à base
}

// Interface para o Relatório do Analista IA
export interface ClinicalReport {
  summary: string; // Resumo geral do estado mental
  emotional_stability_score: number; // 0 a 100
  dominant_patterns: string[]; // Padrões identificados
  risk_factors: string[]; // Coisas para ficar atento (ex: sono baixo + raiva)
  coping_effectiveness: string; // Análise se as estratégias estão funcionando
  weekly_goals: string[]; // Metas sugeridas para a próxima semana
}