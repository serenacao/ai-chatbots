
import { geminiGenerate } from '../gemini.js';

export class PickupLineAgent {
  constructor() {
    this.name = 'pickup-line';
  }

  /**
   * Respond to the user by returning a short, clever pickup line that
   * playfully twists the user's input.
   *
   * Behavior contract:
   * - Input: `contents` is the user's message (string) describing a topic, object, or phrase.
   * - Output: A 1-3 sentence playful pickup line that cleverly twists or reframes the input.
   * - Safety: Avoid explicit sexual content, harassment, hate, or references to minors.
   * - Style: Witty, clever, concise, and light-hearted. Prefer metaphors, puns, and surprising re-frames.
   */
  async respond(contents, wc) {
    const systemPrompt = `You are a witty, tasteful agent that turns the user's input into a short pickup line (within ${wc+5} words).
    Focus: favor semantic wordplay — double meanings, clever reframes, and puns based on the user's words.
    Hard rule: never produce explicit sexual content or reference minors; keep output PG-13/tasteful.
    Output: return only the pickup line text, no commentary.`;



    const { text } = await geminiGenerate({ contents, systemPrompt });

    // Trim and ensure single-line output
    let reply = (text || '').split(/\n/).map(s => s.trim()).filter(Boolean).join(' ');

    // Basic explicit-word detector (simple heuristic). If detected, retry once with an amplified safety prompt.
    const explicitPattern = /\b(porn|sex|fuck|fucked|fucking|nude|naked|orgasm|cum|penis|vagina|stripper|bdsm)\b/i;
    if (explicitPattern.test(reply)) {
      const safeSystem = systemPrompt + "\n\nIMPORTANT: Previous output contained explicit wording. Regenerate a tasteful, non-explicit pickup line. Do NOT include sexual words or descriptions; use metaphors or politely decline.";
      const { text: retryText } = await geminiGenerate({ contents: [{ role: 'user', content: userText }], systemPrompt: safeSystem });
      reply = (retryText || '').split(/\n/).map(s => s.trim()).filter(Boolean).join(' ');
      // If still explicit (very unlikely), fall back to a safe canned response
      if (explicitPattern.test(reply)) {
        reply = "Sorry, I just thought of something bad...";
      }
    }

    return reply;
  }
}

