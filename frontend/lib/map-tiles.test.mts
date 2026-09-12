import assert from "node:assert/strict";
import test from "node:test";

import { createBaseMapTiles } from "./map-tiles.ts";

test("the CARTO Voyager tile request includes the configured browser key", () => {
  const tiles = createBaseMapTiles("demo/key");

  assert.equal(
    tiles.url,
    "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=demo%2Fkey",
  );
  assert.match(tiles.attribution, /openstreetmap\.org\/copyright/i);
  assert.match(tiles.attribution, /carto/i);
});

test("the CARTO tile configuration rejects a missing key before requesting tiles", () => {
  assert.throws(() => createBaseMapTiles("  "), /NEXT_PUBLIC_CARTO_API_KEY is required/);
});
