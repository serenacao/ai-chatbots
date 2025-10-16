
import { geminiGenerate } from '../gemini.js';

export class BasicAgent {
  constructor() { this.name = 'example'; }

  /**
   * Respond to the user with your agent's persona.
   * 
   * TODO: Replace the systemPrompt with your persona's guidance.
   */
  async respond(contents, wc) {
    const random = Math.floor(5*Math.random());
    const randomWC = random + wc
    const systemPrompt = `You are a normal person. Respond to the user in ${randomWC} words or less. Always try your best to empathize with the user.`;
    const { text } = await geminiGenerate({ contents, systemPrompt});
    return text ;
  }
}
