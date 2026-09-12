"use client";

import { useEffect, useState } from "react";
import { Circle, CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";

import { createBaseMapTiles } from "../lib/map-tiles";

const baseMapTiles = createBaseMapTiles(process.env.NEXT_PUBLIC_CARTO_API_KEY);

const alerts = [
  { name: "Riverside", position: [52.371, 4.898] as [number, number], level: "High", color: "#ef6c4e" },
  { name: "Canal district", position: [52.359, 4.91] as [number, number], level: "Elevated", color: "#e4a93d" },
  { name: "North quay", position: [52.392, 4.919] as [number, number], level: "Watch", color: "#5ca6b6" },
];

type MapTarget = { latitude: number; longitude: number; label: string };
type MapLayers = { risk: boolean; infrastructure: boolean };
type TerrainOpportunity = { latitude: number; longitude: number; elevation: number };

const riskHotspots = [
  { name: "Low-lying waterfront", position: [52.369, 4.884] as [number, number], radius: 950, color: "#e04f40", opacity: 0.22 },
  { name: "Canal drainage catchment", position: [52.357, 4.905] as [number, number], radius: 780, color: "#f2a441", opacity: 0.2 },
  { name: "Northern quay", position: [52.391, 4.916] as [number, number], radius: 620, color: "#f4cf57", opacity: 0.18 },
];

const ELEVATION_API_URL = "https://api.open-meteo.com/v1/elevation";

function makeElevationGrid(target: MapTarget) {
  const offsets = [-0.009, -0.0045, 0, 0.0045, 0.009];
  return offsets.flatMap((latitudeOffset) =>
    offsets.map((longitudeOffset) => ({
      latitude: target.latitude + latitudeOffset,
      longitude: target.longitude + longitudeOffset,
    })),
  );
}
function MapViewport({ target }: { target?: MapTarget }) {
  const map = useMap();

  useEffect(() => {
    if (target) map.flyTo([target.latitude, target.longitude], 13, { animate: true, duration: 1.2 });
  }, [map, target]);

  return target ? (
    <CircleMarker
      center={[target.latitude, target.longitude]}
      radius={9}
      pathOptions={{ color: "#267c8c", fillColor: "#267c8c", fillOpacity: 0.85, weight: 3 }}
    >
      <Popup>{target.label}</Popup>
    </CircleMarker>
  ) : null;
}

export default function FloodMap({
  target,
  requestedLayers,
}: {
  target?: MapTarget;
  requestedLayers: MapLayers;
}) {
  const [layers, setLayers] = useState(requestedLayers);
  const [terrainOpportunities, setTerrainOpportunities] = useState<TerrainOpportunity[]>([]);

  useEffect(() => setLayers(requestedLayers), [requestedLayers]);

  useEffect(() => {
    if (!target) {
      setTerrainOpportunities([]);
      return;
    }

    const controller = new AbortController();
    const grid = makeElevationGrid(target);
    const params = new URLSearchParams({
      latitude: grid.map((point) => point.latitude.toFixed(5)).join(","),
      longitude: grid.map((point) => point.longitude.toFixed(5)).join(","),
    });

    fetch(`${ELEVATION_API_URL}?${params}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Elevation request failed (${response.status})`);
        return response.json() as Promise<{ elevation?: number[] }>;
      })
      .then((data) => {
        if (!data.elevation || data.elevation.length !== grid.length) throw new Error("Incomplete elevation data");

        // Lowest cells are candidate retention areas only. This terrain screen
        // does not establish storage, flow paths, land availability, or safety.
        const lowest = grid
          .map((point, index) => ({ ...point, elevation: data.elevation![index] }))
          .sort((a, b) => a.elevation - b.elevation)
          .slice(0, 3);
        setTerrainOpportunities(lowest);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.warn("Unable to generate elevation-based infrastructure opportunities", error);
        setTerrainOpportunities([]);
      });

    return () => controller.abort();
  }, [target]);

  return (
    <div className="map-wrap">
      <div className="map-controls" aria-label="Map layers">
        <span>Overlays</span>
        <label>
          <input
            type="checkbox"
            checked={layers.risk}
            onChange={(event) => setLayers((current) => ({ ...current, risk: event.target.checked }))}
          />
          Risk intensity
        </label>
        <label>
          <input
            type="checkbox"
            checked={layers.infrastructure}
            onChange={(event) => setLayers((current) => ({ ...current, infrastructure: event.target.checked }))}
          />
          Elevation options
        </label>
      </div>
      <MapContainer center={[52.374, 4.905]} zoom={13} scrollWheelZoom className="map">
      <TileLayer
        attribution={baseMapTiles.attribution}
        url={baseMapTiles.url}
      />
      <MapViewport target={target} />
      {layers.risk && riskHotspots.map((hotspot) => (
        <Circle
          key={hotspot.name}
          center={hotspot.position}
          radius={hotspot.radius}
          pathOptions={{ color: hotspot.color, fillColor: hotspot.color, fillOpacity: hotspot.opacity, weight: 0 }}
        >
          <Popup><strong>{hotspot.name}</strong><br />Illustrative risk-intensity area.</Popup>
        </Circle>
      ))}
      {layers.infrastructure && terrainOpportunities.map((opportunity, index) => (
        <Circle
          key={`${opportunity.latitude}-${opportunity.longitude}`}
          center={[opportunity.latitude, opportunity.longitude]}
          radius={280}
          pathOptions={{ color: "#297e77", fillColor: "#5dc2aa", fillOpacity: 0.27, weight: 2, dashArray: "6 5" }}
        >
          <Popup>
            <strong>Potential retention screening area {index + 1}</strong><br />
            Low terrain cell: {opportunity.elevation.toFixed(0)} m above mean sea level.<br />
            Generated from public elevation data; not an approved project location.
          </Popup>
        </Circle>
      ))}
      {alerts.map((alert) => (
        <CircleMarker
          key={alert.name}
          center={alert.position}
          radius={12}
          pathOptions={{ color: alert.color, fillColor: alert.color, fillOpacity: 0.55, weight: 3 }}
        >
          <Popup>
            <strong>{alert.name}</strong><br />
            Risk level: {alert.level}
          </Popup>
        </CircleMarker>
      ))}
      </MapContainer>
    </div>
  );
}
