import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import FocusTrap from './FocusTrap';

interface BreathingModalProps {
  onClose: () => void;
}

const BreathingModal: React.FC<BreathingModalProps> = ({ onClose }) => {
  const [phase, setPhase] = useState<'inspire' | 'hold' | 'expire'>('inspire');
  const [seconds, setSeconds] = useState(1);

  useEffect(() => {
    // Timer runs every second to update the counter
    const timer = setInterval(() => {
      setSeconds((prevSec) => {
        if (prevSec < 4) {
          return prevSec + 1;
        } else {
          // Reached 4 seconds, switch phase and reset to 1
          setPhase((prevPhase) => {
            if (prevPhase === 'inspire') return 'hold';
            if (prevPhase === 'hold') return 'expire';
            return 'inspire';
          });
          return 1;
        }
      });
    }, 1000);

    // Add Escape key listener
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
        clearInterval(timer);
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const getInstruction = () => {
    switch (phase) {
      case 'inspire': return 'Inspirar';
      case 'hold': return 'Segurar';
      case 'expire': return 'Expirar';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-xl animate-fade-in p-4">
        <FocusTrap className="flex flex-col items-center w-full max-w-lg" aria-label="Exercício de Respiração Guiada">
            <button 
                onClick={onClose} 
                className="absolute top-6 right-6 text-white/60 hover:text-white p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full"
                aria-label="Fechar exercício"
            >
                <X className="w-8 h-8" />
            </button>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">Respire Comigo</h3>
            
            <div className="relative flex items-center justify-center w-64 h-64 mb-12">
                {/* Outer glow ring */}
                <div className="absolute w-full h-full rounded-full bg-indigo-500/20 animate-breathe" />
                {/* Middle expanding ring */}
                <div className="absolute w-48 h-48 rounded-full bg-indigo-400/30 animate-breathe animation-delay-100" />
                {/* Core circle */}
                <div className="absolute w-32 h-32 rounded-full bg-white text-indigo-900 flex items-center justify-center font-bold shadow-[0_0_50px_rgba(255,255,255,0.6)] z-10 transition-transform duration-[3000ms] ease-in-out animate-breathe">
                    <div className="flex flex-col items-center animate-fade-in">
                        <span className="text-4xl font-black mb-1 tabular-nums">
                            {seconds}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-widest opacity-60">Segundos</span>
                    </div>
                </div>
            </div>

            <div className="text-center text-white/80 max-w-md space-y-4">
                <p className="text-4xl font-bold tracking-wide text-indigo-300 transition-all duration-300 min-h-[3rem] flex items-center justify-center gap-3">
                    <span aria-hidden="true">
                        {phase === 'inspire' && '⬆️'}
                        {phase === 'hold' && '✋'}
                        {phase === 'expire' && '⬇️'}
                    </span>
                    {getInstruction()}
                </p>
                <p className="text-sm opacity-60 leading-relaxed">
                    Essa técnica (4-4-4) reduz os batimentos cardíacos e sinaliza ao seu cérebro que você está seguro.
                </p>
            </div>

            <button 
                onClick={onClose} 
                className="mt-12 px-10 py-4 bg-white text-indigo-900 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl shadow-white/10 focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
            >
                Estou me sentindo melhor
            </button>
        </FocusTrap>
    </div>
  );
};

export default BreathingModal;