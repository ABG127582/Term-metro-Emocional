import { useState, useEffect, useCallback, useMemo } from 'react';
import { Assessment, EmotionKey, AssessmentContext } from '../types';
import { storageService } from '../services/storageService';
import { EMOTIONAL_SCALES } from '../constants';

export const useAssessments = (showToast: (msg: string, type: 'success' | 'error' | 'info') => void) => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  // Load initial data
  useEffect(() => {
    setAssessments(storageService.getAssessments());
  }, []);

  // Save Assessment Logic
  const saveAssessment = useCallback((data: { emotion: EmotionKey; level: number } & AssessmentContext) => {
    const result = storageService.saveAssessment(data);
    if (result.success) {
      const emotionName = EMOTIONAL_SCALES[data.emotion].name;
      showToast(`${emotionName} (Nível ${data.level}) registrado!`, 'success');
      setAssessments(storageService.getAssessments()); // Refresh list
      return true;
    } else {
      showToast(result.error || 'Erro ao salvar', 'error');
      return false;
    }
  }, [showToast]);

  // Streak Calculation (Memoized)
  const streak = useMemo(() => {
    if (assessments.length === 0) return 0;

    const toLocalDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-CA');
    };

    const uniqueDays = new Set<string>(
        assessments.map(a => toLocalDate(a.timestamp))
    );
    
    const today = toLocalDate(new Date().toISOString());
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = toLocalDate(yesterdayDate.toISOString());

    if (!uniqueDays.has(today) && !uniqueDays.has(yesterday)) {
        return 0;
    }

    let currentStreak = 0;
    let checkDate = uniqueDays.has(today) ? new Date() : yesterdayDate;
    
    for(let i=0; i<365; i++) {
        const checkString = toLocalDate(checkDate.toISOString());
        if (uniqueDays.has(checkString)) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }
    
    return currentStreak;
  }, [assessments]);

  // Actions
  const clearHistory = useCallback(() => {
    if (window.confirm('Tem certeza que deseja apagar todo o histórico? Esta ação não pode ser desfeita.')) {
      if (storageService.clearAssessments()) {
        showToast('Histórico apagado com sucesso', 'success');
        setAssessments([]);
      } else {
         showToast('Erro ao apagar histórico', 'error');
      }
    }
  }, [showToast]);

  const exportJSON = useCallback(() => {
    try {
        const data = {
          app: "Termômetro Emocional",
          version: "1.1",
          exportDate: new Date().toISOString(),
          totalAssessments: assessments.length,
          assessments: assessments
        };
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `termometro-emocional-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('Dados exportados com sucesso!', 'success');
    } catch (e) {
        showToast('Falha ao exportar dados', 'error');
    }
  }, [assessments, showToast]);

  const exportCSV = useCallback(() => {
    try {
        const csv = storageService.generateCSV(assessments);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `termometro-emocional-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('CSV exportado com sucesso!', 'success');
    } catch (e) {
        showToast('Falha ao exportar CSV', 'error');
    }
  }, [assessments, showToast]);

  const importHistory = useCallback((jsonString: string) => {
      const result = storageService.importData(jsonString);
      if (result.success) {
          showToast(`${result.count} registros importados com sucesso!`, 'success');
          setAssessments(storageService.getAssessments()); // Refresh
          return true;
      } else {
          showToast(result.error || "Erro ao importar", 'error');
          return false;
      }
  }, [showToast]);

  const anonymizeData = useCallback(() => {
    try {
        const anonymized = assessments.map(a => ({
          ...a,
          id: 'anon-' + Math.random().toString(36).substr(2, 9),
          timestamp: new Date(a.timestamp).toISOString().split('T')[0] // Only date, no time
        }));
        const data = {
          app: "Termômetro Emocional (Anonimizado)",
          exportDate: new Date().toISOString(),
          totalAssessments: anonymized.length,
          assessments: anonymized
        };
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `termometro-anonimo-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('Dados anonimizados exportados!', 'success');
    } catch (e) {
         showToast('Falha na anonimização', 'error');
    }
  }, [assessments, showToast]);

  return {
    assessments,
    streak,
    saveAssessment,
    clearHistory,
    exportJSON,
    exportCSV,
    importHistory,
    anonymizeData
  };
};