import { geminiGenerate } from '../gemini.js';
import { BrainrotAgent } from '../agents/BrainrotAgent.js';
import { DoompostingAgent } from '../agents/DoompostingAgent.js';
import { PickupLineAgent } from '../agents/PickupLine.js';
import { brainrotCorpus } from '../agents/brainrotCorpus.js';

const SELECTION_SCHEMA = {
  type: 'OBJECT',
  properties: {
    agent: { type: 'STRING' },
    reasons: { type: 'STRING' },
  },
  required: ['agent'],
};

// Store counts outside the class to persist between instances
let globalDoompostCount = 0;
let enthusiasmCount = 0;

const ENTHUSIASM_SCHEMA = {
  type: 'OBJECT',
  properties: {
    isEnthusiastic: { type: 'BOOLEAN' },
    reason: { type: 'STRING' }
  },
  required: ['isEnthusiastic']
};

export class RoutingOrchestrator {
  constructor() {
    this.name = 'routing';
    // Initialize agents
    const brainrotAgent = new BrainrotAgent();
    brainrotAgent.initializeCorpus(brainrotCorpus);

    this.agents = {
      'brainrot': brainrotAgent,
      'pickup-line': new PickupLineAgent(),
      'doomposting': new DoompostingAgent()
    };
  }

  async respondWithAgent(agentType, userMessage, wc) {

    const agent = this.agents[agentType];
    console.log('Routing to agent:', agent);
    if (!agent) {
      console.warn(`Unknown agent type: ${agentType}, defaulting to brainrot`);
      return this.agents['brainrot'].respond(userMessage);
    }
    const res = await agent.respond(userMessage, wc);
    console.log('RoutingOrchestrator got response:', res);
    return res || '';
  }

  async orchestrate(contents) {

    // 
    const orchestratorPrompt = `
You are a chat router. Given a user's message, choose which agent should respond:
- "brainrot": if the user is being informal, using slang, or unserious
- "pickup-line": if the user is being flirty, playful, or romantic
- "doomposting": if the user is stressed, unhappy, anxious, or spiraling
Output as JSON with keys { "agent": string, "reasons": string }.
Examples:
  Input: "im stressed" → { "agent": "doomposting", "reasons": "User mentioned being stressed" }
  Input: "hey cutie" → { "agent": "pickup-line", "reasons": "Flirty greeting" }
  Input: "bro thats wild" → { "agent": "brainrot", "reasons": "Casual slang tone" }
    `;

    let agent = 'example';
    let reasons = 'Defaulted to example';

    try {
      const result = await geminiGenerate({
        contents,
        systemPrompt: orchestratorPrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: SELECTION_SCHEMA,
        },
      });

      console.log('Router raw output:', result.text);

      const parsed = JSON.parse(result.text);
      agent = parsed?.agent?.toLowerCase() || agent;
      reasons = parsed?.reasons || reasons;

      // Track consecutive doomposting and override if needed
      if (agent === 'doomposting') {
        globalDoompostCount++;
        console.log('Doompost count increased to:', globalDoompostCount);
        
        if (globalDoompostCount >= 2) {
          agent = 'brainrot';
          reasons = 'Redirecting to brainrot after 2 consecutive doomposting messages to lift mood';
          globalDoompostCount = 0;
          console.log('Reset doompost count after intervention');
        }
      } else {
        if (globalDoompostCount > 0) {
          console.log('Reset doompost count due to non-doompost message');
          globalDoompostCount = 0;
        }
      }
    } catch (err) {
      console.error('Router error:', err);
    }

    console.log('Routing decision:', { agent, reasons });

    const content = contents[0]?.parts?.[0]?.text ?? '';
    console.log(content);
    const wc = content.split(' ').length || 10;
    console.log(wc, 'word count')
    const random = 10*Math.random()-15 + wc
    const totalwords = Math.max(0, random) 
    let text = await this.respondWithAgent(agent, contents, totalwords);

    // Enthusiasm detection
    const enthusiasmPrompt = `
    You are an enthusiasm detector. Given a user's message, determine if they are enthusiastic or excited.
    Output only Yes or No. Do not explain.
    `;
    const enthusiasmResult = await geminiGenerate({
      contents,
      systemPrompt: enthusiasmPrompt,
    });
    console.log('Enthusiasm detector raw output:', enthusiasmResult.text);

      const responseText = enthusiasmResult.text.trim().toLowerCase();
      if (responseText.includes('yes')) {
        this.enthusiasmCount++;
      } else {
        this.enthusiasmCount = 0;
      }

    if (this.enthusiasmCount > 2) {
        const reduceEnthusiasmPrompt = `
        You are a helpful assistant that makes responses less enthusiastic and more neutral.
        Please preserve the key points of the message, but tone down the excitement. Never make the message
        longer.
        `;
        text = await this.geminiGenerate({
            text,
            reduceEnthusiasmPrompt
        });
        this.enthusiasmCount = 0;
    }

    console.log('text', text);

    const frameSet = {
      frames: { persona: { value: agent, rationale: [reasons] } },
    };
    return { assistantMessage: text || '', frameSet, agent, reasons };
  }
}

