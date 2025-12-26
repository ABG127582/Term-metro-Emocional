import React from 'react';
import { EmotionLevel } from '../types';
import { emotionColors } from '../constants';
import NeuroGraph from './NeuroGraph';

interface DetailCardProps {
  level: EmotionLevel;
  theme: 'light' | 'dark';
  emotionKey: string;
}

export const DetailCard: React.FC<DetailCardProps> = ({ level, theme, emotionKey }) => {
  const textClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const textSecondary = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';
  const bgSubtle = theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50';
  const emotionColor = emotionColors[emotionKey];

  return (
    <div className={`${bgSubtle} rounded-xl p-4 backdrop-blur-sm border ${theme === 'dark' ? 'border-slate-700/50' : 'border-slate-200/50'}`} role="region" aria-label="Detalhes da emoção">

      {/* Layout Grid: Esquerda (Infos) | Direita (Gráfico) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Coluna da Esquerda: Dados Básicos */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg flex-shrink-0" style={{ background: `linear-gradient(135deg, ${emotionColor.light}, ${emotionColor.main})` }} aria-hidden="true" />
            <div>
              <p className={`text-base font-bold ${textClass} leading-tight`}>{level.label}</p>
              <p className={`text-xs ${textSecondary} mt-1 leading-snug`}>{level.desc}</p>
              <p className="text-[10px] mt-2 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded inline-block">Regulação: {level.regulation}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider mb-1 opacity-70">
                <span>Valência</span>
                <span>{level.valence}</span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                   className="h-full bg-gradient-to-r from-red-400 to-emerald-400"
                   style={{ width: `${(level.valence / 10) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider mb-1 opacity-70">
                <span>Ativação</span>
                <span>{level.arousal}</span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                   className="h-full bg-gradient-to-r from-blue-400 to-red-400"
                   style={{ width: `${(level.arousal / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Coluna da Direita: Gráfico Neuroquímico */}
        <div className="lg:col-span-7 h-[180px] lg:h-auto">
          <NeuroGraph emotionKey={emotionKey} intensityLevel={level.level} theme={theme} />
        </div>

      </div>
    </div>
  );
};
