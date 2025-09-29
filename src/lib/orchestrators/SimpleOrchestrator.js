// Starter stub for the baseline orchestrator.
// TODO: Implement `orchestrate` to combine agent proposals into an ActivatedFrameSet.
// At minimum, collect proposals by frame and return { frameSet, notes }.

export class SimpleOrchestrator {
  constructor() {
    this.name = 'simple';
  }

  /**
   * Combine agent proposals into an activated frame set for this turn.
   *
   * - Merges proposals by frame (key, genre, ends, participants, norms).
   * - May consult the previous frame set to preserve stable choices and add transition notes.
   * - Returns a normalized frame set plus optional orchestration notes.
   *
   * Parameters:
   * - proposals: list of frame proposals from all agents.
   * - prev: previously activated frames, or null on the first turn.
   *
   * Returns: an object with `{ frameSet, notes }` where `frameSet` contains the active frames.
   *
   */
  orchestrate(proposals, prev) {
    throw new Error('SimpleOrchestrator.orchestrate not implemented. See src/lib/orchestrators/SimpleOrchestrator.js TODO.');
  }
}
