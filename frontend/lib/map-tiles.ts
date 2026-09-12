export function createBaseMapTiles(apiKey: string | undefined) {
  const key = apiKey?.trim();
  const publicVoyagerUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  return {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; CARTO',
    // CARTO Voyager is a public tile service. `NEXT_PUBLIC_CARTO_API_KEY` is
    // reserved for a future CARTO Maps/data-layer integration; it must not be
    // required or appended to this public raster-tile endpoint.
    url: publicVoyagerUrl,
    ...(key ? { cartoApiKeyConfigured: true } : {}),
  } as const;
}
