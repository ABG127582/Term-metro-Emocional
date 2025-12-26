import React, { useState } from 'react';
import { EmotionScale, EmotionLevel } from '../types';
import { emotionColors } from '../constants';

interface LevelButtonProps {
  emotionKey: string;
  emotion: EmotionScale;
  item: EmotionLevel;
  index: number;
  isActive: boolean; // Se faz parte do caminho (ex: mouse no 3, o 1 e 2 são active)
  isCurrent: boolean; // Se é o alvo exato do mouse
  onHover: (data: { emotionKey: string; level: EmotionLevel } | null) => void;
  onSave: (emotionKey: string, level: number) => void;
  theme: 'light' | 'dark';
}

export const LevelButton: React.FC<LevelButtonProps> = ({ emotionKey, emotion, item, index, isActive, isCurrent, onHover, onSave, theme }) => {
  const emotionColor = emotionColors[emotionKey];
  const [showTooltip, setShowTooltip] = useState(false);

  // Define os estilos baseados no estado com estética Neon/Futurista
  const getButtonStyles = () => {
    const mainColor = emotionColor.main;

    if (isCurrent) {
      // ESTADO: NÚCLEO ATIVO (Alvo atual)
      // Visual: Centro branco (quente) explodindo luz colorida
      return {
        className: 'scale-125 z-20 transition-all duration-300',
        style: {
          background: '#FFFFFF',
          color: mainColor,
          border: `2px solid ${mainColor}`,
          boxShadow: `
            0 0 10px ${mainColor},
            0 0 20px ${mainColor},
            0 0 40px ${mainColor},
            inset 0 0 10px ${mainColor}
          `
        }
      };
    } else if (isActive) {
      // ESTADO: CAMINHO ENERGIZADO (Anteriores)
      // Visual: Cor sólida néon, brilho médio
      return {
        className: 'scale-110 z-10 transition-all duration-300',
        style: {
          background: mainColor,
          color: '#FFFFFF',
          border: '2px solid rgba(255,255,255,0.5)',
          boxShadow: `0 0 15px ${mainColor}`
        }
      };
    } else {
      // ESTADO: INATIVO (Desligado)
      // Visual: Vidro escuro/fosco, borda sutil, sem brilho
      return {
        className: 'z-0 transition-all duration-300 hover:scale-110',
        style: {
          background: theme === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          color: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
          border: `2px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          boxShadow: 'none'
        }
      };
    }
  };

  const buttonStyle = getButtonStyles();

  return (
    <div
      className="absolute flex flex-col items-center"
      style={{
        left: `${(index / (emotion.levels.length - 1)) * 100}%`,
        // Ajuste fino para centralizar o botão (h-14/56px) na linha (h-3/12px)
        // Centro Botão (28px) - Centro Linha (6px) = 22px de deslocamento para cima (~1.375rem)
        top: '-1.375rem',
        transform: 'translateX(-50%)'
      }}
    >
      <button
        type="button"
        onMouseEnter={() => { setShowTooltip(true); onHover({ emotionKey, level: item }); }}
        onMouseLeave={() => { setShowTooltip(false); onHover(null); }}
        onClick={(e) => {
          e.stopPropagation();
          onSave(emotionKey, item.level);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSave(emotionKey, item.level);
          }
        }}
        className={`w-14 h-14 flex items-center justify-center rounded-full font-black text-lg cursor-pointer outline-none ${buttonStyle.className}`}
        style={buttonStyle.style}
        aria-label={`${emotion.name} nível ${item.level}: ${item.label}`}
        aria-pressed={isActive}
      >
        {item.level}
      </button>

      {showTooltip && (
        <div className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900/90 text-white px-4 py-3 rounded-lg text-xs whitespace-nowrap shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-md" role="tooltip">
          <p className="font-bold text-sm text-center uppercase tracking-wider" style={{ color: isActive ? emotionColor.chart : 'white' }}>{item.label}</p>
          <p className="text-slate-300 text-xs mt-1">{item.desc.substring(0, 40)}...</p>
        </div>
      )}

      <span
        className={`relative text-[10px] uppercase tracking-widest mt-8 text-center max-w-24 transition-all duration-300 font-bold`}
        style={{
          color: isActive ? emotionColor.main : (theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'),
          textShadow: isActive ? `0 0 10px ${emotionColor.glow}` : 'none',
          opacity: isActive || isCurrent ? 1 : 0.7
        }}
      >
        {item.label}
      </span>
    </div>
  );
};
