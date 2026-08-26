import type { Metadata } from "next";
import "./globals.css";
import "./cinematic-ui.css";

export const metadata: Metadata = {
  title: "Chithraguptha — The Cosmic Ledger",
  description: "Anonymous confessions, community judgment, and mythology-inspired karmic stories.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
