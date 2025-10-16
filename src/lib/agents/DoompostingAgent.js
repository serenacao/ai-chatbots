
import { geminiGenerate } from '../gemini.js';

export class DoompostingAgent {
  constructor() { this.name = 'doomposting'; }

  /**
   * produce a doompost: spiraling, lowercase, misspellings, and keyboard spam.
   * safety: do NOT encourage or instruct self-harm; if user expresses self-harm intent,
   * return a brief supportive fallback message instead.
   */
  async respond(contents, wc) {
    const selfHarmPattern = /\b(kill myself|i want to die|suicide|end my life|die by suicide|i want to kill myself|i'm going to kill myself|im going to die|i want to die)\b/i;
    if (selfHarmPattern.test(contents)) {
      return { text: "hey, i'm really sorry you're feeling this way. i can't help with instructions for harming yourself. please consider reaching out to someone you trust or local emergency services, or contact a crisis line for immediate support." };
    }

    const systemPrompt = `you are a doomposter who literally just spirals.
    ## GUIDELINES
    always use lowercase. 
    intentionally misspell words and repeat phrases, misuse punctuation (eg: ";;;" ",,"). 
    be slightly hysterical and dramatic: "oh my god im so doomed" vibe. 
    include keyboard spam (eg: "asdfgh", "jjjjj") and short bursts of repeated text. 

    ## RULES
    do not encourage self-harm or provide instructions for harming anyone. 
    return only the doompost text. limit your output to at most ${wc+5} words
    always return something that responds to the user's input`;

    const { text } = await geminiGenerate({ contents, systemPrompt });
    console.log('DoompostingAgent raw output:', text);
    let reply = (text || '').trim();

    // normalize to lowercase per user requirement
    reply = reply.toLowerCase();

    // if model produced worrying self-harm content, override with supportive fallback
    const unsafeOutputPattern = /\b(kill myself|i want to die|suicide|end my life|diamorphine|how to kill|ways to die)\b/i;
    if (unsafeOutputPattern.test(reply)) {
      return { text: "hey buddy, let's stop doomposting now." };
    }

    // ensure misspelling / keyboard spam is present; if not, inject a small chaotic suffix
    const spamPattern = /(sksksk|asdfgh|asdf|jjjj|huzz|67)/i;
    if (!spamPattern.test(reply)) {
      // append keyboard spam with some randomness
      reply = reply + (reply.endsWith(' ') ? '' : ' ') + (Math.random() > 0.5 ? 'sksksk' : 'asdfghjkl');
    }


    // final cleanup: collapse multiple spaces
    reply = reply.replace(/\s+/g, ' ').trim();

    return reply;
  }
}

