import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { OfflineSync } from "@/components/offline-sync";
import "./globals.css";

const display = Fraunces({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-fraunces", display: "swap" });
const sans = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-outfit", display: "swap" });

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
    { media: "(prefers-color-scheme: light)", color: "#F3EEE6" },
    { media: "(prefers-color-scheme: dark)", color: "#12100E" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <OfflineSync />
        {children}
      </body>
    </html>
  );
}
