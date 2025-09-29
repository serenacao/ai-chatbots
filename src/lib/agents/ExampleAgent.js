// Starter stub for the Example Frame Agent.
// TODO: Implement this agent. It should propose conversational dimensions
// (e.g., Norms: polite, teasing, direct, taboo_avoidance) and rules the replier must follow.

export class ExampleAgent {
  constructor() {
    this.name = 'norms';
  }

  /**
   * Propose conversational dimensions the assistant should follow.
   *
   * Dimension examples: Norms: polite, teasing, direct, taboo_avoidance.
   * Provide dimensions with short rationale and crisp rules (e.g., "use hedging",
   * "avoid slang", "ask 1 clarifying question at most").
   *
   * Parameters: (userMessage, context)
   * - userMessage: latest user message.
   * - context: recent conversation context.
   *
   * Returns: a proposal with frame='norms' and concrete constraints.
   */
  async propose(userMessage, context) {
    throw new Error('ExampleAgent.propose not implemented.');
  }
}
