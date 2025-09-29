## A3: Multi‑agent Interaction (Frame Switching)

This starter guides you to build a frame‑sensitive conversational system in SvelteKit. You will design and implement frame agents, an orchestrator, and a replier so the system adapts its tone/genre/goals based on context.

Out of the box, the app runs in “replier‑only” mode with default frames so you can chat immediately after setting your Gemini API key.

What’s included:
- SvelteKit UI with a chat panel and a small debug section. The debug section is there for your and course staff's testing.
- Replier that uses Gemini (with a safe local fallback if the model fails).
- Pipeline shell; agents and orchestrators are stubbed as TODOs.
- Simple in‑memory session store.

What you implement:
- Frame Agents in `src/lib/agents/*` (throw “not implemented” until you add logic).
- Orchestrators in `src/lib/orchestrators/*` (also stubbed).


## Step 0 — Fresh Setup (Tools + Local Run)

Install required tools (choose per OS):
- Node.js 20.x (includes npm)
  - macOS: `brew install node` (Homebrew), or download from nodejs.org
  - Windows: install Node LTS from nodejs.org (includes npm)
  - Linux: use your package manager or NodeSource installers
- Git (to clone and manage the repo)
- An editor (Cursor recommended)

Clone and start the app:
- `git clone <your-repo-url>`
- `cd A3-Starter`
- `cp .env.example .env` (you will fill it in Step 1)
- `npm install`
- `npm run dev`
- Open `http://localhost:5173`

Notes:
- No global Svelte/SvelteKit install is needed — everything is local via npm.
- This project uses Vite; hot reload works out of the box.


## Step 1 — Get Your Gemini API Key (Google AI Studio)

Create an API key in Google AI Studio and add it to `.env`.

Important: While you will use your `@mit.edu` email to get a coupon code for Gemini credits, do NOT claim credits using your `@mit.edu` email. Instead, use a personal Google account to avoid institutional billing/limits.

Steps:
- Go to Google AI Studio (https://aistudio.google.com/)
- Click Get API Key
- Click Create API Key
- Copy your key and set environment values in `.env`:

```
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

Restart `npm run dev` after changing `.env`.


## Step 2 — Build Frame Agents

Implement agents that each own one frame. 

What to do:
- Implement `propose(userMessage, context)` in each file.
- Output a proposal object: `{ frame, value, rationale: string[], constraints: { rules?: string[], style?: object } }`.
- Detect cues from the user’s message and recent history; add concrete constraints (e.g., “use numbered steps”, “avoid exclamations”).
- You may call Gemini using `geminiGenerate()` and parse strict JSON with `extractJson()` from `src/lib/utils/text.js`.

Tip: Keep prompts short and explicit about allowed values and required JSON shape. Experiment with [structured output](https://ai.google.dev/gemini-api/docs/structured-output) to ensure the agent is outputting the correct JSON.

## Step 3 — Orchestrate Proposals

Combine agent proposals into an activated frame set for the turn.

Where:
- `src/lib/orchestrators/SimpleOrchestrator.js` (basic merge)

What to do:
- Implement `orchestrate(proposals, prev)` to produce `{ frameSet, notes }`.
- Then experiment with a more complex orchestrator. 

Wire it in:
- Update `src/lib/pipeline/FramePipeline.js` to instantiate your agents and orchestrator, then:
  - collect `proposals = await Promise.all(agents.map(a => a.propose(...)))`
  - `const { frameSet } = orchestrator.orchestrate(proposals, prevFrameSet)`
  - pass `frameSet` to the replier


## Step 4 — Experiment With The Replier

Where: `src/lib/replier/Replier.js`

Ideas:
- Tune the system prompt: enforce tone/genre/goal more strongly, add examples.
- Add stylistic rules from agent constraints (already scaffolded in comments).
- Improve the local fallback template for when the model is unavailable.

## Step 5 — Deploy (Vercel, Safely)

Set up Vercel and deploy without exposing secrets.

Reminder: do not commit `.env` or any API keys to Git.

Steps:
- Create a Vercel account and import your GitHub repo as a new project
- In Vercel Project Settings → Environment Variables, add:
  - `GEMINI_API_KEY` (Production/Preview/Development as appropriate)
  - `GEMINI_MODEL` (e.g., `gemini-2.5-flash`)
- Trigger a deploy (Vercel builds and hosts your app)
- Verify the app works at your Vercel URL

Safety reminders:
- Ensure `.env` is in `.gitignore` (already included)
- Never push secrets to Git; use Vercel Environment Variables only
- Optionally rotate keys after testing


## Quick Dev Reference

- Start dev server: `npm run dev` (http://localhost:5173)
- Build: `npm run build`
- Preview production build: `npm run preview`

Replier‑only mode: The pipeline currently bypasses agents/orchestrators and supplies default frames so you can chat immediately. As you implement agents/orchestrators, rewire the pipeline to use them.
