# FloodGuard

A starter for a flood-operations chat experience: CopilotKit provides the
chat UI, a LangChain/LangGraph Python agent handles requests, and a Leaflet map
shows incident locations next to the conversation.

## Structure

- `frontend/` — Next.js, CopilotKit v2, and the side-by-side map UI.
- `backend/` — FastAPI endpoint exposing a LangChain agent using AG-UI.

## Run locally

Requires Node.js 20+ and Python 3.11+ with [uv](https://docs.astral.sh/uv/).

1. Create `backend/.env` from `backend/.env.example` and set `OPENAI_API_KEY`.
2. In one terminal, run the agent:

   ```sh
   cd backend
   uv sync
   uv run main.py
   ```

3. In a second terminal, install and start the web app:

   ```sh
   npm install
   npm run dev
   ```

4. Open http://localhost:3000.

The frontend's runtime route forwards to `http://localhost:8123` by default.
Set `LANGGRAPH_AGENT_URL` in `frontend/.env.local` if the agent is elsewhere.

The map markers and alert tool deliberately return sample data; wire both to a
trusted hydrology/alert source before relying on the app operationally.
