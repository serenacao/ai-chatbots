import { json } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { calculateTemperature, getTemperatureInfo } from '$lib/temperature.js';

// default orchestrator (production)
import { Orchestrator as DefaultOrchestrator } from '$lib/orchestrators/ExampleJoySadOrchestrator.js';
// optional orchestrators
import { RoutingOrchestrator } from '$lib/orchestrators/routingOrchestrator.js';
import { SynergizingOrchestrator } from '$lib/orchestrators/SynergizingOrchestrator.js';

/**
 * Handle chat POST requests for a single-turn pipeline execution.
 *
 * Parameters: ({ request }) SvelteKit request wrapper.
 * Returns: JSON response with pipeline output or error.
 */
export async function POST({ request }) {
  const body = await request.json();
  const { history } = body || {};

  if (!Array.isArray(history)) {
    return json({ error: 'history array is required' }, { status: 400 });
  }

  try {
    // select orchestrator:
    // - if ORCHESTRATOR env var is set to 'routing' or 'synergize', use those
    // - otherwise, default to routing in dev mode, or the ExampleJoySadOrchestrator in production
    const envChoice = process.env.ORCHESTRATOR || '';
    let orchestrator;
    if (envChoice === 'routing') orchestrator = new RoutingOrchestrator();
    else if (envChoice === 'synergize' || envChoice === 'synergizing') orchestrator = new SynergizingOrchestrator();
    else if (dev) orchestrator = new RoutingOrchestrator();
    else orchestrator = new RoutingOrchestrator();
    const contents = history.map((m) => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] }));
    
    const { assistantMessage, frameSet, agent, reasons } = await orchestrator.orchestrate(contents);
    
    // Calculate temperature and get color info
    const temperature = await calculateTemperature(contents[contents.length - 1].parts[0].text);
    const temperatureInfo = getTemperatureInfo(temperature);
    
    return json({ 
      assistantMessage, 
      replierInput: { frameSet, contextCount: history.length, agent, reasons },
      temperature: {
        value: temperature,
        category: temperatureInfo.category,
        color: temperatureInfo.color,
        bgColor: temperatureInfo.bgColor,
        description: temperatureInfo.description
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
