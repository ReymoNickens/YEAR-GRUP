import type { Metadata, Viewport } from "next";
import { Cormorant, Source_Serif_4 } from "next/font/google";
import { DemoRibbon } from "@/components/demo-ribbon";
import { OfflineSync } from "@/components/offline-sync";
import { demoMode } from "@/lib/hub/util";
import "./globals.css";

// The Honours Board: Cormorant for lettering (names, headlines, figures), Source Serif 4 for reading.
const lettering = Cormorant({ subsets: ["latin"], weight: ["500", "600", "700"], style: ["normal", "italic"], variable: "--font-serif", display: "swap" });
const body = Source_Serif_4({ subsets: ["latin"], weight: ["400", "500", "600", "700"], style: ["normal", "italic"], variable: "--font-body", display: "swap" });

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
    { media: "(prefers-color-scheme: light)", color: "#12100D" },
    { media: "(prefers-color-scheme: dark)", color: "#12100D" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${lettering.variable} ${body.variable}`} data-demo={demoMode() ? "" : undefined}>
      <body>
        <DemoRibbon />
        <OfflineSync />
        {children}
      </body>
    </html>
  );
}
