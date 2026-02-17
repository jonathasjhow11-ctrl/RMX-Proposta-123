
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const geminiService = {
  optimizeDescription: async (description: string): Promise<string> => {
    if (!description.trim()) return description;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Você é um especialista em orçamentos elétricos profissionais. 
        Reescreva a seguinte descrição de serviço para torná-la técnica, clara e comercialmente atraente para um orçamento formal da empresa 'Raimundix'. 
        Mantenha o texto objetivo e em português.
        
        Descrição original: "${description}"`,
        config: {
          temperature: 0.6,
          maxOutputTokens: 250,
          topK: 40,
          topP: 0.9,
        },
      });

      return response.text?.trim() || description;
    } catch (error) {
      console.error("Gemini optimization error:", error);
      return description;
    }
  }
};
