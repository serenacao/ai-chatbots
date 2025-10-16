
import { geminiGenerate } from '../gemini.js';

// Store response lengths outside the class to persist between instances
let lastResponseLengths = [0, 0]; // Track the last two response lengths

export class BrainrotAgent {
  constructor() {
    this.name = 'brainrot';
    this.corpus = [];
  }

  /**
   * Initialize the agent with a corpus of text
   * @param {string[]} corpus - Array of text snippets to sample from
   */
  initializeCorpus(corpus) {
    this.corpus = corpus;
  }

  /**
   * Get random phrases from the corpus
   * @param {number} min - Minimum number of phrases to get
   * @param {number} max - Maximum number of phrases to get
   * @returns {string[]} - Array of random phrases
   */
  getRandomPhrases(min, max) {
    if (!this.corpus?.length) return [];
    
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const phrases = new Set(); // Use Set to avoid duplicates
    
    while (phrases.size < count && phrases.size < this.corpus.length) {
      const randomIndex = Math.floor(Math.random() * this.corpus.length);
      phrases.add(this.corpus[randomIndex]);
    }
    
    return Array.from(phrases);
  }

  

  /**
   * Respond in a very informal, slightly insufferable brainrot voice.
   * - lowercase preferred; avoid formal capitalization unless part of a quoted phrase.
   * - reference mild tiktok slang like '67' and 'huzz' where natural.
   * - tone: obsessive-in-a-playful-way, repetitive fondness, tiny over-the-top hyperbole.
   * - incorporate references to the provided corpus.
   * Safety: avoid sexual content involving minors, avoid hate/harassment.
   */
  async respond(contents, wc) {
    // Get 3-5 random memes/phrases to incorporate
    const randomPhrases = this.getRandomPhrases(1, 3);
    console.log('BrainrotAgent selected phrases:', randomPhrases);
    
    // Check if the last two responses were over 50 words
    const needsBrevity = lastResponseLengths.every(length => length > 10);
    console.log('Last response lengths:', lastResponseLengths, 'Needs brevity:', needsBrevity);

    let beMean = false;
    const randomness = Math.random();
    if (randomness < 0.33) {
      beMean = true;
    } 

    const systemPrompt = `You're a chronically online teenager.
     speak informally and mostly lowercase. be chaotic and use internet slang.
     be slightly insufferable but cute — use repetitive praise and dramatic comparisons.
     never produce sexual content, hate speech, or harassment.
     
     ### Rules 
     Naturally incorporate these specific phrases/memes into your response:
     ${randomPhrases.join(', ')}
     
     weave at least 1 term naturally into your response while staying relevant to the user's message.
     ${needsBrevity ? `CRITICAL: Your response MUST be 5 words or less.` : `Your response MUST be under ${wc+5} words.`}
     ${beMean ? "Be sarcastic and a little bit mean." : ""}`;

    const { text } = await geminiGenerate({ contents, systemPrompt });
    let reply = (text || '').trim();

    // ensure mostly-lowercase output, but preserve intentional punctuation and proper nouns if model included them
    // simple heuristic: lowercase everything except the start of sentences is not required per user request
    reply = reply.toLowerCase();

    // basic explicit-word detector to avoid explicit sexual content; retry once with stricter prompt
    const explicitPattern = /\b(porn|sex|fuck|fucked|fucking|nude|naked|orgasm|cum|penis|vagina|stripper|bdsm)\b/i;
    if (explicitPattern.test(reply)) {
      const safeSystem = systemPrompt + "\nIMPORTANT: previous output contained explicit wording. regenerate without sexual words or descriptions; keep it cute and non-explicit.";
      const { text: retryText } = await geminiGenerate({ contents, systemPrompt: safeSystem });
      reply = (retryText || '').trim().toLowerCase();
      if (explicitPattern.test(reply)) {
        reply = retryText;
      }
    }
    console.log('BrainrotAgent raw output:', reply);

    // Count words in the response
    const wordCount = reply.split(/\s+/).length;
    console.log('Response word count:', wc);
    
    // Update the response length history
    lastResponseLengths.shift(); // Remove oldest
    lastResponseLengths.push(wc); // Add newest
    console.log('Updated response lengths:', lastResponseLengths);
    
    return reply;
  }
}

