import { Assessment } from '../types';

const STORAGE_KEY = 'emotional_assessments';
const THEME_KEY = 'theme_preference';

export const storageService = {
  getAssessments: (): Assessment[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      return [];
    }
  },
  saveAssessment: (assessment: Omit<Assessment, 'id' | 'timestamp'>): boolean => {
    try {
      const assessments = storageService.getAssessments();
      const newAssessment: Assessment = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...assessment
      };
      assessments.push(newAssessment);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assessments));
      return true;
    } catch (err) {
      return false;
    }
  },
  deleteAssessment: (id: number): boolean => {
    try {
      const assessments = storageService.getAssessments();
      const filtered = assessments.filter(a => a.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (err) {
      return false;
    }
  },
  clearAssessments: (): boolean => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (err) {
      return false;
    }
  },
  saveTheme: (theme: 'light' | 'dark'): void => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (err) {
        // ignore write error
    }
  },
  getTheme: (): 'light' | 'dark' => {
    try {
      const theme = localStorage.getItem(THEME_KEY);
      return (theme === 'dark' || theme === 'light') ? theme : 'dark';
    } catch (err) {
      return 'dark';
    }
  }
};
