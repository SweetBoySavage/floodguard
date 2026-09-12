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

`frontend/.env.example` also includes `NEXT_PUBLIC_CARTO_API_KEY` for a
restricted, browser-safe CARTO access token when you add CARTO Maps or data
layers. The current public basemap does not require it.

The map markers and alert tool deliberately return sample data; wire both to a
trusted hydrology/alert source before relying on the app operationally.

## Elevation lookup

The agent can resolve a location name and look up its terrain elevation. For
example: "What are the coordinates for Amsterdam?" or "What is the terrain
elevation in Amsterdam?" It first uses
Open-Meteo's public Geocoding API to find WGS84 coordinates, then can use its
public Elevation API, which uses a 90 m Copernicus digital elevation model.
This is terrain elevation, not a water level or a survey-grade measurement.

When the agent resolves a location, it also calls a CopilotKit frontend tool to
pan and zoom the map to the selected result.

The elevation-options overlay is generated for the selected location from a
nearby Open-Meteo elevation grid. It highlights lower terrain cells as
conceptual retention-screening candidates; it is not infrastructure design or
evidence of viable water storage.

## Flood-mitigation recommendations

For mitigation questions, the agent loads the advisor instructions in
`agents/flood-mitigation/system-prompt.md` together with the interventions in
`knowledge/dutch_flood_mitigation.md` and the advisor output schema. It only
makes screening-level, evidence-based recommendations and identifies missing
local flood, land-use, and infrastructure information instead of inventing it.
The knowledge reference includes Delta Works principles for barriers, dams,
sluices, pumps, primary defences, and multi-layer consequence reduction, with
explicit limits on transferring them outside their local hydraulic context.
