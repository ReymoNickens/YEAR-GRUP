"use client";
import { createContext, useContext, type ReactNode } from "react";

/** The year group this screen belongs to, loaded once on the server for every page under /o/[slug]. */
export type OrgFace = { slug: string; name: string; motto: string; place: string; crest: string; founded: string; me: { name: string; nickname: string } | null };

const OrgContext = createContext<OrgFace | null>(null);

export function OrgProvider({ org, children }: { org: OrgFace; children: ReactNode }) {
  return <OrgContext.Provider value={org}>{children}</OrgContext.Provider>;
}

export function useOrgFace(): OrgFace | null {
  return useContext(OrgContext);
}
