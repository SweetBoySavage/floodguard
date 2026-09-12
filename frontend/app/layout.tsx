import type { Metadata } from "next";
import { FloodGuardCopilotProvider } from "../components/copilot-provider";
import "@copilotkit/react-core/v2/styles.css";
import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "FloodGuard",
  description: "Flood monitoring copilot",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <FloodGuardCopilotProvider>{children}</FloodGuardCopilotProvider>
      </body>
    </html>
  );
}
