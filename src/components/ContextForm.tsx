import React, { useState, useRef, useEffect } from 'react';
import { EmotionScale, ContextData } from '../types';
import { emotionColors, somaticSensations } from '../constants';
import { Activity, X, Battery, BatteryLow, BatteryMedium, BatteryFull, Moon, Zap } from 'lucide-react';

interface ContextFormProps {
  emotionKey: string;
  emotion: EmotionScale;
  level: number;
  onSave: (data: any) => void;
  onCancel: () => void;
  theme: 'light' | 'dark';
}

export const ContextForm: React.FC<ContextFormProps> = ({ emotionKey, emotion, level, onSave, onCancel, theme }) => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const defaultDate = now.toISOString().slice(0, 16);

  const [date, setDate] = useState(defaultDate);
  const [context, setContext] = useState<ContextData>({
    location: 'Casa',
    company: [],
    trigger: '',
    duration: '1-5m',
    copingStrategies: [],
    bodySensations: [],
    sleepHours: 7,
    energy: 5,
    notes: '',
    secondaryEmotion: null,
    secondaryLevel: 0,
    customValence: emotion.levels[level - 1]?.valence || 5,
    customArousal: emotion.levels[level - 1]?.arousal || 5
  });

  const textClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const textSecondary = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';
  const inputClass = theme === 'dark'
    ? 'bg-slate-800 border-slate-700 text-white'
    : 'bg-white border-slate-200 text-slate-900';
  const emotionColor = emotionColors[emotionKey];

  const locations = ['Casa', 'Trabalho', 'Escola', 'Rua', 'Online'];
  const companyOptions = ['Só', 'Família', 'Amigos', 'Parceiro', 'Colegas'];
  const triggers = ['Reunião', 'Email', 'Crítica', 'Elogio', 'Erro', 'Pensamento', 'Notícia'];
  const copingOptions = ['Respirar', 'Sair', 'Música', 'Água', 'Exercício', 'Escrever', 'Falar'];

  // --- Helper para Cores Neon do Sono ---
  const getSleepColor = (hours: number) => {
    if (hours < 5) return '#ff0033'; // Vermelho Neon Crítico
    if (hours < 7) return '#ffaa00'; // Laranja Alerta
    return '#39ff14'; // Verde Néon Vibrante
  };

  const currentSleepColor = getSleepColor(context.sleepHours);

  // --- Componente Customizado de Slider Futurista ---
  const SleepSlider = () => {
    const percentage = (context.sleepHours / 12) * 100;

    return (
      <div className="relative h-12 w-full bg-black rounded-xl border border-slate-700 overflow-hidden shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] group touch-none">
        {/* Textura de Fundo (Grid) */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />

        {/* Marcadores de Hora (Régua) */}
        <div className="absolute inset-0 flex justify-between px-3 items-center pointer-events-none opacity-40">
           {[0, 3, 6, 9, 12].map(h => (
             <div key={h} className="h-2 w-0.5 bg-white shadow-[0_0_5px_white]" />
           ))}
        </div>

        {/* Trilha Gradiente (Track) */}
        <div className="absolute top-1/2 left-3 right-3 h-1.5 -mt-0.5 rounded-full bg-slate-800 overflow-visible">
           {/* O Gradiente Solicitado: Vermelho (0) -> Verde Neon (7+) */}
           <div className="absolute inset-0 rounded-full opacity-80"
                style={{
                  background: 'linear-gradient(90deg, #ff0033 0%, #ff4400 30%, #ffff00 45%, #39ff14 58%, #39ff14 100%)',
                  boxShadow: '0 0 10px rgba(255,255,255,0.1)'
                }}
           />
        </div>

        {/* Input Invisível (Interação) */}
        <input
          type="range" min="0" max="12" step="0.1"
          value={context.sleepHours}
          onChange={(e) => setContext(prev => ({ ...prev, sleepHours: parseFloat(e.target.value) }))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          aria-label="Horas de sono"
        />

        {/* Thumb Customizado (Visual) */}
        <div
          className="absolute top-1/2 h-6 w-6 -mt-3 -ml-3 z-10 pointer-events-none transition-all duration-75"
          style={{ left: `calc(${percentage}% - ${(percentage/100)*12}px + 6px)` }} // Ajuste fino de posição
        >
           <div
             className="w-full h-full rounded-full bg-white border-2 border-white transition-all duration-300"
             style={{
               boxShadow: `0 0 15px ${currentSleepColor}, 0 0 30px ${currentSleepColor}, inset 0 0 5px ${currentSleepColor}`,
               backgroundColor: '#fff'
             }}
           />
           {/* Linha vertical de guia */}
           <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 w-0.5 h-full bg-gradient-to-t from-white to-transparent opacity-50" />
        </div>
      </div>
    );
  };

  // Componente interno para Seleção de Energia (Baterias)
  const EnergySelector = () => {
    const levels = [1, 3, 5, 7, 9]; // Mapeando para 5 ícones
    return (
      <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-900/50 border border-transparent dark:border-slate-700 rounded-lg p-2">
        {levels.map((val, idx) => {
          const isSelected = context.energy >= val;
          const isCurrent = context.energy >= val && (idx === levels.length - 1 || context.energy < levels[idx + 1]);

          let Icon = Battery;
          if (idx === 0) Icon = BatteryLow;
          if (idx === 2) Icon = BatteryMedium;
          if (idx === 4) Icon = BatteryFull;

          // Cores de energia: Baixa (Vermelho) -> Média (Amarelo) -> Alta (Azul Neon/Ciano)
          let activeColorClass = 'text-slate-400';
          let dropShadow = '';

          if (isSelected) {
             if (val < 4) {
                activeColorClass = 'text-red-500';
                if(isCurrent) dropShadow = 'drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]';
             } else if (val < 8) {
                activeColorClass = 'text-yellow-400';
                if(isCurrent) dropShadow = 'drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]';
             } else {
                activeColorClass = 'text-cyan-400';
                if(isCurrent) dropShadow = 'drop-shadow-[0_0_10px_rgba(34,211,238,0.9)]';
             }
          }

          return (
            <button
              key={val}
              onClick={() => setContext(prev => ({ ...prev, energy: val + 1 }))}
              className={`p-1 rounded transition-all transform hover:scale-110 ${activeColorClass} ${isCurrent ? `scale-110 ${dropShadow}` : ''} ${!isSelected && theme === 'dark' ? 'text-slate-700' : ''}`}
              title={`Energia Nível ${idx + 1}/5`}
            >
              <Icon className={`w-6 h-6 ${isCurrent ? 'fill-current' : ''}`} />
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-2`} role="dialog">
      <div className={`${theme === 'dark' ? 'bg-slate-900 border border-slate-700' : 'bg-white'} rounded-2xl w-full max-w-4xl h-auto max-h-[95vh] flex flex-col overflow-hidden shadow-2xl`}>

        {/* Header Compacto */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.2)]" style={{ background: `linear-gradient(135deg, ${emotionColor.light}, ${emotionColor.main})` }} />
             <div>
                <h2 className={`text-lg font-bold ${textClass} leading-none`}>{emotion.name} <span className="opacity-60 text-sm font-normal">• Nível {level}</span></h2>
                <p className={`text-xs ${textSecondary}`}>{emotion.levels[level-1]?.label}</p>
             </div>
          </div>
          <button onClick={onCancel} className={`p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${textSecondary}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo em Grid Denso */}
        <div className="flex-1 overflow-y-auto p-5">
           <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

              {/* Linha 1: Data e Métricas Fisiológicas */}
              <div className="md:col-span-4 space-y-1">
                 <label className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>Quando?</label>
                 <input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`w-full px-2 py-2 rounded border text-xs ${inputClass} outline-none focus:ring-1 focus:ring-blue-500`}
                 />
              </div>

              {/* Controle de Sono FUTURISTA */}
              <div className="md:col-span-4 space-y-1">
                 <div className="flex justify-between items-center mb-1">
                    <label className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>
                      <Moon className="w-3 h-3" /> Sono
                    </label>
                    <span
                      className="text-sm font-mono font-bold transition-colors duration-300"
                      style={{
                        color: currentSleepColor,
                        textShadow: `0 0 10px ${currentSleepColor}`
                      }}
                    >
                      {context.sleepHours}h
                    </span>
                 </div>
                 <SleepSlider />
              </div>

              <div className="md:col-span-4 space-y-1">
                 <div className="flex justify-between items-center mb-1">
                    <label className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>
                      <Zap className="w-3 h-3" /> Energia
                    </label>
                    <span className={`text-xs font-mono font-bold ${textClass}`}>
                      {context.energy}/10
                    </span>
                 </div>
                 <EnergySelector />
              </div>

              {/* Linha 2: Calibragem Afetiva e Contexto */}
              <div className={`md:col-span-6 p-3 rounded-lg border ${theme === 'dark' ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                 <p className={`text-xs font-bold mb-3 ${textClass}`}>Calibragem do Sentimento</p>
                 <div className="space-y-4">
                    <div>
                       <div className="flex justify-between text-[10px] mb-1 opacity-70">
                          <span>Desprazer</span>
                          <span className="font-bold">Valência: {context.customValence}</span>
                          <span>Prazer</span>
                       </div>
                       <input
                          type="range" min="1" max="10" step="0.5"
                          value={context.customValence}
                          onChange={(e) => setContext(prev => ({ ...prev, customValence: parseFloat(e.target.value) }))}
                          className="w-full h-1.5 bg-gradient-to-r from-red-500 via-gray-400 to-emerald-500 rounded-lg appearance-none cursor-pointer"
                       />
                    </div>
                    <div>
                       <div className="flex justify-between text-[10px] mb-1 opacity-70">
                          <span>Calmo</span>
                          <span className="font-bold">Ativação: {context.customArousal}</span>
                          <span>Agitado</span>
                       </div>
                       <input
                          type="range" min="1" max="10" step="0.5"
                          value={context.customArousal}
                          onChange={(e) => setContext(prev => ({ ...prev, customArousal: parseFloat(e.target.value) }))}
                          className="w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 rounded-lg appearance-none cursor-pointer"
                       />
                    </div>
                 </div>
              </div>

              <div className="md:col-span-6 grid grid-cols-2 gap-3">
                 <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${textSecondary}`}>Onde?</label>
                    <div className="flex flex-wrap gap-1">
                       {locations.map(loc => (
                          <button key={loc} onClick={() => setContext(prev => ({ ...prev, location: loc }))}
                             className={`px-2 py-1 rounded text-[10px] font-medium border transition-colors ${context.location === loc ? 'bg-blue-600 text-white border-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]' : `${inputClass} opacity-70 hover:opacity-100`}`}>
                             {loc}
                          </button>
                       ))}
                    </div>
                 </div>
                 <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${textSecondary}`}>Quem?</label>
                    <div className="flex flex-wrap gap-1">
                       {companyOptions.map(comp => (
                          <button key={comp} onClick={() => setContext(prev => ({ ...prev, company: prev.company.includes(comp) ? prev.company.filter(c => c !== comp) : [...prev.company, comp] }))}
                             className={`px-2 py-1 rounded text-[10px] font-medium border transition-colors ${context.company.includes(comp) ? 'bg-purple-600 text-white border-purple-600 shadow-[0_0_10px_rgba(147,51,234,0.4)]' : `${inputClass} opacity-70 hover:opacity-100`}`}>
                             {comp}
                          </button>
                       ))}
                    </div>
                 </div>
                 <div className="col-span-2">
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${textSecondary}`}>Gatilho</label>
                    <div className="flex flex-wrap gap-1">
                       {triggers.map(trig => (
                          <button key={trig} onClick={() => setContext(prev => ({ ...prev, trigger: trig }))}
                             className={`px-2 py-1 rounded text-[10px] font-medium border transition-colors ${context.trigger === trig ? 'bg-pink-600 text-white border-pink-600 shadow-[0_0_10px_rgba(219,39,119,0.4)]' : `${inputClass} opacity-70 hover:opacity-100`}`}>
                             {trig}
                          </button>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Linha 3: Marcadores Somáticos e Estratégias */}
              <div className="md:col-span-12 space-y-3">
                 <div>
                    <div className="flex items-center gap-1.5 mb-2">
                       <Activity className="w-3 h-3 text-pink-500" />
                       <label className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>Corpo (Onde você sente?)</label>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                       {somaticSensations.slice(0, 10).map(sensation => (
                          <button key={sensation}
                             onClick={() => setContext(prev => ({ ...prev, bodySensations: prev.bodySensations.includes(sensation) ? prev.bodySensations.filter(s => s !== sensation) : [...prev.bodySensations, sensation] }))}
                             className={`px-2 py-1.5 rounded text-[10px] border transition-all ${context.bodySensations.includes(sensation) ? 'bg-pink-500 text-white border-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.4)]' : `${inputClass} hover:border-pink-400 opacity-80 hover:opacity-100`}`}>
                             {sensation}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${textSecondary}`}>Estratégias de Regulação</label>
                    <div className="flex flex-wrap gap-1.5">
                       {copingOptions.map(cop => (
                          <button key={cop}
                             onClick={() => setContext(prev => ({ ...prev, copingStrategies: prev.copingStrategies.includes(cop) ? prev.copingStrategies.filter(c => c !== cop) : [...prev.copingStrategies, cop] }))}
                             className={`px-2 py-1.5 rounded text-[10px] border transition-all ${context.copingStrategies.includes(cop) ? 'bg-green-500 text-white border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : `${inputClass} hover:border-green-400 opacity-80 hover:opacity-100`}`}>
                             {cop}
                          </button>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Notas */}
              <div className="md:col-span-12">
                 <textarea
                   value={context.notes}
                   onChange={(e) => setContext(prev => ({ ...prev, notes: e.target.value }))}
                   placeholder="Alguma observação rápida sobre este momento?"
                   className={`w-full px-3 py-2 rounded-lg border text-xs ${inputClass} outline-none h-16 resize-none focus:ring-1 focus:ring-blue-500`}
                 />
              </div>

           </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 px-5 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0">
          <button onClick={onCancel} className={`flex-1 px-4 py-3 rounded-lg font-bold text-xs uppercase tracking-wide transition-all ${inputClass} border hover:bg-slate-100 dark:hover:bg-slate-800`}>
            Cancelar
          </button>
          <button onClick={() => onSave({ emotion: emotionKey, level, customTimestamp: new Date(date).toISOString(), ...context })}
            className="flex-1 px-4 py-3 rounded-lg font-bold text-white text-xs uppercase tracking-wide transition-all shadow-lg hover:brightness-110 hover:translate-y-[-1px]"
            style={{ background: `linear-gradient(135deg, ${emotionColor.light}, ${emotionColor.main})` }}>
            Salvar Registro
          </button>
        </div>

      </div>
    </div>
  );
};
