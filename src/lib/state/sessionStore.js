// Simple in-memory session store for dev/demo. Not persisted across restarts.
// Map: sessionId -> session state
const sessions = new Map();

/**
 * Get an existing session or create one with defaults.
 *
 * Parameters:
 * - sessionId: unique session identifier.
 * - defaults: optional defaults (mode, memory, etc.).
 *
 * Returns: the current session state object.
 */
export function getOrCreateSession(sessionId, defaults) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      sessionId,
      history: []
    });
  }
  return sessions.get(sessionId);
}

/**
 * Shallow-merge a patch into a session.
 *
 * Parameters:
 * - sessionId: session identifier.
 * - patch: partial state to merge into the session.
 */
export function updateSession(sessionId, patch) {
  const s = sessions.get(sessionId);
  if (!s) return;
  Object.assign(s, patch);
}

/**
 * Remove all sessions (useful in dev/tests).
 */
export function clearAllSessions() {
  sessions.clear();
}
