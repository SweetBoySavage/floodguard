# FloodGuard agent rules

Use the `elevation-fetching-api` skill for coordinate-elevation work.

- Treat input coordinates as WGS84 latitude/longitude and validate them before lookup.
- Use Open Topo Data `srtm90m` only for single-point or small-batch terrain lookups; cache results and do not prefetch a national or global grid through the public API.
- Return metres above mean sea level as approximate terrain elevation, with source, resolution, and unavailable-data status.
- Keep API calls on the backend. Do not expose credentials or make a browser client depend directly on the upstream service.
- Do not turn elevation alone into a flood-risk verdict. Clearly distinguish approximate terrain data from engineering-grade or authoritative flood data.
- When delegating elevation work, send only the task, relevant coordinates, and user constraints. Request a concise structured result, not raw traces.
