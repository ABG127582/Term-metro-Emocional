import { STORAGE_KEY, THEME_KEY, EMOTIONAL_SCALES } from '../constants';
import { Assessment, Theme, EmotionKey, AssessmentContext } from '../types';

export const storageService = {
  getAssessments: (): Assessment[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error("Error reading assessments from storage", err);
      return [];
    }
  },
  
  saveAssessment: (data: { emotion: EmotionKey; level: number } & AssessmentContext): { success: boolean; error?: string } => {
    try {
      const assessments = storageService.getAssessments();
      const newAssessment: Assessment = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...data
      };
      assessments.push(newAssessment);
      
      const serialized = JSON.stringify(assessments);
      
      // Basic Quota Check (prevent crash loop)
      if (serialized.length > 4500000) { // ~4.5MB limit warning
         // Simple strategy: remove oldest 100 records if full
         if (assessments.length > 100) {
             const trimmed = assessments.slice(assessments.length - 100);
             localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
             return { success: true, error: "Armazenamento cheio. Registros antigos foram arquivados." };
         }
         return { success: false, error: "Armazenamento local cheio. Exporte seus dados." };
      }

      localStorage.setItem(STORAGE_KEY, serialized);
      return { success: true };
    } catch (err: any) {
      console.error("Error saving assessment to storage", err);
      if (err.name === 'QuotaExceededError') {
          return { success: false, error: "Limite de armazenamento do navegador atingido." };
      }
      return { success: false, error: "Erro desconhecido ao salvar." };
    }
  },

  clearAssessments: (): boolean => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (err) {
      console.error("Error clearing assessments", err);
      return false;
    }
  },

  // IMPORT FUNCTIONALITY
  importData: (jsonString: string): { success: boolean; error?: string; count?: number } => {
    try {
      const data = JSON.parse(jsonString);
      
      // Basic validation
      if (!data.assessments || !Array.isArray(data.assessments)) {
        return { success: false, error: "Formato de arquivo inválido. Certifique-se de usar um JSON exportado por este aplicativo." };
      }

      // Filter valid assessments
      const validAssessments = data.assessments.filter((a: any) => 
        a.timestamp && a.emotion && typeof a.level === 'number'
      );

      if (validAssessments.length === 0) {
        return { success: false, error: "Nenhum registro válido encontrado no arquivo." };
      }

      // Merge avoiding duplicates (by ID or exact timestamp)
      const current = storageService.getAssessments();
      const currentIds = new Set(current.map(c => c.id));
      
      let addedCount = 0;
      validAssessments.forEach((newItem: Assessment) => {
        if (!currentIds.has(newItem.id)) {
          current.push(newItem);
          addedCount++;
        }
      });

      // Sort by date
      current.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      
      return { success: true, count: addedCount };
    } catch (e) {
      return { success: false, error: "Erro ao ler o arquivo JSON." };
    }
  },

  saveTheme: (theme: Theme): void => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (err) {
       console.error("Error saving theme", err);
    }
  },

  getTheme: (): Theme => {
    try {
      return (localStorage.getItem(THEME_KEY) as Theme) || 'dark';
    } catch (err) {
      return 'dark';
    }
  },

  // Export Utilities
  generateCSV: (assessments: Assessment[]): string => {
    const headers = [
      'Data',
      'Hora',
      'Emoção',
      'Nível',
      'Valência',
      'Arousal',
      'Local',
      'Companhia',
      'Gatilho',
      'Duração',
      'Sono (h)',
      'Energia',
      'Estratégias',
      'Notas'
    ];
    
    // Robust CSV escaping
    const escape = (str: string | undefined | null) => {
      if (str === null || str === undefined) return '';
      const s = String(str);
      // If contains quote, comma or newline, wrap in quotes and escape internal quotes
      if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };
    
    const rows = assessments.map(a => {
      const emotion = EMOTIONAL_SCALES[a.emotion];
      const level = emotion?.levels.find(l => l.level === a.level);
      
      return [
        new Date(a.timestamp).toLocaleDateString('pt-BR'),
        new Date(a.timestamp).toLocaleTimeString('pt-BR'),
        escape(emotion?.name || a.emotion),
        a.level,
        level?.valence || '',
        level?.arousal || '',
        escape(a.location),
        escape(a.company.join('; ')),
        escape(a.trigger),
        a.duration,
        a.sleepHours,
        a.energy,
        escape(a.copingStrategies.join('; ')),
        escape(a.notes)
      ].join(',');
    });
    
    return [headers.join(','), ...rows].join('\n');
  }
};