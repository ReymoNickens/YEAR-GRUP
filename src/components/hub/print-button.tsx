"use client";
import { Printer } from "lucide-react";

/** Phones offer "Save as PDF" from the print sheet, so this doubles as the download. */
export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-line bg-card text-sm font-medium print:hidden">
      <Printer className="size-4" />
      Save or print this receipt
    </button>
  );
}
