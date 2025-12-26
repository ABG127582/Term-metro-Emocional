import { Heart, Frown, Flame, AlertCircle, Zap, ThumbsDown } from 'lucide-react';
import { EmotionScale, NeuroInfo } from './types';

export const emotionColors: Record<string, { light: string; main: string; dark: string; glow: string; chart: string }> = {
  alegria: { light: '#FBBF24', main: '#F59E0B', dark: '#D97706', glow: 'rgba(245, 158, 11, 0.3)', chart: '#FBBF24' },
  tristeza: { light: '#93C5FD', main: '#60A5FA', dark: '#3B82F6', glow: 'rgba(96, 165, 250, 0.3)', chart: '#60A5FA' },
  raiva: { light: '#FCA5A5', main: '#F87171', dark: '#DC2626', glow: 'rgba(248, 113, 113, 0.3)', chart: '#F87171' },
  medo: { light: '#D8B4FE', main: '#A78BFA', dark: '#7C3AED', glow: 'rgba(167, 139, 250, 0.3)', chart: '#A78BFA' },
  surpresa: { light: '#A5F3FC', main: '#06B6D4', dark: '#0891B2', glow: 'rgba(6, 182, 212, 0.3)', chart: '#06B6D4' },
  nojo: { light: '#86EFAC', main: '#34D399', dark: '#10B981', glow: 'rgba(52, 211, 153, 0.3)', chart: '#34D399' }
};

export const somaticSensations = [
  "Taquicardia (Coração acelerado)",
  "Tensão muscular",
  "Nó na garganta",
  "Respiração curta",
  "Calor no rosto",
  "Frio na barriga",
  "Tremores",
  "Sudorese",
  "Peso no peito",
  "Cansaço súbito",
  "Agitação motora",
  "Mandíbula travada",
  "Vazio no estômago",
  "Lágrimas",
  "Formigamento"
];

export const NEURO_DATA: Record<string, NeuroInfo> = {
  alegria: {
    description: "Ativação do sistema de recompensa e opioides endógenos.",
    recoveryEstimate: "30min - 2h (Pico sustentado, decaimento suave)",
    hormones: [
      {
        name: "Dopamina",
        color: "#FBBF24",
        description: "Motivação e prazer",
        decayProfile: { peakTime: 15, decayRate: 0.8 }
      },
      {
        name: "Endorfina",
        color: "#EC4899",
        description: "Bem-estar e alívio",
        decayProfile: { peakTime: 10, decayRate: 1.2 }
      },
      {
        name: "Serotonina",
        color: "#34D399",
        description: "Satisfação e regulação",
        decayProfile: { peakTime: 30, decayRate: 0.5 }
      }
    ]
  },
  tristeza: {
    description: "Baixa atividade de neurotransmissores excitatórios e aumento leve de cortisol.",
    recoveryEstimate: "4h - 24h+ (Metabolização lenta)",
    hormones: [
      {
        name: "Cortisol",
        color: "#60A5FA",
        description: "Estresse prolongado",
        decayProfile: { peakTime: 60, decayRate: 0.3 }
      },
      {
        name: "Prolactina",
        color: "#818CF8",
        description: "Resposta ao choro/conforto",
        decayProfile: { peakTime: 30, decayRate: 0.6 }
      }
    ]
  },
  raiva: {
    description: "Resposta 'Lutar', alta energia e mobilização muscular.",
    recoveryEstimate: "40min - 2h (Para metabolizar adrenalina)",
    hormones: [
      {
        name: "Adrenalina",
        color: "#EF4444",
        description: "Energia explosiva imediata",
        decayProfile: { peakTime: 5, decayRate: 1.5 }
      },
      {
        name: "Noradrenalina",
        color: "#F97316",
        description: "Foco e prontidão",
        decayProfile: { peakTime: 10, decayRate: 0.9 }
      },
      {
        name: "Testosterona",
        color: "#78350F",
        description: "Dominância (leve aumento)",
        decayProfile: { peakTime: 20, decayRate: 0.4 }
      }
    ]
  },
  medo: {
    description: "Resposta 'Fugir ou Congelar' do eixo HPA.",
    recoveryEstimate: "1h - 3h (Cortisol residual pode durar mais)",
    hormones: [
      {
        name: "Adrenalina",
        color: "#D946EF",
        description: "Alerta de perigo",
        decayProfile: { peakTime: 2, decayRate: 2.0 }
      },
      {
        name: "Cortisol",
        color: "#8B5CF6",
        description: "Estresse e vigilância",
        decayProfile: { peakTime: 20, decayRate: 0.4 }
      }
    ]
  },
  surpresa: {
    description: "Sobressalto neural para focar atenção em novo estímulo.",
    recoveryEstimate: "15min - 45min (Rápida habituação)",
    hormones: [
      {
        name: "Adrenalina",
        color: "#06B6D4",
        description: "Pico de atenção",
        decayProfile: { peakTime: 1, decayRate: 2.5 }
      }
    ]
  },
  nojo: {
    description: "Ativação da ínsula e resposta visceral de rejeição.",
    recoveryEstimate: "20min - 1h (Depende da remoção do estímulo)",
    hormones: [
      {
        name: "Resposta Vagal",
        color: "#10B981",
        description: "Náusea/Rejeição (Simulação)",
        decayProfile: { peakTime: 5, decayRate: 1.0 }
      }
    ]
  }
};

export const emotionalScales: Record<string, EmotionScale> = {
  alegria: {
    name: "Alegria",
    icon: Heart,
    color: "from-yellow-400 via-lime-500 to-emerald-500",
    valenceBase: 7.5,
    colorKey: 'alegria',
    levels: [
      { level: 1, label: "Alívio", valence: 6.5, arousal: 3.0, desc: "Sensação de 'ufa!'", examples: "Terminar prova", regulation: "Respiração profunda" },
      { level: 2, label: "Serenidade", valence: 7.0, arousal: 2.5, desc: "Paz interior", examples: "Meditar", regulation: "Mindfulness" },
      { level: 3, label: "Gratidão", valence: 7.5, arousal: 4.0, desc: "Apreciar coisas boas", examples: "Ajuda", regulation: "Diário" },
      { level: 4, label: "Contentamento", valence: 8.0, arousal: 4.5, desc: "Satisfação", examples: "Projeto", regulation: "Compartilhar" },
      { level: 5, label: "Prazer", valence: 8.5, arousal: 6.5, desc: "Bem-estar", examples: "Comida", regulation: "Exercício" },
      { level: 6, label: "Êxtase", valence: 9.0, arousal: 8.0, desc: "Imersão profunda", examples: "Flow", regulation: "Flow" },
      { level: 7, label: "Euforia", valence: 9.5, arousal: 9.5, desc: "Pico máximo", examples: "Grande conquista", regulation: "Cautela" }
    ]
  },
  tristeza: {
    name: "Tristeza",
    icon: Frown,
    color: "from-sky-400 via-blue-500 to-indigo-600",
    valenceBase: 3.0,
    colorKey: 'tristeza',
    levels: [
      { level: 1, label: "Desapontamento", valence: 4.0, arousal: 3.5, desc: "Expectativas não atendidas", examples: "Plano cancelado", regulation: "Reestruturação" },
      { level: 2, label: "Decepção", valence: 3.5, arousal: 4.0, desc: "Quebra de confiança", examples: "Promessa quebrada", regulation: "Conversar" },
      { level: 3, label: "Melancolia", valence: 3.0, arousal: 3.0, desc: "Tristeza pensativa", examples: "Nostalgia", regulation: "Arte" },
      { level: 4, label: "Mágoa", valence: 2.5, arousal: 5.0, desc: "Dor emocional", examples: "Rejeição", regulation: "Comunicação" },
      { level: 5, label: "Sofrimento", valence: 2.0, arousal: 6.0, desc: "Dor profunda", examples: "Perda", regulation: "Ajuda profissional" },
      { level: 6, label: "Angústia", valence: 1.5, arousal: 7.0, desc: "Tempestade interna", examples: "Crise", regulation: "Profissional" },
      { level: 7, label: "Desespero", valence: 1.0, arousal: 5.5, desc: "Sem esperança", examples: "Depressão", regulation: "Ajuda imediata" }
    ]
  },
  raiva: {
    name: "Raiva",
    icon: Flame,
    color: "from-amber-500 via-red-600 to-rose-700",
    valenceBase: 3.0,
    colorKey: 'raiva',
    levels: [
      { level: 1, label: "Aversão", valence: 4.5, arousal: 4.0, desc: "Repulsa leve", examples: "Inconveniente", regulation: "Afastamento" },
      { level: 2, label: "Irritação", valence: 4.0, arousal: 5.5, desc: "Agitação", examples: "Trânsito", regulation: "Pausas" },
      { level: 3, label: "Ressentimento", valence: 3.5, arousal: 5.0, desc: "Raiva reaquecida", examples: "Injustiça", regulation: "Terapia" },
      { level: 4, label: "Raiva", valence: 3.0, arousal: 7.0, desc: "Resposta forte", examples: "Desrespeito", regulation: "Time-out" },
      { level: 5, label: "Rancor", valence: 2.5, arousal: 6.5, desc: "Raiva amarga", examples: "Traição", regulation: "Perdão" },
      { level: 6, label: "Ódio", valence: 2.0, arousal: 7.5, desc: "Aversão profunda", examples: "Animosidade", regulation: "Profissional" },
      { level: 7, label: "Fúria", valence: 1.5, arousal: 9.5, desc: "Explosão", examples: "Agressividade", regulation: "Afastamento imediato" }
    ]
  },
  medo: {
    name: "Medo",
    icon: AlertCircle,
    color: "from-fuchsia-500 via-purple-600 to-violet-800",
    valenceBase: 3.0,
    colorKey: 'medo',
    levels: [
      { level: 1, label: "Nervosismo", valence: 4.5, arousal: 5.0, desc: "Agitação pré-evento", examples: "Apresentação", regulation: "Preparação" },
      { level: 2, label: "Insegurança", valence: 4.0, arousal: 5.5, desc: "Dúvida", examples: "Capacidades", regulation: "Autoeficácia" },
      { level: 3, label: "Preocupação", valence: 3.5, arousal: 6.0, desc: "Pensamento repetido", examples: "Futuro", regulation: "Cognitiva" },
      { level: 4, label: "Ansiedade", valence: 3.0, arousal: 7.0, desc: "Medo futuro", examples: "Generalizada", regulation: "TCC" },
      { level: 5, label: "Medo", valence: 2.5, arousal: 8.0, desc: "Perigo real", examples: "Ameaça", regulation: "Segurança" },
      { level: 6, label: "Terror", valence: 2.0, arousal: 9.0, desc: "Medo paralisante", examples: "Extremo", regulation: "Garantir segurança" },
      { level: 7, label: "Pânico", valence: 1.0, arousal: 10.0, desc: "Onda avassaladora", examples: "Ataque", regulation: "Grounding" }
    ]
  },
  surpresa: {
    name: "Surpresa",
    icon: Zap,
    color: "from-cyan-400 via-sky-500 to-blue-500",
    valenceBase: 5.0,
    colorKey: 'surpresa',
    levels: [
      { level: 1, label: "Surpresa", valence: 5.0, arousal: 5.5, desc: "Reação instantânea", examples: "Inesperado", regulation: "Avaliar" },
      { level: 2, label: "Curiosidade", valence: 6.5, arousal: 6.0, desc: "Desejo de saber", examples: "Descoberta", regulation: "Explorar" },
      { level: 3, label: "Fascínio", valence: 7.0, arousal: 6.5, desc: "Atenção capturada", examples: "Impressionante", regulation: "Imersão" },
      { level: 4, label: "Admiração", valence: 7.5, arousal: 6.0, desc: "Algo grandioso", examples: "Arte", regulation: "Contemplação" },
      { level: 5, label: "Assombro", valence: 8.0, arousal: 7.0, desc: "Surpresa positiva", examples: "Transcendente", regulation: "Integração" },
      { level: 6, label: "Pasmo", valence: 5.0, arousal: 8.0, desc: "Evento chocante", examples: "Choque", regulation: "Processar" },
      { level: 7, label: "Espanto", valence: 5.0, arousal: 9.0, desc: "Reação máxima", examples: "Extraordinário", regulation: "Verificar" }
    ]
  },
  nojo: {
    name: "Nojo",
    icon: ThumbsDown,
    color: "from-lime-500 via-green-600 to-teal-700",
    valenceBase: 3.0,
    colorKey: 'nojo',
    levels: [
      { level: 1, label: "Desprezo", valence: 4.0, arousal: 4.5, desc: "Nojo social", examples: "Antiético", regulation: "Limites" },
      { level: 2, label: "Desgosto", valence: 3.5, arousal: 5.0, desc: "Ofende sentidos", examples: "Comida", regulation: "Afastamento" },
      { level: 3, label: "Repulsa", valence: 3.0, arousal: 6.5, desc: "Vontade forte", examples: "Contaminação", regulation: "Afastar" },
      { level: 4, label: "Indignação", valence: 2.5, arousal: 7.0, desc: "Nojo + raiva", examples: "Injustiça", regulation: "Ação" },
      { level: 5, label: "Aversão", valence: 2.0, arousal: 8.0, desc: "Nojo máximo", examples: "Náusea", regulation: "Remover" }
    ]
  }
};
