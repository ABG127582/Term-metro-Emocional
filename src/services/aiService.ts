import { GoogleGenAI, Type } from "@google/genai";
import { ClinicalReport } from '../types';

export const aiService = {
  getClient: () => {
    // API Key is now handled via environment variable for security
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  },

  /**
   * Analisa uma nota de texto e extrai contexto estruturado (Smart Fill)
   */
  analyzeContext: async (note: string, emotionName: string): Promise<any> => {
    const ai = aiService.getClient();
    
    const prompt = `
      Analise o seguinte relato emocional: "${note}".
      Emoção identificada: ${emotionName}.
      
      Extraia os detalhes do contexto.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            location: { type: Type.STRING, description: "Onde aconteceu (ex: Casa, Trabalho)" },
            company: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Quem estava junto" },
            trigger: { type: Type.STRING, description: "O motivo principal" },
            strategy: { type: Type.STRING, description: "Uma estratégia de coping sugerida" },
            advice: { type: Type.STRING, description: "Um conselho curto e empático (máx 15 palavras)" }
          }
        }
      }
    });

    return aiService.parseResponse(response);
  },

  /**
   * Gera um relatório clínico baseado no histórico de avaliações (History View)
   */
  generateClinicalReport: async (assessments: any[], days: number): Promise<ClinicalReport> => {
    const ai = aiService.getClient();

    // Prepare minimal data to save tokens
    const clinicalData = assessments.slice(0, 30).map(a => ({
        date: new Date(a.timestamp).toLocaleDateString(),
        time: new Date(a.timestamp).toLocaleTimeString(),
        emotion: a.emotion,
        intensity_level: a.level,
        context: { 
            trigger: a.trigger, 
            sleep_hours: a.sleepHours, 
            social_context: a.company,
            strategies_used: a.copingStrategies
        },
        patient_notes: a.notes
    }));
    
    const prompt = `
      ATUE COMO UM PSICÓLOGO CLÍNICO SENIOR ESPECIALISTA EM TCC (Terapia Cognitivo-Comportamental).
      Período de análise: Últimos ${days} dias.
      Dados do Paciente (JSON): ${JSON.stringify(clinicalData)}
      
      Gere um relatório clínico estruturado.
    `;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
              type: Type.OBJECT,
              properties: {
                  summary: { type: Type.STRING, description: "Resumo clínico do estado mental" },
                  emotional_stability_score: { type: Type.NUMBER, description: "Nota de 0 a 100" },
                  dominant_patterns: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de padrões comportamentais identificados" },
                  risk_factors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Fatores de risco ou atenção" },
                  coping_effectiveness: { type: Type.STRING, description: "Avaliação da eficácia das estratégias usadas" },
                  weekly_goals: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 metas práticas para a semana" }
              }
          }
        }
    });

    return aiService.parseResponse(response);
  },

  /**
   * Helper para limpar e parsear respostas da IA
   */
  parseResponse: (response: any) => {
    try {
        const text = response.text || "{}";
        // Remove markdown code blocks if present (though responseMimeType should handle it)
        const cleanText = text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanText);
    } catch (error) {
        console.error("Erro ao parsear resposta da IA:", error);
        throw new Error("Falha ao processar resposta da Inteligência Artificial.");
    }
  }
};