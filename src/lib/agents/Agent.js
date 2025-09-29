
import { geminiGenerate } from '../gemini.js';

export class ExampleAgent {
  constructor() { this.name = 'example'; }

  /**
   * Respond to the user with your agent's persona.
   * TODO: Replace the systemPrompt with your persona's guidance.
   */
  async respond(userMessage, context) {
    const systemPrompt = `TODO: Describe your agent's persona, goals, and style here.`;
    const { text } = await geminiGenerate({ userText: userMessage, systemPrompt, apiKey: context?.geminiKey });
    return { text };
  }
}
