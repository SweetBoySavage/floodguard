export function createBaseMapTiles(apiKey: string | undefined) {
  const key = apiKey?.trim();

  if (!key) {
    throw new Error("NEXT_PUBLIC_CARTO_API_KEY is required for the CARTO Voyager basemap");
  }

  return {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; CARTO',
    url: `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${encodeURIComponent(key)}`,
  } as const;
}
