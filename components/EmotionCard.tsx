import React, { useState, useMemo } from 'react';
import { ChevronDown, Beaker, Check, Zap } from 'lucide-react';
import { EmotionKey, EmotionScale, EmotionLevel, Theme } from '../types';
import { EMOTION_COLORS } from '../constants';
import LevelButton from './LevelButton';
import DetailCard from './DetailCard';
import NeuroGraph from './NeuroGraph';

interface EmotionCardProps {
  emotionKey: EmotionKey;
  emotion: EmotionScale;
  isExpanded: boolean;
  hoveredLevel: { emotionKey: EmotionKey; level: EmotionLevel } | null;
  selectedLevel: { emotionKey: EmotionKey; level: number } | null;
  onCardToggle: (key: EmotionKey) => void;
  onHoverLevel: (data: { emotionKey: EmotionKey; level: EmotionLevel } | null) => void;
  onSelectLevel: (key: EmotionKey, level: number) => void;
  onOpenRegister: (key: EmotionKey, level: number) => void;
  onQuickSave?: (key: EmotionKey, level: number) => void;
  theme: Theme;
}

const EmotionCard: React.FC<EmotionCardProps> = ({
  emotionKey,
  emotion,
  isExpanded,
  hoveredLevel,
  selectedLevel,
  onCardToggle,
  onHoverLevel,
  onSelectLevel,
  onOpenRegister,
  onQuickSave,
  theme
}) => {
  const IconComp = emotion.icon;
  const [showNeuro, setShowNeuro] = useState(false);
  const textClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const textSecondary = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';
  const emotionColor = EMOTION_COLORS[emotionKey];

  const isCurrentEmotionHovered = hoveredLevel?.emotionKey === emotionKey;
  const isCurrentEmotionSelected = selectedLevel?.emotionKey === emotionKey;
  
  // Priority: Hover > Selected
  const displayLevelObj = useMemo(() => {
    if (isCurrentEmotionHovered && hoveredLevel) {
        return hoveredLevel.level;
    }
    if (isCurrentEmotionSelected && selectedLevel) {
        return emotion.levels.find(l => l.level === selectedLevel.level);
    }
    return null;
  }, [isCurrentEmotionHovered, hoveredLevel, isCurrentEmotionSelected, selectedLevel, emotion.levels]);

  // Reset neuro view when collapsing card
  React.useEffect(() => {
    if (!isExpanded) setShowNeuro(false);
  }, [isExpanded]);

  const fillLevel = displayLevelObj ? displayLevelObj.level : 0;
  const fillPercentage = (fillLevel / 7) * 100;

  // Dynamic Gradient Styles
  const backgroundStyle = isExpanded
    ? theme === 'dark'
        ? `linear-gradient(135deg, ${emotionColor.dark}40, ${emotionColor.main}20)`
        : `linear-gradient(135deg, ${emotionColor.light}40, ${emotionColor.light}10)`
    : theme === 'dark'
        ? `linear-gradient(145deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8))`
        : `linear-gradient(145deg, #ffffff, #f8fafc)`;

  const borderStyle = isExpanded
    ? `1px solid ${emotionColor.main}60`
    : theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)';

  const shadowStyle = isExpanded 
    ? `0 20px 40px -10px ${emotionColor.glow}` 
    : '0 4px 6px -1px rgba(0, 0, 0, 0.05)';

  return (
    <div
      className={`rounded-3xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] backdrop-blur-xl overflow-visible group relative`}
      style={{
        background: backgroundStyle,
        border: borderStyle,
        boxShadow: shadowStyle
      }}
    >
      {/* Ghost overlay */}
      {!isExpanded && (
          <div 
            className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ background: `linear-gradient(135deg, ${emotionColor.glow}, transparent)` }} 
          />
      )}

      <button
        onClick={() => onCardToggle(emotionKey)}
        className="w-full flex items-center justify-between p-6 md:p-8 text-left focus:outline-none relative z-10"
        aria-expanded={isExpanded}
        aria-label={`${emotion.name}, clique para ${isExpanded ? 'colapsar' : 'expandir'}`}
      >
        <div className="flex items-center gap-5 md:gap-6">
          <div
            className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 ring-1 ring-white/20 ${isExpanded ? 'scale-110 rotate-3' : 'group-hover:scale-105 group-hover:rotate-3'}`}
            style={{ background: `linear-gradient(135deg, ${emotionColor.light}, ${emotionColor.main})` }}
          >
            <IconComp className="w-8 h-8 md:w-10 md:h-10 text-white drop-shadow-md" />
          </div>
          <div>
            <h2 className={`text-3xl md:text-4xl font-black ${textClass} tracking-tight transition-transform duration-300 ${isExpanded ? 'translate-x-2' : 'group-hover:translate-x-1'}`}>
                {emotion.name}
            </h2>
            <p className={`text-sm ${textSecondary} font-medium mt-1 tracking-wide uppercase opacity-80 flex items-center gap-2`}>
               {isExpanded ? <span className="text-indigo-500 font-bold">Selecione a intensidade</span> : 'Explore 7 níveis'}
            </p>
          </div>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${isExpanded ? 'bg-indigo-500 text-white rotate-180 shadow-lg shadow-indigo-500/30' : (theme === 'dark' ? 'bg-white/5 group-hover:bg-white/10' : 'bg-slate-100 group-hover:bg-slate-200')}`}>
           <ChevronDown className={`w-6 h-6 transition-transform duration-500 ${!isExpanded && textSecondary}`} />
        </div>
      </button>

      <div className={`transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isExpanded ? 'max-h-[1800px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-6 md:p-8 pt-4">
          <div className="relative pt-12 pb-8 px-2 md:px-6">
            
            {/* Scale Track */}
            <div className="relative h-3 md:h-4 rounded-full bg-slate-200/50 dark:bg-slate-800/50 shadow-inner mb-24 md:mb-28 backdrop-blur-sm overflow-visible mt-8">
               <div 
                 className="absolute top-0 left-0 h-full rounded-full transition-all duration-300 ease-out opacity-80 shadow-[0_0_20px_rgba(0,0,0,0.2)]"
                 style={{ 
                    width: `${fillPercentage}%`,
                    background: `linear-gradient(90deg, ${emotionColor.light}, ${emotionColor.main})`,
                    boxShadow: `0 0 15px ${emotionColor.main}66`
                 }}
               />
               
              {emotion.levels.map((item, index) => (
                <LevelButton
                  key={item.level}
                  emotionKey={emotionKey}
                  emotion={emotion}
                  item={item}
                  index={index}
                  isHovered={isCurrentEmotionHovered && hoveredLevel?.level.level === item.level}
                  isSelected={isCurrentEmotionSelected && selectedLevel?.level === item.level}
                  onHover={onHoverLevel}
                  onSelect={onSelectLevel}
                  theme={theme}
                />
              ))}
            </div>

            <div className="min-h-[300px] transition-all duration-300">
              {displayLevelObj ? (
                <div className="space-y-6 animate-fade-in-up">
                    <DetailCard level={displayLevelObj} theme={theme} emotionKey={emotionKey} />
                    
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setShowNeuro(!showNeuro); }}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${showNeuro ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : `${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-indigo-400' : 'bg-white hover:bg-slate-50 text-indigo-600'} border border-indigo-500/20`}`}
                        >
                            <Beaker className="w-4 h-4" />
                            {showNeuro ? 'Ocultar Neurociência' : 'Ver Impacto Neuroquímico'}
                        </button>
                        
                        {/* Action Group */}
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            {onQuickSave && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onQuickSave(emotionKey, displayLevelObj.level); }}
                                    className={`p-3 rounded-xl shadow-lg border transition-all duration-200 hover:scale-105 active:scale-95 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700' : 'bg-white border-slate-200 text-amber-600 hover:bg-slate-50'}`}
                                    title="Registro Rápido (Sem detalhes)"
                                >
                                    <Zap className="w-5 h-5" />
                                </button>
                            )}
                            <button
                                onClick={(e) => { e.stopPropagation(); onOpenRegister(emotionKey, displayLevelObj.level); }}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-sm text-white shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200"
                                style={{ background: `linear-gradient(135deg, ${emotionColor.main}, ${emotionColor.dark})` }}
                            >
                                <Check className="w-5 h-5" />
                                CONFIRMAR REGISTRO
                            </button>
                        </div>
                    </div>

                    {showNeuro && (
                        <NeuroGraph emotionKey={emotionKey} intensityLevel={displayLevelObj.level} theme={theme} />
                    )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-12 rounded-3xl border-2 border-dashed border-slate-300/20 bg-slate-50/5 dark:bg-slate-900/20">
                   <IconComp className={`w-12 h-12 mb-4 opacity-20 ${textClass}`} />
                  <p className={`${textSecondary} text-sm md:text-lg font-medium text-center max-w-md`}>
                    Clique em um nível na escala acima para ver detalhes e o impacto no seu cérebro.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(EmotionCard);