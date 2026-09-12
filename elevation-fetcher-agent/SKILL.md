---
name: elevation-fetching-api
description: Fetch global terrain elevation for WGS84 coordinates through the Open Topo Data API. Use when implementing, debugging, or answering questions about single-point or small-batch elevation lookups, GeoJSON elevation output, request validation, caching, source limits, or terrain-data caveats.
---

# Elevation Fetching API

Use Open Topo Data's public `srtm90m` endpoint for approximate terrain elevation on global land. Treat it as a prototype or low-volume service, not a bulk-download or production-critical dependency.

## Request workflow

1. Validate every location as WGS84 latitude/longitude: latitude `-90..90`, longitude `-180..180`.
2. Send one location or a small batch to `https://api.opentopodata.org/v1/srtm90m`.
3. Request `format=geojson` only when map features are needed; otherwise use normal JSON.
4. Preserve `null` elevations as unavailable data. Do not replace them with `0`.
5. Return elevation as approximate metres above mean sea level (SRTM/EGM96 reference), label the source and resolution (~90 m), and retain the original coordinates.

### Single or small batch

Use `GET` with `locations` as pipe-separated `latitude,longitude` pairs:

```text
GET /v1/srtm90m?locations=23.8103,90.4125|22.3569,91.7832&format=geojson
```

For larger batches, use `POST` with JSON rather than constructing an oversized URL:

```json
{
  "locations": "23.8103,90.4125|22.3569,91.7832",
  "format": "geojson",
  "interpolation": "bilinear"
}
```

Use batches of roughly 100–500 points, retry transient failures with backoff, and cache by rounded coordinates. Never attempt to fetch a country-wide 90 m grid from this service.

## Response contract

When GeoJSON is requested, return a valid `FeatureCollection`. Each successful feature should use `[longitude, latitude, elevation_m]` coordinates and identify `srtm90m` in properties. Keep application fields in `properties`, not in the geometry.

For a normal JSON API response, expose a stable application shape:

```json
{
  "latitude": 23.8103,
  "longitude": 90.4125,
  "elevation_m": 6,
  "source": "srtm90m",
  "resolution_m": 90,
  "status": "ok"
}
```

For missing coverage or `null` elevation, return `status: "unavailable"` and no invented elevation.

## Integration boundaries

- Call the upstream API from the backend, not directly from an untrusted browser client.
- Do not expose upstream credentials if another provider is added later.
- Do not use this approximate 90 m terrain value for engineering design, parcel-level assessment, drainage design, or authoritative flood decisions.
- Use a national-scale precomputed layer for map rendering and request this API only for click/search drill-down.
- Keep terrain elevation separate from a flood-risk conclusion; flood risk also requires water level, rainfall, drainage, land cover, and local survey data.

## Source notes

The public endpoint is documented as a testing service. Check current provider documentation before setting production service-level expectations or limits. The API supports both JSON and GeoJSON output, and `POST` is the appropriate transport when many coordinate pairs would exceed URL limits.
