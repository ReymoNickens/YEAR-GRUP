import type { Metadata, Viewport } from "next";
import { Alfa_Slab_One, Kalam, Literata, Special_Elite } from "next/font/google";
import { DemoRibbon } from "@/components/demo-ribbon";
import { OfflineSync } from "@/components/offline-sync";
import { demoMode } from "@/lib/hub/util";
import "./globals.css";

// The exercise book and the blackboard (docs/DESIGN.md): painted-sign slab capitals for names and headings,
// a biro and chalk hand for what people write, the typewriter for notices and labels, Literata for reading.
const sign = Alfa_Slab_One({ subsets: ["latin"], weight: "400", variable: "--face-sign", display: "swap" });
const hand = Kalam({ subsets: ["latin"], weight: ["400", "700"], variable: "--face-hand", display: "swap" });
const typed = Special_Elite({ subsets: ["latin"], weight: "400", variable: "--face-typed", display: "swap" });
const body = Literata({ subsets: ["latin"], weight: ["400", "500", "600", "700"], style: ["normal", "italic"], variable: "--font-body", display: "swap" });

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
    { media: "(prefers-color-scheme: light)", color: "#141212" },
    { media: "(prefers-color-scheme: dark)", color: "#1b1e1d" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sign.variable} ${hand.variable} ${typed.variable} ${body.variable}`} data-demo={demoMode() ? "" : undefined}>
      <body>
        <DemoRibbon />
        <OfflineSync />
        {children}
      </body>
    </html>
  );
}
