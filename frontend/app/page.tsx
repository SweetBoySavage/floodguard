"use client";

import { CopilotChat, useFrontendTool } from "@copilotkit/react-core/v2";
import dynamic from "next/dynamic";
import { useState } from "react";
import { z } from "zod";

const FloodMap = dynamic(() => import("../components/flood-map"), { ssr: false });

export default function Home() {
  const [mapTarget, setMapTarget] = useState<{ latitude: number; longitude: number; label: string }>();
  const [mapLayers, setMapLayers] = useState({ risk: false, infrastructure: false });

  useFrontendTool({
    name: "focus_map",
    description: "Pan and zoom the FloodGuard map to a resolved WGS84 location. Call this whenever the user asks about a location.",
    parameters: z.object({
      latitude: z.number().min(-90).max(90).describe("WGS84 latitude"),
      longitude: z.number().min(-180).max(180).describe("WGS84 longitude"),
      label: z.string().describe("Human-readable location name"),
    }),
    handler: async ({ latitude, longitude, label }) => {
      setMapTarget({ latitude, longitude, label });
      return `Map centered on ${label} at ${latitude.toFixed(5)}, ${longitude.toFixed(5)}.`;
    },
  }, []);

  useFrontendTool({
    name: "show_map_layers",
    description:
      "Show or hide FloodGuard map overlays. Show risk for flood-risk or alert questions; show both risk and infrastructure for flood-mitigation recommendations.",
    parameters: z.object({
      risk: z.boolean().describe("Whether to show the flood-risk intensity overlay"),
      infrastructure: z.boolean().describe("Whether to show conceptual flood-protection opportunity areas"),
      reason: z.string().describe("Short explanation of why these overlays are relevant"),
    }),
    handler: async ({ risk, infrastructure, reason }) => {
      setMapLayers({ risk, infrastructure });
      return `Map overlays updated: risk=${risk}, infrastructure=${infrastructure}. ${reason}`;
    },
  }, []);

  return (
    <main className="app-shell">
      <section className="chat-panel" aria-label="FloodGuard assistant">
        <div className="panel-heading">
          <p className="eyebrow">FloodGuard</p>
          <h1>Operations copilot</h1>
          <p>Ask about flood alerts, affected areas, or response priorities.</p>
        </div>
        <CopilotChat
          className="copilot-chat"
          labels={{
            welcomeMessageText: "I can help assess the current flood situation. What would you like to know?",
            chatInputPlaceholder: "Ask about an alert or location…",
          }}
        />
      </section>
      <section className="map-panel" aria-label="Flood alert map">
        <div className="map-heading">
          <div>
            <p className="eyebrow">Live overview</p>
            <h2>Flood risk map</h2>
          </div>
          <span className="status"><i /> Monitoring</span>
        </div>
        <FloodMap target={mapTarget} requestedLayers={mapLayers} />
      </section>
    </main>
  );
}
