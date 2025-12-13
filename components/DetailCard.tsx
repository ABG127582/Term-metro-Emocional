import React from 'react';
import { EmotionLevel, Theme, EmotionKey } from '../types';
import { EMOTION_COLORS } from '../constants';

interface DetailCardProps {
  level: EmotionLevel;
  theme: Theme;
  emotionKey: EmotionKey;
}

const DetailCard: React.FC<DetailCardProps> = ({ level, theme, emotionKey }) => {
  const textClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const textSecondary = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';
  const bgGlass = theme === 'dark' ? 'bg-slate-800/40' : 'bg-white/60';
  const borderGlass = theme === 'dark' ? 'border-white/10' : 'border-white/60';
  const emotionColor = EMOTION_COLORS[emotionKey];

  return (
    <div className={`${bgGlass} rounded-2xl p-6 space-y-6 backdrop-blur-md border ${borderGlass} shadow-sm animate-fade-in`} role="region" aria-label="Detalhes da emoção">
      <div className="flex items-center gap-4 pb-4 border-b border-slate-200/10">
        <div className="w-12 h-12 rounded-xl shadow-lg flex-shrink-0 ring-1 ring-white/20" style={{ background: `linear-gradient(135deg, ${emotionColor.light}, ${emotionColor.main})` }} aria-hidden="true" />
        <div>
          <h3 className={`text-xl font-black ${textClass} tracking-tight`}>{level.label}</h3>
          <p className={`text-sm ${textSecondary} font-medium`}>{level.desc}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Valência */}
        <div className="space-y-2">
           <div className="flex justify-between items-end">
              <span className={`text-xs font-bold uppercase tracking-wider ${textSecondary}`}>Valência</span>
              <span className={`text-lg font-black ${textClass}`}>{level.valence}</span>
           </div>
           <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
             <div 
                className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-red-500 via-yellow-400 to-green-500"
                style={{ width: `${(level.valence / 10) * 100}%` }}
             />
           </div>
           <div className="flex justify-between text-[10px] font-medium text-slate-400">
              <span>Desagradável</span>
              <span>Agradável</span>
           </div>
        </div>

        {/* Ativação */}
        <div className="space-y-2">
           <div className="flex justify-between items-end">
              <span className={`text-xs font-bold uppercase tracking-wider ${textSecondary}`}>Ativação</span>
              <span className={`text-lg font-black ${textClass}`}>{level.arousal}</span>
           </div>
           <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
             <div 
                className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-blue-400 to-red-500"
                style={{ width: `${(level.arousal / 10) * 100}%` }}
             />
           </div>
           <div className="flex justify-between text-[10px] font-medium text-slate-400">
              <span>Calmo</span>
              <span>Intenso</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-900/30' : 'bg-white/50'} border border-dashed ${theme === 'dark' ? 'border-slate-700' : 'border-slate-300'}`}>
             <p className={`text-[10px] font-bold uppercase ${textSecondary} mb-1.5`}>Exemplo Prático</p>
             <p className={`text-sm ${textClass} font-medium leading-relaxed`}>"{level.examples}"</p>
          </div>
          <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-indigo-900/20' : 'bg-indigo-50/80'} border border-indigo-500/20`}>
             <p className={`text-[10px] font-bold uppercase ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600'} mb-1.5`}>Estratégia de Regulação</p>
             <p className={`text-sm ${theme === 'dark' ? 'text-indigo-100' : 'text-indigo-900'} font-bold`}>{level.regulation}</p>
          </div>
      </div>
    </div>
  );
};

export default DetailCard;