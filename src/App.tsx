import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Sun, Moon, LifeBuoy } from 'lucide-react';
import { Toast } from './components/Toast';
import { EmotionCard } from './components/EmotionCard';
import { ContextForm } from './components/ContextForm';
import { HistoryView } from './components/HistoryView';
import { BreathingModal } from './components/BreathingModal';
import { emotionalScales } from './constants';
import { storageService } from './services/storageService';
import { Assessment, ToastMessage, ContextData, EmotionLevel } from './types';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => storageService.getTheme());
  const [hoveredLevel, setHoveredLevel] = useState<{ emotionKey: string; level: EmotionLevel } | null>(null);
  const [view, setView] = useState<'scale' | 'history'>('scale');
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showContextForm, setShowContextForm] = useState<{ emotionKey: string; level: number } | null>(null);
  const [showSOS, setShowSOS] = useState(false);

  useEffect(() => {
    setAssessments(storageService.getAssessments());
    // Theme is initialized in useState
  }, []);

  useEffect(() => {
    document.documentElement.className = theme;
    storageService.saveTheme(theme);
  }, [theme]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const handleAssessmentSave = useCallback((data: { emotion: string; level: number } & ContextData) => {
    // Se vier um customTimestamp do formulário, usamos ele. Se não, usamos Agora.
    const finalTimestamp = data.customTimestamp || new Date().toISOString();

    // Removemos customTimestamp do objeto final para não duplicar, pois será salvo em 'timestamp'
    const { customTimestamp, ...rest } = data;

    const assessmentToSave = {
      ...rest,
      timestamp: finalTimestamp
    };

    if (storageService.saveAssessment(assessmentToSave)) {
      const emotionName = emotionalScales[data.emotion].name;
      showToast(`${emotionName} registrado com sucesso!`, 'success');
      setAssessments(storageService.getAssessments());
      setShowContextForm(null);
    } else {
      showToast('Erro ao salvar', 'error');
    }
  }, [showToast]);

  const handleCardToggle = useCallback((key: string) => {
    setExpandedCard(prev => (prev === key ? null : key));
    setHoveredLevel(null);
  }, []);

  const handleClearHistory = useCallback(() => {
    if (window.confirm('Deseja limpar TODO o histórico? Esta ação é irreversível.')) {
      if (storageService.clearAssessments()) {
        showToast('Histórico limpo', 'success');
        setAssessments([]);
      }
    }
  }, [showToast]);

  const handleDeleteAssessment = useCallback((id: number) => {
    if (window.confirm('Excluir este registro?')) {
      if (storageService.deleteAssessment(id)) {
        showToast('Registro excluído', 'success');
        setAssessments(storageService.getAssessments());
      } else {
        showToast('Erro ao excluir', 'error');
      }
    }
  }, [showToast]);

  const handleExportData = useCallback(() => {
    const data = {
      exportDate: new Date().toISOString(),
      totalAssessments: assessments.length,
      assessments: assessments
    };
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `termometro-emocional-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showToast('Dados exportados com sucesso!', 'success');
  }, [assessments, showToast]);

  const handleAnonymize = useCallback(() => {
    const anonymized = assessments.map(a => ({
      ...a,
      id: undefined, // Remove ID or hash it
      pseudoId: 'anon-' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(a.timestamp).toISOString().split('T')[0],
      notes: '[REDACTED]' // Anonimiza notas livres que podem conter nomes
    }));
    const data = {
      anonymized: true,
      exportDate: new Date().toISOString(),
      totalAssessments: anonymized.length,
      assessments: anonymized
    };
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `termometro-anonimizado-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showToast('Dados anonimizados e exportados!', 'success');
  }, [assessments, showToast]);

  const bgClass = theme === 'dark'
    ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900'
    : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50';
  const textClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const textSecondary = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} p-4 md:p-8 transition-colors duration-300 font-sans relative overflow-hidden`}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none no-print">
        <div className={`absolute -top-40 -left-40 w-80 h-80 rounded-full opacity-20 mix-blend-multiply filter blur-3xl ${theme === 'dark' ? 'bg-purple-900' : 'bg-blue-200'}`} aria-hidden="true" />
        <div className={`absolute -bottom-40 -right-40 w-80 h-80 rounded-full opacity-20 mix-blend-multiply filter blur-3xl ${theme === 'dark' ? 'bg-indigo-900' : 'bg-purple-200'}`} aria-hidden="true" />
      </div>

      <div className={`max-w-6xl mx-auto relative z-10 ${showSOS ? 'blur-sm' : ''}`}>
        <div className="flex justify-between items-start mb-12 gap-4 no-print">
          <div className="relative overflow-hidden mb-4">
            <div className="relative p-8">
              <div className="flex items-center gap-4 mb-3">
                <div className="relative">
                  <Heart className="w-10 h-10 text-red-500" aria-hidden="true" />
                </div>
                <h1 className={`text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent`}>
                  Termômetro Emocional
                </h1>
              </div>
              <div className="h-1 w-40 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full" aria-hidden="true" />
              <p className={`text-sm md:text-base ${textSecondary} mt-3`}>Ferramenta Clínica de Regulação Emocional</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSOS(true)}
              className="px-5 py-3 rounded-full font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 hover:scale-105 transition-all duration-300 flex items-center gap-2 animate-pulse"
              aria-label="SOS - Respiração Guiada"
            >
              <LifeBuoy className="w-5 h-5" />
              SOS
            </button>

            <button
              onClick={toggleTheme}
              className={`p-4 rounded-full transition-all duration-300 hover:scale-110 ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-yellow-400/20 to-orange-500/20'
                  : 'bg-gradient-to-br from-slate-200 to-slate-300'
              }`}
              aria-label={`Alternar para modo ${theme === 'dark' ? 'claro' : 'escuro'}`}
            >
              {theme === 'dark' ? (
                <Sun className="w-6 h-6 text-yellow-400" aria-hidden="true" />
              ) : (
                <Moon className="w-6 h-6 text-slate-700" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-10 border-b-2 border-slate-200/20 pb-4 no-print">
          {[
            { id: 'scale', label: 'Registrar', icon: '📝' },
            { id: 'history', label: 'Análise Clínica', icon: '📈' }
          ].map(viewOption => (
            <button
              key={viewOption.id}
              onClick={() => setView(viewOption.id as any)}
              className={`relative px-6 py-3 font-semibold transition-all flex items-center gap-2 ${
                view === viewOption.id
                  ? 'text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text'
                  : textSecondary
              }`}
              aria-selected={view === viewOption.id}
              role="tab"
            >
              <span className="text-xl" aria-hidden="true">{viewOption.icon}</span>
              {viewOption.label}
              {view === viewOption.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>

        {view === 'scale' && (
          <div className="space-y-6 no-print" role="region" aria-label="Escalas emocionais">
            {Object.entries(emotionalScales).map(([key, emotion]) => (
              <EmotionCard
                key={key}
                emotionKey={key}
                emotion={emotion}
                isExpanded={expandedCard === key}
                hoveredLevel={hoveredLevel}
                onCardToggle={handleCardToggle}
                onHoverLevel={setHoveredLevel}
                onSave={(emotionKey, level) => setShowContextForm({ emotionKey, level })}
                theme={theme}
              />
            ))}
          </div>
        )}

        {view === 'history' && (
          <div role="region" aria-label="Histórico e análises">
            <HistoryView
              assessments={assessments}
              theme={theme}
              onClearHistory={handleClearHistory}
              onExportData={handleExportData}
              onAnonymize={handleAnonymize}
              onDeleteAssessment={handleDeleteAssessment}
            />
          </div>
        )}

        {showContextForm && (
          <ContextForm
            emotionKey={showContextForm.emotionKey}
            emotion={emotionalScales[showContextForm.emotionKey]}
            level={showContextForm.level}
            onSave={handleAssessmentSave}
            onCancel={() => setShowContextForm(null)}
            theme={theme}
          />
        )}

        {showSOS && (
          <BreathingModal onClose={() => setShowSOS(false)} />
        )}

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
}

export default App;
