import { json } from '@sveltejs/kit';
import { getOrCreateSession, updateSession } from '$lib/state/sessionStore.js';
import { FramePipeline } from '$lib/pipeline/FramePipeline.js';

/**
 * Handle chat POST requests for a single-turn pipeline execution.
 *
 * Expects a JSON body: { sessionId, message, geminiKey? }.
 * - Creates or updates the session state.
 * - Runs the frame pipeline to get the assistant reply.
 * - Returns: { assistantMessage, history }.
 *
 * Errors:
 * - 400 if required fields are missing or Gemini key is missing.
 * - 500 on unexpected pipeline errors.
 *
 * Parameters: ({ request }) SvelteKit request wrapper.
 * Returns: JSON response with pipeline output or error.
 */
export async function POST({ request }) {
  const body = await request.json();
  const { sessionId, message } = body || {};
  if (!sessionId || !message) {
    return json({ error: 'sessionId and message are required' }, { status: 400 });
  }

  const session = getOrCreateSession(sessionId);
  const pipeline = new FramePipeline({ orchestratorMode: 'replier_only' });

  // Starter: pass the entirety of the conversation as context
  const historyWithPending = [...session.history, { role: 'user', content: message }];
  const context = { history: historyWithPending };

  try {
    const { assistantMessage, frameSet } = await pipeline.run({
      userMessage: message,
      context,
      prevFrameSet: null
    });

    const userMsg = { role: 'user', content: message };
    const assistantMsg = { role: 'assistant', content: assistantMessage };

    const history = [...session.history, userMsg, assistantMsg];
    updateSession(sessionId, { history });

    return json({
      assistantMessage,
      history,
      replierInput: {
        frameSet,
        contextCount: historyWithPending.length
      }
    });

  } catch (err) {

    const msg = String(err?.message || err || '').toLowerCase();

    if (msg.includes('gemini_api_key') || msg.includes('gemini') || msg.includes('api key')) {
      return json({ error: 'Gemini API key not found' }, { status: 400 });
    }

    return json({ error: 'Pipeline error', details: String(err?.message || err) }, { status: 500 });
  }
}

