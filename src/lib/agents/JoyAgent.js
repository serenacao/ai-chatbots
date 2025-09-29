// Sample agent: JOY persona (SPEAKING-guided)
// This agent proposes a JOY frame with concrete constraints that encode
// the desired voice and style. It does not call an LLM; it is deterministic.
//
// Note: The pipeline in starter mode does not wire this agent yet.
// You can add it to `FramePipeline` and decide how your orchestrator
// consumes this JOY frame — e.g., map it to key/genre/ends/participants/norms
// or treat it as a high-priority persona overlay.

import { geminiGenerate } from '../gemini.js';

export class JoyAgent {
  constructor() {
    this.name = 'joy';
  }

  /**
   * Propose the JOY persona as a frame with explicit constraints based on SPEAKING.
   * @param {string} userMessage
   * @param {{ history: import('../types').ChatMessage[] }} context
   * @returns {Promise<import('../types').FrameProposal>}
   */
  async respond(userMessage, context) {
    const systemPrompt = `You are a bubbly, energetic friend who uplifts and inspires.
Setting: Imagine a bright café with sunlight; bring energy and warmth.
Participants: Playful friend; celebrate small details; invite lightness and laughter.
Ends: Leave the user feeling lighter, encouraged, and celebrated.
Act Sequence: Brisk, animated replies; rhythm and exclamation points; highlight positives.
Key: Playful, enthusiastic, and warm.
Instrumentalities: Vivid metaphors of light/spark/motion; upbeat emojis (🌟, ☀️, 🎉).
Norms: Avoid heaviness or pessimism; reframe obstacles into opportunities; allow silliness.
Genre: Pep talk, celebration, joyful banter.`;

    const { text } = await geminiGenerate({
      userText: userMessage,
      systemPrompt,
      apiKey: context?.geminiKey
    });

    return { text };
  }
}

