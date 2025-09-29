// Orchestrator: single-prompt agent selection → agent respond

import { geminiGenerate } from '../gemini.js';
import { JoyAgent } from '../agents/JoyAgent.js';
import { SadAgent } from '../agents/SadAgent.js';

export class Orchestrator {
  constructor() {
    this.name = 'joy_sad';
    this.joyAgent = new JoyAgent();
    this.sadAgent = new SadAgent();
  }

  async respondWithAgent(agentName, userMessage, context) {
    const res = agentName === 'sad'
      ? await this.sadAgent.respond(userMessage, context)
      : await this.joyAgent.respond(userMessage, context);
    return res?.text || '';
  }

  async orchestrate(userMessage, context = {}) {
    const orchestratorPrompt = `Your job is to choose which emotional agents should respond to the user right now.
        Think in two steps:
        1) What emotions would best connect with the user right now, and what do they need (e.g., reassurance, validation, encouragement, caution)? Prioritize the latest user message while considering prior user messages with light recency weighting.
        2) Pick the agent whose voice best matches that need.

        Available agents: joy, sad

        Constraints:
        - Speak only through structured output. No extra text.
        - Choose agents only from the list above.
        - Prefer clarity and coherence over breadth.

        Output strictly as JSON:
        {
          "agent": "joy",
          "reasons": "User celebrated good news; needs warm encouragement"
        }

        Latest user message:\n${userMessage}`;

    const { text: orchestratorResponseText } = await geminiGenerate({
      userText: orchestratorPrompt,
      systemPrompt: '',
      apiKey: context?.geminiKey,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            agent: { type: 'STRING' },
            reasons: { type: 'STRING' }
          },
          required: ['agent']
        }
      }
    });

    let agent = 'sad';
    let reasons = 'Defaulted to sad';
    try {
      const parsed = JSON.parse(orchestratorResponseText);
      const rawAgent = String(parsed?.agent || '').toLowerCase();
      if (rawAgent === 'sad' || rawAgent === 'sadness') agent = 'sad';
      if (rawAgent === 'joy') agent = 'joy';
      if (parsed?.reasons) reasons = String(parsed.reasons);
    } catch (_) {}

    const text = await this.respondWithAgent(agent, userMessage, context);

    const frameSet = { frames: { persona: { value: agent, rationale: [reasons] } } };
    return { assistantMessage: text || '', frameSet, agent, reasons };
  }
}


