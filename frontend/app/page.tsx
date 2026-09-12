"use client";

import { CopilotChat } from "@copilotkit/react-core/v2";
import dynamic from "next/dynamic";

const FloodMap = dynamic(() => import("../components/flood-map"), { ssr: false });

export default function Home() {
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
        <FloodMap />
      </section>
    </main>
  );
}
