import { Heart, Frown, Flame, AlertCircle, Zap, ThumbsDown } from 'lucide-react';
import { EmotionColor, EmotionKey, EmotionScale, NeuroChemistry } from './types';

export const STORAGE_KEY = 'emotional_assessments';
export const THEME_KEY = 'theme_preference';

export const EMOTION_COLORS: Record<EmotionKey, EmotionColor> = {
  alegria: { light: '#FBBF24', main: '#F59E0B', dark: '#D97706', glow: 'rgba(245, 158, 11, 0.3)', chart: '#FBBF24' },
  tristeza: { light: '#93C5FD', main: '#60A5FA', dark: '#3B82F6', glow: 'rgba(96, 165, 250, 0.3)', chart: '#60A5FA' },
  raiva: { light: '#FCA5A5', main: '#F87171', dark: '#DC2626', glow: 'rgba(248, 113, 113, 0.3)', chart: '#F87171' },
  medo: { light: '#D8B4FE', main: '#A78BFA', dark: '#7C3AED', glow: 'rgba(167, 139, 250, 0.3)', chart: '#A78BFA' },
  surpresa: { light: '#A5F3FC', main: '#06B6D4', dark: '#0891B2', glow: 'rgba(6, 182, 212, 0.3)', chart: '#06B6D4' },
  nojo: { light: '#86EFAC', main: '#34D399', dark: '#10B981', glow: 'rgba(52, 211, 153, 0.3)', chart: '#34D399' }
};

// Prompts terapêuticos para reflexão guiada
export const REFLECTION_PROMPTS: Record<EmotionKey, string[]> = {
  alegria: [
    "O que exatamente desencadeou essa alegria?",
    "Como posso cultivar mais momentos como este?",
    "Quem mais se beneficiaria se eu compartilhasse essa energia?",
    "Que força pessoal eu usei hoje?"
  ],
  tristeza: [
    "O que eu sinto que perdi ou está faltando?",
    "O que meu corpo está pedindo agora (descanso, choro, conforto)?",
    "Existe algo que eu precise aceitar para seguir em frente?",
    "Como posso ser gentil comigo mesmo neste momento?"
  ],
  raiva: [
    "Qual limite pessoal meu foi desrespeitado?",
    "O que eu gostaria de mudar nessa situação?",
    "Essa raiva está protegendo alguma outra emoção (medo, tristeza)?",
    "Como posso expressar essa insatisfação de forma construtiva?"
  ],
  medo: [
    "Qual é a pior coisa que pode acontecer e qual a probabilidade real?",
    "O que está sob meu controle agora e o que não está?",
    "Que recursos ou apoio eu tenho para lidar com isso?",
    "O que eu diria a um amigo que estivesse sentindo isso?"
  ],
  surpresa: [
    "O que essa surpresa me revelou sobre minhas expectativas?",
    "Isso muda meus planos? Se sim, como posso me adaptar?",
    "O que eu aprendi de novo com essa situação?"
  ],
  nojo: [
    "O que exatamente está me repelindo?",
    "Isso viola meus valores ou minha segurança física?",
    "Como posso me afastar ou colocar um limite saudável?"
  ]
};

// Dados Neuroquímicos
export const NEURO_DATA: Record<EmotionKey, NeuroChemistry> = {
  alegria: {
    description: "Ativação do sistema de recompensa e vínculo social.",
    recoveryEstimate: "Rápida (10-30 min), mas ocitocina pode durar mais.",
    hormones: [
      { name: "Dopamina", color: "#F59E0B", description: "Prazer e motivação", decayProfile: { peakTime: 5, decayRate: 0.1 } },
      { name: "Serotonina", color: "#10B981", description: "Bem-estar geral", decayProfile: { peakTime: 10, decayRate: 0.05 } },
      { name: "Endorfinas", color: "#EC4899", description: "Alívio e euforia", decayProfile: { peakTime: 2, decayRate: 0.2 } },
      { name: "Ocitocina", color: "#8B5CF6", description: "Vínculo e confiança", decayProfile: { peakTime: 15, decayRate: 0.03 } }
    ]
  },
  tristeza: {
    description: "Queda na serotonina/dopamina. Em casos intensos, aumento do cortisol devido ao estresse da perda.",
    recoveryEstimate: "Lenta (Horas a dias). O cérebro entra em modo de 'conservação de energia'.",
    hormones: [
      { name: "Serotonina (Queda)", color: "#3B82F6", description: "Baixos níveis causam apatia", decayProfile: { peakTime: 0, decayRate: 0.01 } }, // Representado invertido ou como impacto negativo
      { name: "Cortisol", color: "#92400E", description: "Hormônio do estresse (se houver angústia)", decayProfile: { peakTime: 20, decayRate: 0.02 } }
    ]
  },
  raiva: {
    description: "Resposta de 'luta'. Inundação rápida de energia para ação imediata.",
    recoveryEstimate: "Moderada a Lenta (30m - 2h). A adrenalina passa rápido, mas o cortisol pode persistir.",
    hormones: [
      { name: "Adrenalina", color: "#DC2626", description: "Energia explosiva imediata", decayProfile: { peakTime: 1, decayRate: 0.3 } },
      { name: "Noradrenalina", color: "#EA580C", description: "Foco e prontidão", decayProfile: { peakTime: 3, decayRate: 0.15 } },
      { name: "Testosterona", color: "#7C2D12", description: "Dominância e agressividade", decayProfile: { peakTime: 10, decayRate: 0.05 } },
      { name: "Cortisol", color: "#92400E", description: "Estresse prolongado", decayProfile: { peakTime: 15, decayRate: 0.04 } }
    ]
  },
  medo: {
    description: "Resposta de 'fuga' ou congelamento. Foco total na sobrevivência.",
    recoveryEstimate: "Variável. O 'susto' passa em minutos, a ansiedade residual pode durar horas.",
    hormones: [
      { name: "Adrenalina", color: "#7C3AED", description: "Preparação para fuga rápida", decayProfile: { peakTime: 0.5, decayRate: 0.4 } },
      { name: "Cortisol", color: "#92400E", description: "Vigilância prolongada", decayProfile: { peakTime: 10, decayRate: 0.03 } }
    ]
  },
  surpresa: {
    description: "Mecanismo de alerta instantâneo para avaliar novidades.",
    recoveryEstimate: "Muito Rápida (< 5 min). O cérebro decide rapidamente se é bom (alegria) ou ruim (medo).",
    hormones: [
      { name: "Adrenalina", color: "#06B6D4", description: "Pico de atenção súbito", decayProfile: { peakTime: 0.2, decayRate: 0.8 } }
    ]
  },
  nojo: {
    description: "Ativação da ínsula para rejeitar tóxicos (físicos ou sociais).",
    recoveryEstimate: "Rápida assim que o estímulo é removido.",
    hormones: [
      { name: "Resposta Vagal", color: "#10B981", description: "Náusea/desaceleração cardíaca", decayProfile: { peakTime: 2, decayRate: 0.2 } }
    ]
  }
};

// Estratégias categorizadas para sugestão inteligente baseada em Arousal
export const REGULATION_STRATEGIES = {
  // Alta Ativação (> 7.5) - Foco Fisiológico (Baseado em DBT TIPP)
  HIGH_AROUSAL: [
    'Respiração Controlada (4-7-8)',
    'Água Gelada no Rosto',
    'Exercício Intenso Rápido',
    'Relaxamento Muscular Progressivo',
    'Sair do Ambiente (Time-out)'
  ],
  // Média Ativação (4.5 - 7.5) - Foco Cognitivo/Processamento (TCC)
  MODERATE_AROUSAL: [
    'Escrita Terapêutica',
    'Desafiar Pensamentos',
    'Conversa com Apoio',
    'Meditação/Mindfulness',
    'Ouvir Música',
    'Arte/Criatividade'
  ],
  // Baixa Ativação (< 4.5) - Foco Comportamental/Suave
  LOW_AROUSAL: [
    'Caminhada Leve',
    'Alongamento',
    'Pausa para Café/Chá',
    'Distração Leve (Vídeo/Leitura)',
    'Organizar o Ambiente',
    'Autocuidado Físico'
  ]
};

export const ALL_COPING_OPTIONS = [
  ...REGULATION_STRATEGIES.HIGH_AROUSAL,
  ...REGULATION_STRATEGIES.MODERATE_AROUSAL,
  ...REGULATION_STRATEGIES.LOW_AROUSAL
].filter((v, i, a) => a.indexOf(v) === i); // Unique list

export const EMOTIONAL_SCALES: Record<EmotionKey, EmotionScale> = {
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