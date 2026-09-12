"use client";

import L from "leaflet";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";

const alerts = [
  { name: "Riverside", position: [52.371, 4.898] as [number, number], level: "High", color: "#ef6c4e" },
  { name: "Canal district", position: [52.359, 4.91] as [number, number], level: "Elevated", color: "#e4a93d" },
  { name: "North quay", position: [52.392, 4.919] as [number, number], level: "Watch", color: "#5ca6b6" },
];

export default function FloodMap() {
  return (
    <MapContainer center={[52.374, 4.905]} zoom={13} scrollWheelZoom className="map">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; CARTO'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
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
  );
}
