import React from 'react';
import { ChevronDown } from 'lucide-react';
import { EmotionScale, EmotionLevel } from '../types';
import { emotionColors } from '../constants';
import { LevelButton } from './LevelButton';
import { DetailCard } from './DetailCard';

interface EmotionCardProps {
  emotionKey: string;
  emotion: EmotionScale;
  isExpanded: boolean;
  hoveredLevel: { emotionKey: string; level: EmotionLevel } | null;
  onCardToggle: (key: string) => void;
  onHoverLevel: (data: { emotionKey: string; level: EmotionLevel } | null) => void;
  onSave: (emotionKey: string, level: number) => void;
  theme: 'light' | 'dark';
}

export const EmotionCard: React.FC<EmotionCardProps> = ({
  emotionKey,
  emotion,
  isExpanded,
  hoveredLevel,
  onCardToggle,
  onHoverLevel,
  onSave,
  theme
}) => {
  const IconComp = emotion.icon;
  const textClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const textSecondary = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';
  const emotionColor = emotionColors[emotionKey];

  // Determina o nível atual sendo focado nesta emoção específica
  const currentHoveredLevelValue = (hoveredLevel?.emotionKey === emotionKey) ? hoveredLevel.level.level : 0;

  return (
    <div
      className={`rounded-2xl p-6 md:p-8 transition-all duration-500 ease-out cursor-pointer backdrop-blur-md border-2 overflow-hidden relative`}
      onClick={() => onCardToggle(emotionKey)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCardToggle(emotionKey);
        }
      }}
      style={{
        background: theme === 'dark'
          ? `linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.95))`
          : `linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.95))`,
        borderColor: isExpanded ? emotionColor.main : 'transparent',
        boxShadow: isExpanded
          ? `0 0 30px ${emotionColor.glow}, inset 0 0 20px ${emotionColor.glow}`
          : theme === 'dark' ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.1)'
      }}
      aria-expanded={isExpanded}
      aria-label={`${emotion.name}, clique para expandir`}
    >
      {/* Glow Effect de fundo quando expandido */}
      {isExpanded && (
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[100px] opacity-20 pointer-events-none transition-opacity duration-1000"
          style={{ background: emotionColor.main }}
        />
      )}

      <div className="relative z-10 flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg relative group overflow-hidden"
            style={{
              background: theme === 'dark' ? '#0f172a' : '#ffffff',
              boxShadow: isExpanded ? `0 0 20px ${emotionColor.glow}` : 'none',
              border: `1px solid ${isExpanded ? emotionColor.main : 'transparent'}`
            }}
            aria-hidden="true"
          >
            {/* Fundo colorido animado no ícone */}
            <div
              className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-300"
              style={{ background: emotionColor.main }}
            />
            <IconComp
              className="w-7 h-7 relative z-10 transition-colors duration-300"
              style={{
                color: isExpanded ? emotionColor.main : (theme === 'dark' ? '#94a3b8' : '#64748b'),
                filter: isExpanded ? `drop-shadow(0 0 5px ${emotionColor.main})` : 'none'
              }}
            />
          </div>
          <div>
            <h2 className={`text-2xl font-black uppercase tracking-tight ${textClass}`} style={{ textShadow: isExpanded ? `0 0 20px ${emotionColor.glow}` : 'none' }}>
              {emotion.name}
            </h2>
            <p className={`text-xs ${textSecondary} font-mono uppercase tracking-widest opacity-70`}>
              {isExpanded ? 'Monitoramento Ativo' : 'Toque para expandir'}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-6 h-6 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} ${textSecondary}`}
          aria-hidden="true"
        />
      </div>

      <div className={`relative z-10 transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="relative min-h-[140px] px-10 pt-8 pb-4">

          {/* TRILHA (Barra de Fundo) - Estilo "Trilho Desligado" */}
          <div
            className="h-3 rounded-full relative overflow-visible"
            style={{
              background: theme === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.1)',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)'
            }}
            role="region"
            aria-label="Escala de emoção"
          >

            {/* FEIXE DE LUZ (Barra de Progresso) - Estilo "Néon" */}
            <div
              className="absolute top-0 left-0 h-full rounded-full transition-all duration-300 pointer-events-none"
              style={{
                width: currentHoveredLevelValue > 0
                  ? `${((currentHoveredLevelValue - 1) / (emotion.levels.length - 1)) * 100}%`
                  : '0%',
                background: emotionColor.main,
                boxShadow: `0 0 10px ${emotionColor.main}, 0 0 20px ${emotionColor.glow}`
              }}
            />

            {emotion.levels.map((item, index) => {
              const isActive = currentHoveredLevelValue >= item.level;
              const isCurrent = currentHoveredLevelValue === item.level;

              return (
                <LevelButton
                  key={item.level}
                  emotionKey={emotionKey}
                  emotion={emotion}
                  item={item}
                  index={index}
                  isActive={isActive}
                  isCurrent={isCurrent}
                  onHover={onHoverLevel}
                  onSave={onSave}
                  theme={theme}
                />
              );
            })}
          </div>

          {/* Área de Detalhes - Com margem aumentada para evitar sobreposição dos labels */}
          <div className="pt-2 mt-24">
            {hoveredLevel && hoveredLevel.emotionKey === emotionKey ? (
              <DetailCard level={hoveredLevel.level} theme={theme} emotionKey={emotionKey} />
            ) : (
              <div className="flex items-center justify-center h-full min-h-[180px] pt-4 opacity-50">
                <p className={`${textSecondary} text-xs font-mono uppercase tracking-widest`}>
                  Selecione uma intensidade
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
