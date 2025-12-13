import React, { useState } from 'react';
import { X, ArrowRight, ShieldCheck, Heart, BarChart2 } from 'lucide-react';
import { Theme } from '../types';
import FocusTrap from './FocusTrap';

interface OnboardingModalProps {
  onClose: () => void;
  theme: Theme;
}

const STEPS = [
  {
    title: "Bem-vindo ao Termômetro Emocional",
    desc: "Sua ferramenta segura para regulação, autoconhecimento e monitoramento da saúde mental.",
    icon: Heart,
    color: "text-rose-500",
    bg: "bg-rose-500/10"
  },
  {
    title: "Como Funciona",
    desc: "1. Escolha uma emoção.\n2. Defina a intensidade (Nível 1-7).\n3. Receba estratégias personalizadas de regulação.",
    icon: BarChart2,
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    title: "Privacidade Total",
    desc: "Seus dados ficam salvos APENAS no seu dispositivo (LocalStorage). Ninguém mais tem acesso, nem nós.",
    icon: ShieldCheck,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
  }
];

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose, theme }) => {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const CurrentStep = STEPS[step];
  const Icon = CurrentStep.icon;

  const textClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const textSecondary = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';
  const cardBg = theme === 'dark' ? 'bg-slate-900 ring-1 ring-white/10' : 'bg-white';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <FocusTrap 
        className={`${cardBg} max-w-md w-full rounded-3xl p-8 shadow-2xl relative overflow-hidden transition-all duration-300`}
        aria-label="Bem-vindo ao Termômetro Emocional"
      >
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-200 dark:bg-slate-800">
          <div 
            className="h-full bg-indigo-500 transition-all duration-300" 
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <button 
            onClick={onClose} 
            className={`absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 ${textSecondary} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            aria-label="Pular tutorial"
        >
            <X className="w-5 h-5" />
        </button>

        <div className="mt-6 flex flex-col items-center text-center space-y-6 animate-fade-in-up" key={step}>
            <div className={`p-6 rounded-3xl ${CurrentStep.bg} mb-4`}>
                <Icon className={`w-12 h-12 ${CurrentStep.color}`} />
            </div>
            
            <h2 className={`text-2xl font-black ${textClass} tracking-tight`}>
                {CurrentStep.title}
            </h2>
            
            <p className={`text-base font-medium leading-relaxed ${textSecondary} whitespace-pre-line`}>
                {CurrentStep.desc}
            </p>
        </div>

        <div className="mt-10 flex items-center justify-between">
            <div className="flex gap-2">
                {STEPS.map((_, i) => (
                    <div 
                        key={i} 
                        className={`w-2 h-2 rounded-full transition-colors duration-300 ${i === step ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                    />
                ))}
            </div>

            <button 
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all transform active:scale-95 shadow-lg shadow-indigo-500/20 focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
            >
                {step === STEPS.length - 1 ? 'Começar' : 'Próximo'}
                <ArrowRight className="w-4 h-4" />
            </button>
        </div>
      </FocusTrap>
    </div>
  );
};

export default OnboardingModal;