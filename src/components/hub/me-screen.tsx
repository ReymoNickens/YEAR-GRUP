"use client";
import {
  ArrowRight, Cake, CalendarCheck, CalendarDays, Handshake, HeartHandshake, Hourglass, Images, Landmark, LayoutDashboard, Lightbulb,
  ListChecks, Mail, MessageCircleQuestion, Newspaper, Receipt, School, ShoppingBag, Sparkles, Store, UserRound, Vote,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { signOut } from "@/lib/auth/client";
import { orgEntry, peersWaiting } from "@/lib/hub/api";
import { hubAct } from "@/lib/hub/act";
import { Shell } from "@/components/hub/shell";
import { Avatar, Button, Note, Pill, Section, State } from "@/components/hub/ui";
import { useHub } from "@/components/hub/use-hub";

const links = [
  ["events", "Events", CalendarDays],
  ["photos", "Photos", Images],
  ["inbox", "Messages", Mail],
  ["directory", "Businesses", Store],
  ["asks", "Ask the year", MessageCircleQuestion],
  ["polls", "Polls", Vote],
  ["roll", "Roll call", ListChecks],
  ["birthdays", "Birthdays", Cake],
  ["milestones", "News", Newspaper],
  ["spotlight", "Spotlight", Sparkles],
  ["capsules", "Time capsules", Hourglass],
  ["trivia", "School trivia", Lightbulb],
  ["mentoring", "Mentoring", Handshake],
  ["welfare", "Welfare", HeartHandshake],
  ["elections", "Elections", Landmark],
  ["impact", "For the school", School],
  ["store", "Store", ShoppingBag],
] as const;

export function MeScreen({ slug }: { slug: string }) {
  const entry = useHub(`me-${slug}`, () => orgEntry({ data: slug }));
  const waiting = useHub(`wait-${slug}`, () => peersWaiting({ data: { slug } }));
  const m = entry.data?.member;
  const [confirmed, setConfirmed] = useState<string[]>([]);
  const [msg, setMsg] = useState("");
  async function confirmPerson(id: string) {
    try {
      await hubAct({ data: { type: "confirm", slug, membershipId: id } });
      setConfirmed((c) => [...c, id]);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Not confirmed.");
    }
  }
  const pending = (waiting.data ?? []).filter((w) => !confirmed.includes(w.id));
  const roleNames = entry.data?.titles ?? [];
  return (
    <Shell slug={slug} wide>
      <State loading={entry.loading} error={entry.error}>
        {m ? (
          <div>
            <div className="min-w-0 max-w-3xl">
              <header className="rise flex items-center gap-5">
                <Avatar name={m.displayName} size={80} me />
                <div className="min-w-0">
                  <p className="kicker">{m.status === "verified" ? "Confirmed old boy" : "Claimed, not yet confirmed"}</p>
                  <h1 className="display-md mt-2 truncate">{m.nickname || m.displayName}</h1>
                  {m.nickname ? <p className="mt-1 truncate text-muted">{m.displayName}</p> : null}
                </div>
              </header>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {(roleNames.length ? roleNames : ["Member"]).map((r) => <Pill key={r} tone={r === "Member" ? "plain" : "ink"}>{r}</Pill>)}
              </div>

              {entry.data?.control ? (
                <Link href={`/o/${slug}/control/people`} className="group mt-8 flex items-center gap-4 bg-ink px-5 py-5 text-paper">
                  <span className="grid size-11 shrink-0 place-items-center border border-paper/30"><LayoutDashboard className="size-5" strokeWidth={1.75} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[17px] font-semibold">Control room</span>
                    <span className="block text-sm text-paper/70">Money, people, messages and the audit trail</span>
                  </span>
                  <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                </Link>
              ) : null}

              <Link href={`/o/${slug}/dues`} className="group mt-8 flex items-center gap-4 border border-line bg-card px-5 py-4 hover:border-ink">
                <CalendarCheck className="size-5 shrink-0" strokeWidth={1.75} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold">My dues</span>
                  <span className="block text-sm text-muted">What is due, what you have paid, and receipts</span>
                </span>
                <ArrowRight className="size-5 text-muted transition-transform group-hover:translate-x-0.5" />
              </Link>

              {pending.length > 0 ? (
                <Section title="Waiting for you" className="mt-10">
                  <Note>Confirm only people you know. Two cot mates, or one executive, bring them in.</Note>
                  <ul className="mt-2 ruled-list">
                    {pending.map((w) => (
                      <li key={w.id} className="flex items-center gap-3.5 py-3.5">
                        <Avatar name={w.name} size={44} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[15px] font-semibold">{w.name}</span>
                          <span className="block truncate text-[13px] text-muted">{[w.house, w.dorm, w.cot ? `cot ${w.cot}` : null].filter(Boolean).join(" · ")}</span>
                        </span>
                        <Button size="sm" block={false} onClick={() => confirmPerson(w.id)}>I know them</Button>
                      </li>
                    ))}
                  </ul>
                </Section>
              ) : null}

              <Section title="The year group" className="mt-10">
                <ul className="grid grid-cols-2 border-t border-l border-line sm:grid-cols-3">
                  {links.map(([id, label, Icon]) => (
                    <li key={id} className="border-r border-b border-line">
                      <Link className="flex min-h-[5.5rem] flex-col justify-between gap-3 p-4 transition-colors hover:bg-card" href={`/o/${slug}/m/${id}`}>
                        <Icon className="size-5 text-ink-2" strokeWidth={1.6} />
                        <span className="text-[15px] font-medium">{label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Section>

              <Section title="Your account" className="mt-10">
                <ul className="ruled-list">
                  {([["details", "Your details", "Nickname, city, work, birthday and phone", UserRound], ["receipts", "Receipts", "Every gift and payment you have made", Receipt]] as const).map(([id, label, hint, Icon]) => (
                    <li key={id}>
                      <Link href={`/o/${slug}/me/${id}`} className="group flex min-h-12 items-center gap-4 py-3.5 hover:bg-sunk/40">
                        <Icon className="size-5 shrink-0 text-ink-2" strokeWidth={1.75} />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[15px] font-semibold">{label}</span>
                          <span className="block text-sm text-muted">{hint}</span>
                        </span>
                        <ArrowRight className="size-5 text-muted transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </Section>
              {msg ? <p role="status" className="mt-4 text-sm text-muted">{msg}</p> : null}
              {entry.data?.roles.includes("organisation_admin") ? (
                <Note>You hold the officer seats this year group listed you for. Sample officers on the roll are not logins.</Note>
              ) : null}
              <button type="button" onClick={() => void signOut()} className="btn btn-quiet btn-block mt-10 max-w-sm">Sign out</button>
            </div>
          </div>
        ) : null}
      </State>
    </Shell>
  );
}
