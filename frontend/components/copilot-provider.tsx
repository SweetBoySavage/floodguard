"use client";

import { CopilotKitProvider } from "@copilotkit/react-core/v2";

export function FloodGuardCopilotProvider({ children }: { children: React.ReactNode }) {
  // The v2 client parses this value with the URL constructor. A relative path
  // works in some Next versions but fails in the current CopilotKit release.
  const runtimeUrl = new URL(
    "/api/copilotkit",
    typeof window === "undefined" ? "http://localhost:3000" : window.location.origin,
  ).toString();

  return (
    <CopilotKitProvider
      runtimeUrl={runtimeUrl}
      agentId="floodguard_agent"
      useSingleEndpoint
    >
      {children}
    </CopilotKitProvider>
  );
}
