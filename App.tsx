import React, { useState, useEffect, useCallback, useTransition, useRef } from 'react';
import { Heart, Sun, Moon, BarChart2, Thermometer, CalendarCheck, Wind, Settings, FileSpreadsheet, Upload } from 'lucide-react';
import { ViewOption, EmotionKey, AssessmentContext } from './types';
import { EMOTIONAL_SCALES } from './constants';
import { storageService } from './services/storageService';
import EmotionCard from './components/EmotionCard';
import Toast from './components/Toast';
import BreathingModal from './components/BreathingModal';
import OnboardingModal from './components/OnboardingModal';
import ErrorBoundary from './components/ErrorBoundary';
import FocusTrap from './components/FocusTrap';

// Components (Static Import for Stability)
import HistoryView from './components/HistoryView';
import ContextForm from './components/ContextForm';

// Custom Hooks
import { useTheme } from './hooks/useTheme';
import { useToast } from './hooks/useToast';
import { useAssessments } from './hooks/useAssessments';

export default function App() {
  // Hooks
  const { theme, toggleTheme } = useTheme();
  const { toast, showToast, hideToast } = useToast();
  const { assessments, streak, saveAssessment, clearHistory, exportJSON, exportCSV, importHistory, anonymizeData } = useAssessments(showToast);

  // UI State
  const [view, setView] = useState<ViewOption>('scale');
  const [isPending, startTransition] = useTransition();
  const [expandedCard, setExpandedCard] = useState<EmotionKey | null>(null);
  
  // Selection Logic
  const [hoveredLevel, setHoveredLevel] = useState<{ emotionKey: EmotionKey; level: any } | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<{ emotionKey: EmotionKey; level: number } | null>(null);
  
  // Modals State
  const [showContextForm, setShowContextForm] = useState<{ emotionKey: EmotionKey; level: number } | null>(null);
  const [showSOS, setShowSOS] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Settings State
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check for first visit
    const hasVisited = localStorage.getItem('has_visited_app');
    if (!hasVisited) {
        setShowOnboarding(true);
    }
  }, []);

  const handleCloseOnboarding = () => {
      localStorage.setItem('has_visited_app', 'true');
      setShowOnboarding(false);
  };

  // Otimização de INP: Troca de view com transição
  const handleSetView = useCallback((newView: ViewOption) => {
    startTransition(() => {
      setView(newView);
    });
  }, []);

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        if (importHistory(content)) {
          setShowSettings(false);
        }
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onAssessmentSave = useCallback((data: { emotion: EmotionKey; level: number } & AssessmentContext) => {
    const success = saveAssessment(data);
    if (success) {
      setShowContextForm(null);
      setExpandedCard(null);
      setSelectedLevel(null); 
    }
  }, [saveAssessment]);

  // QUICK SAVE HANDLER
  const handleQuickSave = useCallback((emotionKey: EmotionKey, level: number) => {
      const quickContext: AssessmentContext = {
          location: 'Registro Rápido',
          company: [],
          trigger: 'Não especificado',
          duration: '1-5m',
          copingStrategies: [],
          sleepHours: 0,
          energy: 5,
          notes: 'Registro rápido via atalho.',
          aiAdvice: ''
      };
      onAssessmentSave({ emotion: emotionKey, level, ...quickContext });
  }, [onAssessmentSave]);

  const handleCardToggle = useCallback((key: EmotionKey) => {
    setExpandedCard(prev => (prev === key ? null : key));
    setHoveredLevel(null);
    if (expandedCard === key) {
        setSelectedLevel(null);
    }
  }, [expandedCard]);

  const handleSelectLevel = useCallback((key: EmotionKey, level: number) => {
    setSelectedLevel({ emotionKey: key, level });
  }, []);

  const handleHoverLevel = useCallback((data: { emotionKey: EmotionKey; level: any } | null) => {
    setHoveredLevel(data);
  }, []);

  const bgClass = theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50';
  const textClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const textSecondary = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';

  return (
    <ErrorBoundary>
    <div className={`min-h-screen ${bgClass} ${textClass} transition-colors duration-700 font-sans relative overflow-x-hidden`}>
       {/* Alive Background Ambient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 mix-blend-screen filter blur-[100px] animate-blob ${theme === 'dark' ? 'bg-purple-800' : 'bg-blue-300'}`} />
        <div className={`absolute top-1/3 right-1/4 w-96 h-96 rounded-full opacity-20 mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000 ${theme === 'dark' ? 'bg-blue-800' : 'bg-purple-300'}`} />
        <div className={`absolute -bottom-32 left-1/3 w-96 h-96 rounded-full opacity-20 mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000 ${theme === 'dark' ? 'bg-indigo-800' : 'bg-pink-300'}`} />
      </div>

      <div className="max-w-5xl mx-auto relative z-10 p-4 md:p-8 lg:p-12">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 md:mb-12">
          <div className="flex flex-col gap-2">
             <div className="flex items-center gap-5">
                <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 rounded-full"></div>
                <div className="relative bg-gradient-to-br from-red-500 to-pink-600 p-3 rounded-2xl shadow-lg transform transition-transform group-hover:scale-110 duration-300">
                    <Heart className="w-8 h-8 text-white" fill="currentColor" />
                </div>
                </div>
                <div>
                <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent tracking-tight leading-tight">
                    Termômetro
                </h1>
                <h2 className="text-xl md:text-3xl font-thin tracking-widest uppercase opacity-80">
                    Emocional
                </h2>
                </div>
            </div>
            {/* Daily Streak Badge */}
            <div className="ml-1 mt-2 flex items-center gap-2">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${streak > 0 ? 'bg-orange-500/20 text-orange-500' : 'bg-slate-500/20 text-slate-500'}`}>
                    <CalendarCheck className="w-3 h-3" />
                    {streak} {streak === 1 ? 'dia seguido' : 'dias seguidos'}
                </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSOS(true)}
                className="p-3 px-4 rounded-full transition-all duration-300 bg-red-500 text-white shadow-lg shadow-red-500/30 hover:scale-105 hover:bg-red-600 flex items-center gap-2 font-bold animate-pulse z-50 focus:outline-none focus:ring-4 focus:ring-red-500/50"
                aria-label="Modo SOS"
              >
                <Wind className="w-5 h-5" />
                <span className="hidden md:inline">SOS</span>
              </button>

              <button
                onClick={() => setShowSettings(true)}
                className={`p-3 rounded-full transition-all duration-300 hover:rotate-12 hover:scale-110 active:scale-90 shadow-lg backdrop-blur-xl border focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme === 'dark' ? 'bg-slate-800/40 text-slate-300 border-slate-700 focus:ring-slate-500' : 'bg-white/60 text-slate-600 border-white focus:ring-slate-300'}`}
                aria-label="Configurações"
              >
                  <Settings className="w-6 h-6" />
              </button>

              <button
                onClick={toggleTheme}
                className={`p-3 rounded-full transition-all duration-300 hover:rotate-12 hover:scale-110 active:scale-90 shadow-lg backdrop-blur-xl border focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  theme === 'dark'
                    ? 'bg-slate-800/40 text-yellow-400 hover:bg-slate-800/60 border-slate-700 focus:ring-yellow-400'
                    : 'bg-white/60 text-slate-600 hover:bg-white/80 border-white focus:ring-slate-400'
                }`}
                aria-label={`Alternar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
              >
                {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex justify-center mb-12">
             <div className={`p-1.5 rounded-2xl flex gap-1 backdrop-blur-xl border shadow-sm transition-all ${theme === 'dark' ? 'bg-slate-900/40 border-slate-700' : 'bg-white/40 border-white/50'}`}>
                <button
                    onClick={() => handleSetView('scale')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        view === 'scale' 
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg scale-100' 
                        : `${textSecondary} hover:bg-black/5 dark:hover:bg-white/5 scale-95 opacity-70 hover:opacity-100 hover:scale-95`
                    }`}
                >
                    <Thermometer className="w-4 h-4" />
                    <span>Escalas</span>
                </button>
                <button
                    onClick={() => handleSetView('history')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        view === 'history' 
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg scale-100' 
                        : `${textSecondary} hover:bg-black/5 dark:hover:bg-white/5 scale-95 opacity-70 hover:opacity-100 hover:scale-95`
                    }`}
                >
                    <BarChart2 className="w-4 h-4" />
                    <span>Histórico</span>
                </button>
            </div>
        </div>

        {/* Main Content */}
        <div className={`animate-fade-in-up pb-24 ${isPending ? 'opacity-70 grayscale transition-all' : 'opacity-100 grayscale-0'}`}>
            {view === 'scale' && (
            <div className="space-y-8" role="region" aria-label="Escalas emocionais">
                {Object.entries(EMOTIONAL_SCALES).map(([key, emotion]) => (
                <EmotionCard
                    key={key}
                    emotionKey={key as EmotionKey}
                    emotion={emotion}
                    isExpanded={expandedCard === key}
                    hoveredLevel={hoveredLevel}
                    selectedLevel={selectedLevel}
                    onCardToggle={handleCardToggle}
                    onHoverLevel={handleHoverLevel}
                    onSelectLevel={handleSelectLevel}
                    onOpenRegister={(k, l) => setShowContextForm({ emotionKey: k, level: l })}
                    onQuickSave={handleQuickSave}
                    theme={theme}
                />
                ))}
            </div>
            )}

            {view === 'history' && (
              <HistoryView
                  assessments={assessments}
                  theme={theme}
                  onClearHistory={clearHistory}
                  onExportData={exportJSON}
                  onAnonymize={anonymizeData}
              />
            )}
        </div>

        {/* Modals */}
        {showContextForm && (
          <ContextForm
              emotionKey={showContextForm.emotionKey}
              emotion={EMOTIONAL_SCALES[showContextForm.emotionKey]}
              level={showContextForm.level}
              onSave={onAssessmentSave}
              onCancel={() => setShowContextForm(null)}
              theme={theme}
          />
        )}

        {showSOS && <BreathingModal onClose={() => setShowSOS(false)} />}
        {showOnboarding && <OnboardingModal onClose={handleCloseOnboarding} theme={theme} />}
        
        {/* SETTINGS MODAL */}
        {showSettings && (
             <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in">
                 <FocusTrap className={`${theme === 'dark' ? 'bg-slate-900 ring-1 ring-white/10' : 'bg-white'} rounded-3xl max-w-md w-full p-6 shadow-2xl relative`} aria-label="Configurações">
                     <h2 className={`text-xl font-bold ${textClass} mb-4 flex items-center gap-2`}>
                         <Settings className="w-5 h-5" /> Configurações
                     </h2>
                     
                     <div className="grid gap-3 mb-6">
                         <div className="p-4 rounded-xl border flex items-center justify-between gap-4 border-slate-200 dark:border-slate-700">
                             <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                                    <FileSpreadsheet className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold">Exportar CSV</div>
                                    <div className="text-xs opacity-60">Para Excel/Sheets</div>
                                </div>
                             </div>
                             <button onClick={exportCSV} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500">
                                 Baixar
                             </button>
                         </div>

                         <div className="p-4 rounded-xl border flex items-center justify-between gap-4 border-slate-200 dark:border-slate-700">
                             <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                    <Upload className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold">Importar Backup</div>
                                    <div className="text-xs opacity-60">Restaurar arquivo .json</div>
                                </div>
                             </div>
                             <input 
                                type="file" 
                                ref={fileInputRef}
                                onChange={handleFileImport}
                                accept=".json"
                                className="hidden"
                             />
                             <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/50 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
                                 Selecionar
                             </button>
                         </div>
                     </div>

                     <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                         <button onClick={() => setShowSettings(false)} className={`px-4 py-2 rounded-lg text-sm font-medium ${textSecondary} hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500`}>
                             Fechar
                         </button>
                     </div>
                 </FocusTrap>
             </div>
        )}

        {toast && (
            <Toast
                message={toast.message}
                type={toast.type}
                onClose={hideToast}
            />
        )}
      </div>
    </div>
    </ErrorBoundary>
  );
}