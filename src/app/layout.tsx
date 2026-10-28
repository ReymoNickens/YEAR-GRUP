import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { DemoRibbon } from "@/components/demo-ribbon";
import { OfflineSync } from "@/components/offline-sync";
import { demoMode } from "@/lib/hub/util";
import "./globals.css";

// An editorial serif for what we say, a crisp grotesk for what you do, mono for numbers on paper.
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-serif", display: "swap" });
const body = Geist({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono-face", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Year Group Hub", template: "%s · Year Group Hub" },
  description: "The year group, in one place: houses, cots and circles, giving with an honest ledger, and the people you grew up with.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/favicon.svg", apple: "/icon-180.png" },
  openGraph: { images: ["/og.jpg"] },
  appleWebApp: { capable: true, title: "Year Hub", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F3EE" },
    { media: "(prefers-color-scheme: dark)", color: "#0D0D0E" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${body.variable} ${mono.variable}`} data-demo={demoMode() ? "" : undefined}>
      <body>
        <DemoRibbon />
        <OfflineSync />
        {children}
      </body>
    </html>
  );
}
