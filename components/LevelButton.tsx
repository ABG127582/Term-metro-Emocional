import React from 'react';
import { EmotionKey, EmotionLevel, EmotionScale, Theme } from '../types';
import { EMOTION_COLORS } from '../constants';

interface LevelButtonProps {
  emotionKey: EmotionKey;
  emotion: EmotionScale;
  item: EmotionLevel;
  index: number;
  isHovered: boolean;
  isSelected: boolean;
  onHover: (data: { emotionKey: EmotionKey; level: EmotionLevel } | null) => void;
  onSelect: (emotionKey: EmotionKey, level: number) => void;
  theme: Theme;
}

const LevelButton: React.FC<LevelButtonProps> = ({
  emotionKey,
  emotion,
  item,
  index,
  isHovered,
  isSelected,
  onHover,
  onSelect,
  theme
}) => {
  const emotionColor = EMOTION_COLORS[emotionKey];
  
  // Position Logic
  const leftPosition = `${(index / (emotion.levels.length - 1)) * 100}%`;
  
  // Alternating Labels: Even numbers (0, 2, 4, 6) on TOP, Odd numbers (1, 3, 5) on BOTTOM
  // Index 0 is Level 1
  const isTopLabel = index % 2 !== 0; 

  const isActive = isHovered || isSelected;

  return (
    <div
      className="absolute flex flex-col items-center z-20 group"
      style={{
        left: leftPosition,
        top: '50%',
        transform: 'translate(-50%, -50%)'
      }}
    >
      {/* Button Node */}
      <button
        type="button"
        onMouseEnter={() => onHover({ emotionKey, level: item })}
        onMouseLeave={() => onHover(null)}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(emotionKey, item.level);
        }}
        onFocus={() => onHover({ emotionKey, level: item })}
        onBlur={() => onHover(null)}
        className={`relative flex items-center justify-center rounded-full font-black leading-none transition-all duration-300 cursor-pointer focus:outline-none ${
          isActive
            ? 'w-12 h-12 md:w-14 md:h-14 scale-110 shadow-2xl ring-4 z-30'
            : 'w-6 h-6 md:w-8 md:h-8 bg-slate-200 dark:bg-slate-700 text-slate-400 shadow-md hover:scale-125 hover:bg-white z-20'
        }`}
        style={{
          background: isActive ? `linear-gradient(135deg, ${emotionColor.light}, ${emotionColor.main})` : undefined,
          color: isActive ? 'white' : undefined,
          boxShadow: isActive ? `0 10px 25px -5px ${emotionColor.glow}` : undefined,
          borderColor: isSelected ? emotionColor.dark : 'transparent', // Helper border for selection
        }}
        aria-label={`${emotion.name} nível ${item.level}: ${item.label}`}
        aria-pressed={isSelected}
      >
        {/* Ring for Selected State */}
        {isSelected && (
             <span className={`absolute -inset-1.5 rounded-full border-2 opacity-50 animate-pulse`} style={{ borderColor: emotionColor.main }}></span>
        )}

        {/* Pulse effect for hovered item */}
        {isHovered && !isSelected && (
            <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ backgroundColor: emotionColor.main }}></span>
        )}
        <span className={`relative z-10 ${isActive ? 'text-lg md:text-xl' : 'text-[10px] md:text-xs opacity-0 group-hover:opacity-100'}`}>{item.level}</span>
      </button>

      {/* Permanent Label - ZigZag Pattern */}
      <div 
        className={`absolute w-32 text-center pointer-events-none transition-all duration-300 ${
            isTopLabel 
                ? 'bottom-full mb-5 md:mb-6' // Position Above
                : 'top-full mt-5 md:mt-6'    // Position Below
        }`}
      >
        <div className={`flex flex-col items-center gap-1 ${isTopLabel ? 'flex-col-reverse' : 'flex-col'}`}>
            {/* Connector Line */}
            <div className={`h-4 w-px transition-all duration-300`} style={{ 
                background: isActive ? `linear-gradient(to bottom, transparent, ${emotionColor.main}, transparent)` : (theme === 'dark' ? '#475569' : '#cbd5e1'), // Slate-600 or Slate-300
                opacity: isActive ? 1 : 0.4,
                height: isActive ? '24px' : '16px'
            }}></div>
            
            {/* The Text Label */}
            <span 
                className={`text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all duration-300 px-2 py-1 rounded-lg ${
                    isActive
                        ? `opacity-100 scale-110 bg-white dark:bg-slate-800 shadow-lg ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`
                        : `opacity-60 grayscale ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`
                }`}
                style={{
                    color: isActive ? emotionColor.main : undefined,
                    border: isSelected ? `1px solid ${emotionColor.main}40` : '1px solid transparent'
                }}
            >
                {item.label}
            </span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(LevelButton);