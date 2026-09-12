"use client";

import { useEffect, useState } from "react";
import { Circle, CircleMarker, MapContainer, Polygon, Polyline, Popup, TileLayer, useMap } from "react-leaflet";

import { createBaseMapTiles } from "../lib/map-tiles";

const baseMapTiles = createBaseMapTiles(process.env.NEXT_PUBLIC_CARTO_API_KEY);

const alerts = [
  { name: "Riverside", position: [52.371, 4.898] as [number, number], level: "High", color: "#ef6c4e" },
  { name: "Canal district", position: [52.359, 4.91] as [number, number], level: "Elevated", color: "#e4a93d" },
  { name: "North quay", position: [52.392, 4.919] as [number, number], level: "Watch", color: "#5ca6b6" },
];

type MapTarget = { latitude: number; longitude: number; label: string };
type MapLayers = { risk: boolean; infrastructure: boolean };

const riskHotspots = [
  { name: "Low-lying waterfront", position: [52.369, 4.884] as [number, number], radius: 950, color: "#e04f40", opacity: 0.22 },
  { name: "Canal drainage catchment", position: [52.357, 4.905] as [number, number], radius: 780, color: "#f2a441", opacity: 0.2 },
  { name: "Northern quay", position: [52.391, 4.916] as [number, number], radius: 620, color: "#f4cf57", opacity: 0.18 },
];

const infrastructureOpportunities = [
  {
    name: "Conceptual retention area",
    positions: [[52.356, 4.89], [52.356, 4.898], [52.351, 4.898], [52.351, 4.89]] as [number, number][],
    description: "Illustrative screening area for temporary water storage.",
  },
  {
    name: "Conceptual defence corridor",
    positions: [[52.383, 4.884], [52.379, 4.895], [52.374, 4.906]] as [number, number][],
    description: "Illustrative corridor for a flood-defence assessment.",
  },
];

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

  useEffect(() => setLayers(requestedLayers), [requestedLayers]);

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
          Protection options
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
      {layers.infrastructure && infrastructureOpportunities.map((opportunity) => (
        "positions" in opportunity ? (
          opportunity.name.includes("retention") ? (
            <Polygon
              key={opportunity.name}
              positions={opportunity.positions}
              pathOptions={{ color: "#297e77", fillColor: "#5dc2aa", fillOpacity: 0.27, weight: 2, dashArray: "6 5" }}
            >
              <Popup><strong>{opportunity.name}</strong><br />{opportunity.description}</Popup>
            </Polygon>
          ) : (
            <Polyline key={opportunity.name} positions={opportunity.positions} pathOptions={{ color: "#297e77", weight: 5, dashArray: "8 6" }}>
              <Popup><strong>{opportunity.name}</strong><br />{opportunity.description}</Popup>
            </Polyline>
          )
        ) : null
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
