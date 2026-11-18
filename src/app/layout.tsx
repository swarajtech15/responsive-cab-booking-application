import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { themeInitScript } from "@/lib/theme-store";
import "./globals.css";

export const metadata: Metadata = {
  title: "SwiftCab — Book a ride in seconds",
  description:
    "Map-first cab booking with live tracking, upfront fares in INR, and Economy, Comfort & Premium rides.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#090d18" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="light" data-bg="white" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
