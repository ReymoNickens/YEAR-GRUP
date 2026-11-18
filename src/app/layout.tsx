import type { Metadata, Viewport } from "next";
import { Fraunces, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { DemoRibbon } from "@/components/demo-ribbon";
import { OfflineSync } from "@/components/offline-sync";
import { demoMode } from "@/lib/hub/util";
import "./globals.css";

// Fraunces for the words that matter, Plus Jakarta Sans for what you tap and add up (it has tabular
// figures; Fraunces does not, so money is never set in it). Both carry the cedi sign (latin-ext).
const serif = Fraunces({ subsets: ["latin", "latin-ext"], axes: ["opsz"], style: ["normal", "italic"], variable: "--font-serif", display: "swap" });
const body = Plus_Jakarta_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-body", display: "swap" });
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
  themeColor: "#FBFAF8",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${body.variable} ${mono.variable}`} data-demo={demoMode() ? "" : undefined} suppressHydrationWarning>
      <head>
        {/* Light unless this person chose otherwise; set before first paint so nothing flashes. */}
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem("hub-theme");document.documentElement.dataset.theme=t==="dark"||t==="system"?t:"light"}catch(e){document.documentElement.dataset.theme="light"}` }} />
      </head>
      <body>
        <DemoRibbon />
        <OfflineSync />
        {children}
      </body>
    </html>
  );
}
