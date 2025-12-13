import { useState, useEffect, useCallback } from 'react';
import { Theme } from '../types';
import { storageService } from '../services/storageService';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const savedTheme = storageService.getTheme();
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.className = theme;
    storageService.saveTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  return {
    theme,
    toggleTheme,
    setTheme
  };
};