import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Big_Shoulders_Stencil, Instrument_Sans, Newsreader } from "next/font/google";
import { DemoRibbon } from "@/components/demo-ribbon";
import { OfflineSync } from "@/components/offline-sync";
import { demoMode } from "@/lib/hub/util";
import "./globals.css";

// Condensed jersey type for headings, chop-box stencil for names and stamps,
// an italic serif for the human touches, and a plain sans for reading.
const heading = Big_Shoulders({ subsets: ["latin"], weight: ["700", "800", "900"], variable: "--font-heading", display: "swap" });
const stencil = Big_Shoulders_Stencil({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-stencil-face", display: "swap" });
const note = Newsreader({ subsets: ["latin"], style: ["italic"], weight: ["400", "500"], variable: "--font-note-face", display: "swap" });
const body = Instrument_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body", display: "swap" });

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
    { media: "(prefers-color-scheme: light)", color: "#F1EEE5" },
    { media: "(prefers-color-scheme: dark)", color: "#121815" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${heading.variable} ${stencil.variable} ${note.variable} ${body.variable}`} data-demo={demoMode() ? "" : undefined}>
      <body>
        <DemoRibbon />
        <OfflineSync />
        {children}
      </body>
    </html>
  );
}
