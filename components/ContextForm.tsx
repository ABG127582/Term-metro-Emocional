import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { MapPin, Users, Zap, Clock, X, BookText, Brain, Lightbulb, ChevronDown, ChevronUp, Mic, Bot, MessageCircle, Plus, Wand2, Moon, Activity } from 'lucide-react';
import { EmotionKey, EmotionScale, AssessmentContext, Theme } from '../types';
import { EMOTIONAL_SCALES, EMOTION_COLORS, REGULATION_STRATEGIES, ALL_COPING_OPTIONS, REFLECTION_PROMPTS } from '../constants';
import { aiService } from '../services/aiService';
import BreathingModal from './BreathingModal';
import FocusTrap from './FocusTrap';

interface ContextFormProps {
  emotionKey: EmotionKey;
  emotion: EmotionScale;
  level: number;
  onSave: (data: { emotion: EmotionKey; level: number } & AssessmentContext) => void;
  onCancel: () => void;
  theme: Theme;
}

const ContextForm: React.FC<ContextFormProps> = ({ emotionKey, emotion, level, onSave, onCancel, theme }) => {
  const [context, setContext] = useState<AssessmentContext>({
    location: '', company: [], trigger: '', duration: '1-5m', copingStrategies: [], sleepHours: 7.0, energy: 5, notes: '', aiAdvice: ''
  });
  
  const [customLocations, setCustomLocations] = useState<string[]>([]);
  const [customCompany, setCustomCompany] = useState<string[]>([]);
  const [customTriggers, setCustomTriggers] = useState<string[]>([]);
  const [isAddingTag, setIsAddingTag] = useState<{ type: 'location' | 'company' | 'trigger', value: '' } | null>(null);

  const [showAllStrategies, setShowAllStrategies] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [browserSupportsSpeech, setBrowserSupportsSpeech] = useState(true);
  const [isSmartFilling, setIsSmartFilling] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const recognitionRef = useRef<any>(null);

  const textClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const textSecondary = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';
  const inputClass = theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500';
  const emotionColor = EMOTION_COLORS[emotionKey];

  const { suggestedStrategies, arousalLevel, suggestionReason } = useMemo(() => {
    const currentLevelData = emotion.levels.find(l => l.level === level);
    const arousal = currentLevelData?.arousal || 5;
    let strategies = REGULATION_STRATEGIES.MODERATE_AROUSAL;
    let reason = "Para intensidade moderada, estratégias cognitivas ajudam a processar.";
    if (arousal > 7.5) {
      strategies = REGULATION_STRATEGIES.HIGH_AROUSAL;
      reason = "Alta ativação! Use estratégias fisiológicas para 'esfriar'.";
    } else if (arousal < 4.5) {
      strategies = REGULATION_STRATEGIES.LOW_AROUSAL;
      reason = "Baixa ativação. Estratégias suaves podem ajudar.";
    }
    return { suggestedStrategies: strategies, arousalLevel: arousal, suggestionReason: reason };
  }, [emotion, level]);

  const otherStrategies = useMemo(() => ALL_COPING_OPTIONS.filter(s => !suggestedStrategies.includes(s)), [suggestedStrategies]);
  const reflectionPrompts = useMemo(() => REFLECTION_PROMPTS[emotionKey] || [], [emotionKey]);
  const locations = useMemo(() => ['Casa', 'Trabalho', 'Escola', 'Trânsito', 'Público', 'Natureza', 'Online', ...customLocations], [customLocations]);
  const companyOptions = useMemo(() => ['Sozinho', 'Família', 'Amigos', 'Parceiro(a)', 'Colegas', 'Desconhecidos', ...customCompany], [customCompany]);
  const triggers = useMemo(() => ['Interação Social', 'Trabalho/Estudo', 'Notícias', 'Pensamentos', 'Saúde Física', 'Evento Inesperado', 'Nada Específico', ...customTriggers], [customTriggers]);

  const handleAddCustomTag = useCallback((type: 'location' | 'company' | 'trigger', value: string) => {
      if (!value.trim()) { setIsAddingTag(null); return; }
      if (type === 'location') { setCustomLocations(p => [...p, value]); setContext(p => ({ ...p, location: value })); }
      else if (type === 'company') { setCustomCompany(p => [...p, value]); setContext(p => ({ ...p, company: [...p.company, value] })); }
      else if (type === 'trigger') { setCustomTriggers(p => [...p, value]); setContext(p => ({ ...p, trigger: value })); }
      setIsAddingTag(null);
  }, []);

  const toggleStrategy = useCallback((strategy: string) => {
    setContext(p => ({ ...p, copingStrategies: p.copingStrategies.includes(strategy) ? p.copingStrategies.filter(c => c !== strategy) : [...p.copingStrategies, strategy] }));
    if (strategy.includes('Respiração')) setShowBreathing(true);
  }, []);

  const updateContext = useCallback((field: keyof AssessmentContext, value: any) => {
      setContext(prev => ({ ...prev, [field]: value }));
  }, []);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setBrowserSupportsSpeech(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        try { recognitionRef.current.stop(); } catch (e) { /* Ignore */ }
      }
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.continuous = true; 
        recognition.interimResults = true;
        
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);

        recognition.onresult = (event: any) => {
          let newFinalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              newFinalTranscript += event.results[i][0].transcript;
            }
          }
          if (newFinalTranscript) {
              setContext(prev => {
                const spacer = prev.notes && !prev.notes.endsWith(' ') ? ' ' : '';
                return { ...prev, notes: prev.notes + spacer + newFinalTranscript };
              });
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
    } catch (e) { 
      console.error(e);
      setIsListening(false); 
    }
  }, [isListening]);

  const handleSmartFill = useCallback(async () => {
    if (!context.notes || context.notes.trim().length === 0) {
      alert("Relate o que aconteceu primeiro.");
      return;
    }

    setIsSmartFilling(true);
    try {
      const data = await aiService.analyzeContext(context.notes, emotion.name);
      
      setContext(prev => ({
        ...prev,
        location: data.location || prev.location,
        company: data.company || prev.company,
        trigger: data.trigger || prev.trigger,
        aiAdvice: data.advice || prev.aiAdvice,
        copingStrategies: data.strategy ? [...prev.copingStrategies, data.strategy] : prev.copingStrategies
      }));
    } catch (error: any) {
      console.error("Smart Fill Error", error);
      alert(error.message || "Erro ao conectar com a IA.");
    } finally { setIsSmartFilling(false); }
  }, [context.notes, emotion.name]);

  return (
    <>
    {showBreathing && <BreathingModal onClose={() => setShowBreathing(false)} />}
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
      <FocusTrap className={`${theme === 'dark' ? 'bg-slate-900 ring-1 ring-white/10' : 'bg-white'} rounded-3xl max-w-2xl w-full max-h-[95vh] overflow-y-auto shadow-2xl animate-scale-in`} aria-label="Diário Emocional">
        <div className="sticky top-0 z-20 px-6 py-4 border-b flex items-center justify-between backdrop-blur-md" style={{ backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)', borderColor: theme === 'dark' ? '#334155' : '#e2e8f0' }}>
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20" style={{ background: `linear-gradient(135deg, ${emotionColor.light}, ${emotionColor.main})` }}/>
                    <emotion.icon className="w-7 h-7 relative z-10" style={{ color: emotionColor.main }} />
                </div>
                <div>
                    <h2 className={`text-xl font-bold ${textClass}`}>Diário Emocional</h2>
                     <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-bold text-white" style={{ backgroundColor: emotionColor.main }}>{emotion.name} • Nível {level}</span>
                    </div>
                </div>
            </div>
            <button onClick={onCancel} className={`p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${textSecondary}`} aria-label="Fechar formulário"><X className="w-6 h-6" /></button>
        </div>

        <div className="p-6 md:p-8 space-y-8">
           <div className="order-first">
            <div className="flex justify-between items-center mb-3">
                <label className={`text-sm font-bold ${textClass} flex items-center gap-2`}><BookText className={`w-4 h-4 ${textSecondary}`} /> Relato</label>
                {browserSupportsSpeech && (
                  <div className="flex items-center gap-2">
                    <button 
                      type="button" 
                      onClick={toggleListening} 
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                        isListening 
                          ? 'bg-red-500 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse' 
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                      title="Usar ditado por voz"
                    >
                        {isListening ? (
                          <>
                            <Activity className="w-3.5 h-3.5 animate-bounce" /> 
                            <span>Gravando...</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-3.5 h-3.5" /> 
                            <span>Ditar</span>
                          </>
                        )}
                    </button>
                  </div>
                )}
            </div>
            <div className="mb-3 flex flex-wrap gap-2">
                {reflectionPrompts.slice(0, 3).map((prompt, idx) => (
                    <button key={idx} type="button" onClick={() => setContext(p => ({...p, notes: p.notes + '\n' + prompt}))} className={`text-[10px] px-3 py-1.5 rounded-full border opacity-70 hover:opacity-100 ${textSecondary}`}>{prompt}</button>
                ))}
            </div>
            <div className="relative mb-4">
                <textarea 
                  value={context.notes} 
                  onChange={(e) => updateContext('notes', e.target.value)} 
                  placeholder={isListening ? "Escutando sua fala..." : "O que aconteceu? Como você se sente? (Escreva ou use o ditado)"}
                  className={`w-full px-4 py-3 rounded-xl border ${inputClass} min-h-[120px] outline-none text-sm transition-all resize-y ${isListening ? 'ring-2 ring-red-500/50 border-red-500/50' : ''}`} 
                />
                {context.notes && (
                  <button type="button" onClick={handleSmartFill} disabled={isSmartFilling} className={`absolute right-3 bottom-3 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg transition-all ${isSmartFilling ? 'bg-slate-200 cursor-not-allowed' : 'bg-indigo-500 text-white hover:bg-indigo-600'}`}>
                    {isSmartFilling ? 'Analisando...' : <><Wand2 className="w-3 h-3" /> Preencher com IA</>}
                  </button>
                )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 pt-2 border-t border-dashed" style={{ borderColor: theme === 'dark' ? '#334155' : '#e2e8f0' }}>
            <div className="pt-4">
                <label className={`block text-xs font-bold uppercase tracking-wider mb-3 ${textSecondary} flex items-center gap-2`}><MapPin className="w-4 h-4" /> Onde?</label>
                <div className="flex flex-wrap gap-2">
                {locations.map(loc => (<button key={loc} type="button" onClick={() => updateContext('location', loc)} className={`px-3 py-2 rounded-lg font-medium text-xs ${context.location === loc ? 'bg-blue-600 text-white' : `${inputClass} border`}`}>{loc}</button>))}
                {isAddingTag?.type === 'location' ? <input autoFocus type="text" className={`px-3 py-2 rounded-lg text-xs border w-24 ${inputClass}`} onBlur={(e) => handleAddCustomTag('location', e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTag('location', e.currentTarget.value)} /> : <button onClick={() => setIsAddingTag({ type: 'location', value: '' })} className={`px-2 py-2 rounded-lg border border-dashed opacity-50 hover:opacity-100 ${theme === 'dark' ? 'border-slate-600' : 'border-slate-300'}`}><Plus className="w-4 h-4" /></button>}
                </div>
            </div>
            <div className="pt-4">
                <label className={`block text-xs font-bold uppercase tracking-wider mb-3 ${textSecondary} flex items-center gap-2`}><Users className="w-4 h-4" /> Com quem?</label>
                <div className="flex flex-wrap gap-2">
                {companyOptions.map(comp => (<button key={comp} type="button" onClick={() => setContext(p => ({ ...p, company: p.company.includes(comp) ? p.company.filter(c => c !== comp) : [...p.company, comp] }))} className={`px-3 py-2 rounded-lg font-medium text-xs ${context.company.includes(comp) ? 'bg-blue-600 text-white' : `${inputClass} border`}`}>{comp}</button>))}
                </div>
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-3 ${textSecondary} flex items-center gap-2`}><Zap className="w-4 h-4" /> Motivo (Gatilho)</label>
            <div className="flex flex-wrap gap-2">
              {triggers.map(trig => (<button key={trig} type="button" onClick={() => updateContext('trigger', trig)} className={`px-3 py-2 rounded-lg font-medium text-xs ${context.trigger === trig ? 'bg-pink-600 text-white' : `${inputClass} border`}`}>{trig}</button>))}
            </div>
          </div>

          <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-200'} space-y-5`}>
            <div className="space-y-5">
                <div><div className="flex justify-between mb-2"><label className={`text-sm font-bold ${textClass} flex items-center gap-2`}><Moon className="w-4 h-4 text-indigo-500" /> Sono</label><span className={`text-sm font-bold ${textClass}`}>{context.sleepHours}h</span></div><input type="range" min="0" max="12" step="0.5" value={context.sleepHours} onChange={(e) => updateContext('sleepHours', parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer dark:bg-slate-700 accent-indigo-500" /></div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3"><Brain className={`w-5 h-5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} /><label className={`text-sm font-bold ${textClass}`}>Estratégias</label></div>
            <div className={`p-4 rounded-xl mb-4 border-l-4 ${theme === 'dark' ? 'bg-purple-900/20 border-purple-500' : 'bg-purple-50 border-purple-500'}`}>
               <div className="flex gap-3"><Lightbulb className={`w-5 h-5 flex-shrink-0 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} /><div><p className={`text-sm font-medium ${theme === 'dark' ? 'text-purple-300' : 'text-purple-900'} mb-3`}>{suggestionReason}</p><div className="flex flex-wrap gap-2">{suggestedStrategies.map(cop => (<button key={cop} type="button" onClick={() => toggleStrategy(cop)} className={`px-3 py-1.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${context.copingStrategies.includes(cop) ? 'bg-purple-600 text-white' : `${theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-700'} border`}`}>{cop}</button>))}</div></div></div>
            </div>
            <button type="button" onClick={() => setShowAllStrategies(!showAllStrategies)} className={`text-xs font-semibold ${textSecondary}`}>{showAllStrategies ? 'Menos' : 'Mais opções'} {showAllStrategies ? <ChevronUp className="w-4 h-4 inline" /> : <ChevronDown className="w-4 h-4 inline" />}</button>
            {showAllStrategies && (<div className="flex flex-wrap gap-2 mt-3">{otherStrategies.map(cop => (<button key={cop} type="button" onClick={() => toggleStrategy(cop)} className={`px-3 py-1.5 rounded-lg font-medium text-xs ${context.copingStrategies.includes(cop) ? 'bg-slate-600 text-white' : `${inputClass} border opacity-70`}`}>{cop}</button>))}</div>)}
          </div>
          
          {context.aiAdvice && (<div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-indigo-900/20 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'}`}><div className="flex gap-3"><Bot className="w-4 h-4 text-indigo-500" /><div className="flex-1"><p className={`text-sm italic ${theme === 'dark' ? 'text-indigo-100' : 'text-indigo-900'}`}>"{context.aiAdvice}"</p></div><button onClick={() => updateContext('aiAdvice', '')} className="text-indigo-400"><X className="w-4 h-4" /></button></div></div>)}

          <div className="flex gap-4 pt-4 sticky bottom-0 bg-inherit pb-4 border-t" style={{ borderColor: theme === 'dark' ? '#334155' : '#e2e8f0' }}>
            <button type="button" onClick={() => onSave({ emotion: emotionKey, level, ...context })} className="w-full px-6 py-4 rounded-xl font-bold text-lg text-white transition-all shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-500/50" style={{ background: `linear-gradient(135deg, ${emotionColor.light}, ${emotionColor.main})` }}>Salvar</button>
          </div>
        </div>
      </FocusTrap>
    </div>
    </>
  );
};

export default ContextForm;