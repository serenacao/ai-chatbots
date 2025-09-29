import { Replier } from '../replier/Replier.js';

export class FramePipeline {
  constructor({ orchestratorMode = 'simple' } = {}) {
    // Starter mode: replier-only. Agents and orchestrators are left for students to implement.
    this.agents = []; // TODO: Implement agents
    this.orchestrators = {}; // TODO: Implement orchestrators
    this.replier = new Replier();
    this.orchestratorMode = orchestratorMode;
  }

  setOrchestrator(mode) {
    // Starter keeps replier-only mode regardless of UI setting.
    this.orchestratorMode = mode;
  }

  /**
   * Run a full conversational turn: propose → orchestrate → reply.
   *
   * Steps:
   * - Collect proposals from agents (key, genre, ends, participants, norms).
   * - Orchestrate proposals into an activated frame set.
   * - Generate the assistant message using the Replier.
   *
   * Parameters: ({ userMessage, context, prevFrameSet })
   * - userMessage: latest user message.
   * - context: conversation history and optional API key.
   * - prevFrameSet: previously activated frames, if any.
   *
   * Returns: an object with assistantMessage, proposals, frameSet, notes, orchestrator.
   */
  async run({ userMessage, context, prevFrameSet }) {
    
    // Minimal default frames so the replier has constraints to follow.
    const frames = {
      key: { frame: 'key', value: 'neutral', rationale: ['starter default'], constraints: { rules: [] } },
      genre: { frame: 'genre', value: 'chat', rationale: ['starter default'], constraints: { rules: [] } },
      ends: { frame: 'ends', value: 'chat', rationale: ['starter default'], constraints: { rules: [] } },
      participants: { frame: 'participants', value: 'peer_helper', rationale: ['starter default'], constraints: { rules: [] } },
      norms: { frame: 'norms', value: 'polite', rationale: ['starter default'], constraints: { rules: [] } }
    };

    const frameSet = { frames, meta: { orchestrator: this.orchestratorMode } };
    const assistantMessage = await this.replier.reply({ userMessage, context, frameSet });
    return {
      assistantMessage,
      proposals: [],
      frameSet,
      notes: ['Replier-only starter mode: using default frames'],
      orchestrator: this.orchestratorMode
    };
  }
}
