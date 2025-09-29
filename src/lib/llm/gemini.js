import { env } from '$env/dynamic/private';
import { GoogleGenAI } from '@google/genai';

export function hasGemini(overrideKey) {
  return Boolean(overrideKey || env.GEMINI_API_KEY);
}

export async function geminiGenerate({ userText, systemPrompt = '', model = env.GEMINI_MODEL || 'gemini-2.5-flash', apiKey }) {
  const key = apiKey || env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY not set');

  const ai = new GoogleGenAI({ apiKey: key });

  const contents = systemPrompt
    ? `System:\n${systemPrompt}\n\nUser:\n${userText}`
    : userText;

  const response = await ai.models.generateContent({ model, contents });
  const text = typeof response?.text === 'string' ? response.text : '';
  return { text, raw: response };
}
