import { geminiGenerate } from '../gemini.js';
import { BrainrotAgent } from '../agents/BrainrotAgent.js';
import { DoompostingAgent } from '../agents/DoompostingAgent.js';
import { PickupLineAgent } from '../agents/PickupLine.js';
import { brainrotCorpus } from '../agents/brainrotCorpus.js';
import { BasicAgent } from '../agents/Agent.js';

const SELECTION_SCHEMA = {
  type: 'OBJECT',
  properties: {
    weights: { type: 'STRING' },
    rationale: { type: 'STRING' },
    final_response: { type: 'STRING' }
  },
  required: ['final_response']
};

export class SynergizingOrchestrator {
  constructor() {
    this.name = 'synergizing';
    // Initialize agents
        const brainrotAgent = new BrainrotAgent();
        brainrotAgent.initializeCorpus(brainrotCorpus);
    
        this.agents = {
          'brainrot': brainrotAgent,
          'pickup-line': new PickupLineAgent(),
          'doomposting': new DoompostingAgent(), 
          'normal': new BasicAgent()
        };
  }

  async respondWithAgent(userMessage, wc) {
    const messages = []
    for (const [name, agent] of Object.entries(this.agents)) {
        const res = await agent.respond(userMessage, wc);
        console.log('response of agent', name,":", res);
        messages.push(`${name}: ${res}`);
    }
    return messages
  }

  async orchestrate(contents) {
    const text = contents[0]?.parts?.[0]?.text ?? '';
    console.log(text);
    const wc = text.split(' ').length || 10;
    console.log(wc, 'word count')
    const random = 10*Math.random()-15 + wc
    const totalwords = Math.max(0, random) 
    console.log('total words allowed', totalwords);
    const orchestratorPrompt = `
        You are a *synergizer* — a meta-agent that fuses the outputs of three stylistically distinct agents into one cohesive, lively message.

        You will receive:
        - The user's message.
        - The outputs of four agents:
        - **brainrot:** unserious, slangy, chaotic humor.
        - **pickup-line:** flirty, witty, and charming.
        - **doomposting:** dramatic, over-the-top despair or anxious humor. 
        - **normal:** a normal person.

        Your goal:
        🎯 Blend their tones into one natural, playful response that feels like a single personality speaking.

        ---

        ### How to combine
        1. **Extract the best bits** from each agent — e.g. brainrot's tone, pickup-line's charm, doomposting's exaggeration.
        2. **Merge** them into one short, fluid line.
        3. If one agent's energy clearly fits the user's message best, let it dominate (~60-70%), but keep flavor from the others for texture.
        4. Favor **semantic play**, double meanings, and rhythm — it should sound human and witty, not stitched together.
        5. Always keep it PG-13 and conversational.

        ### Rules
        - Output MUST be ${totalwords} words or fewer. Do NOT exceed this limit.
        - Output MUST make sense, as if it came from one person.
        - Unless the user is explicitly mentioning stress, keep the weight of doomposting < 10%

        ---
        ### Example

        **Input:**
        User: "hi"
        brainrot: "hii, not the mosquito again!"
        pickup-line: "Was that a 'hi,' or did my interest just go sky-high?"
        doomposting: "oh my goddddd, it's over, over;;; asdfgh. we're so doomed. doomed."
        normal: "hi"
        **Output:**
        {
        "weights": {
            "modelA": "20%",
            "modelB": "10%",
            "modelC": "20%"
            "modelD": "50%"
        },
        "rationale": "User is saying hi, respond without overwhelming them but stay playful.",
        "final_response": "hiii—did my interest just go sky-high?"
        }
    `;


    const allAgents = await this.respondWithAgent(contents, wc);
    console.log('output of agents', allAgents)

    const content = `User: ${contents}
    ${allAgents.join('\n')}`;

    const result = await geminiGenerate({
      contents: content,
      systemPrompt: orchestratorPrompt,
      config: {
          responseMimeType: 'application/json',
          responseSchema: SELECTION_SCHEMA,
        },
    });

    let weights = '{}', rationale = '', final_response = '';
    try {
        const parsed = JSON.parse(result.text);
        console.log(`parsed ${parsed}`)
        weights = parsed?.weights?.toLowerCase() || weights;
        rationale = parsed?.rationale || rationale;
        final_response = parsed?.final_response || final_response;

    } catch(e) {
        console.error('Something went wrong:', e);
    }
    console.log(`weights ${weights} rationale ${rationale}`)

    console.log('output of synthesizer:', final_response)

    const frameSet = { frames: { value: weights, rationale: rationale } };
    return { assistantMessage: final_response || '', frameSet };
  }
}


