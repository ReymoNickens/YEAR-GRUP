"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { aiAssist, readModule } from "@/lib/hub/api";
import { hubAct } from "@/lib/hub/act";
import { formatGhs } from "@/lib/hub/money";
import { Shell } from "@/components/hub/shell";
import { Back, Button, Cover, Field, Money, Note, SampleTag, State } from "@/components/hub/ui";
import { useHub } from "@/components/hub/use-hub";

const titles: Record<string, string> = {
  directory: "Businesses",
  asks: "Ask the year",
  events: "Events",
  photos: "Photos",
  polls: "Polls",
  welfare: "Welfare",
  mentoring: "Mentoring",
  trivia: "School questions",
  capsules: "Time capsules",
  milestones: "News",
  spotlight: "Spotlight",
  elections: "Elections",
  impact: "For the school",
  store: "Store",
  roll: "Roll call",
  birthdays: "Birthdays",
  inbox: "Messages",
};

export function ModuleScreen({ slug, module }: { slug: string; module: string }) {
  const [q, setQ] = useState("");
  const [nodeId, setNodeId] = useState("");
  const [tick, setTick] = useState(0);
  const { data, error, loading } = useHub(`${module}-${q}-${nodeId}-${tick}`, () =>
    readModule({ data: { slug, module, q, nodeId } }),
  );
  const reload = () => setTick((n) => n + 1);
  const bag = (data ?? {}) as Record<string, unknown>;
  return (
    <Shell slug={slug}>
      <Back href={`/o/${slug}/me`} label="Me" />
      <h1 className="font-display text-4xl">{titles[module] ?? "Year group"}</h1>
      <div className="mt-4">
        <State loading={loading} error={error}>
          {module === "directory" ? <Directory slug={slug} bag={bag} q={q} setQ={setQ} reload={reload} /> : null}
          {module === "asks" ? <Asks slug={slug} bag={bag} reload={reload} /> : null}
          {module === "events" ? <Events slug={slug} bag={bag} reload={reload} /> : null}
          {module === "photos" ? <Photos bag={bag} slug={slug} reload={reload} /> : null}
          {module === "polls" ? <Polls slug={slug} bag={bag} reload={reload} /> : null}
          {module === "welfare" ? <Welfare slug={slug} bag={bag} reload={reload} /> : null}
          {module === "mentoring" ? <Mentors slug={slug} bag={bag} reload={reload} /> : null}
          {module === "trivia" ? <Trivia slug={slug} bag={bag} reload={reload} /> : null}
          {module === "capsules" ? <Capsules slug={slug} bag={bag} reload={reload} /> : null}
          {module === "milestones" ? <Milestones slug={slug} bag={bag} reload={reload} /> : null}
          {module === "spotlight" ? <Spotlight bag={bag} /> : null}
          {module === "elections" ? <Elections slug={slug} bag={bag} reload={reload} /> : null}
          {module === "impact" ? <Impact bag={bag} /> : null}
          {module === "store" ? <Store slug={slug} bag={bag} /> : null}
          {module === "roll" ? <Roll bag={bag} nodeId={nodeId} setNodeId={setNodeId} /> : null}
          {module === "birthdays" ? <Birthdays bag={bag} /> : null}
          {module === "inbox" ? <Inbox bag={bag} /> : null}
        </State>
      </div>
    </Shell>
  );
}

function rows<T>(bag: Record<string, unknown>, key: string) {
  return (Array.isArray(bag[key]) ? bag[key] : []) as T[];
}

function Directory({ slug, bag, q, setQ, reload }: { slug: string; bag: Record<string, unknown>; q: string; setQ: (v: string) => void; reload: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", city: "", contact: "", blurb: "" });
  const list = rows<{ id: string; name: string; category: string; city: string; contact: string; blurb: string; owner: string; sample: boolean; supports: number; mine: boolean }>(bag, "businesses");
  return (
    <div className="space-y-3">
      <Note>A support mark means a classmate says they have used the business. That rule can change when you confirm it.</Note>
      <Field label="Search" value={q} onChange={setQ} />
      {list.map((b) => (
        <article key={b.id} className="rounded-3xl border border-line bg-card p-4">
          <p className="text-sm text-muted">{b.category} · {b.city}</p>
          <h2 className="font-display text-2xl">{b.name}</h2>
          <p className="mt-1">{b.blurb}</p>
          <p className="mt-2 text-sm text-muted">{b.owner} {b.sample ? <SampleTag /> : null} · {b.contact}</p>
          <p className="mt-2 text-sm">{b.supports} support {b.supports === 1 ? "mark" : "marks"}</p>
          <button type="button" className="mt-2 h-10 text-sm text-crimson" onClick={async () => { await hubAct({ data: { type: "support", slug, businessId: b.id } }); reload(); }}>
            {b.mine ? "Remove my mark" : "I have used this"}
          </button>
        </article>
      ))}
      <Button tone="quiet" onClick={() => setOpen(!open)}>{open ? "Close" : "List a business"}</Button>
      {open ? (
        <div className="space-y-3">
          <Field label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} />
          <Field label="Category" value={form.category} onChange={(category) => setForm({ ...form, category })} />
          <Field label="City" value={form.city} onChange={(city) => setForm({ ...form, city })} />
          <Field label="Contact" value={form.contact} onChange={(contact) => setForm({ ...form, contact })} />
          <Field label="A line" value={form.blurb} onChange={(blurb) => setForm({ ...form, blurb })} />
          <Button onClick={async () => { await hubAct({ data: { type: "business", slug, ...form } }); setOpen(false); reload(); }}>Save</Button>
        </div>
      ) : null}
    </div>
  );
}

function Asks({ slug, bag, reload }: { slug: string; bag: Record<string, unknown>; reload: () => void }) {
  const cats = (bag.categories as string[]) ?? [];
  const list = rows<{ id: string; category: string; title: string; body: string; author: string; sample: boolean; replies: { id: string; body: string; author: string; recommended: boolean }[] }>(bag, "asks");
  const [form, setForm] = useState({ category: "business", title: "", body: "" });
  const [reply, setReply] = useState("");
  const [find, setFind] = useState("");
  const [found, setFound] = useState<null | { name: string; profession: string | null; city: string | null; business: string | null; reason: string }[]>(null);
  const [findErr, setFindErr] = useState("");
  async function search() {
    setFindErr("");
    try {
      setFound((await aiAssist({ data: { slug, task: "network_search", query: find } }) as { matches: NonNullable<typeof found> }).matches);
    } catch (e) {
      setFound(null);
      setFindErr(e instanceof Error ? e.message : "The assistant could not search just now.");
    }
  }
  return (
    <div className="space-y-4">
      <Note>The hub keeps the record. The chat stays on WhatsApp.</Note>
      <section className="space-y-2 rounded-3xl border border-line bg-card p-4">
        <h2 className="font-display text-xl">Who in the year group could help?</h2>
        <Field label="What do you need" value={find} onChange={setFind} placeholder="a quantity surveyor in Kumasi" />
        <Button tone="quiet" disabled={find.trim().length < 4} onClick={search}>Look through the profiles</Button>
        <p className="text-xs text-muted">It reads what people chose to put on their profiles, and suggests. It never contacts anyone.</p>
        {findErr ? <p className="text-sm text-crimson">{findErr}</p> : null}
        {found && found.length === 0 ? <p className="text-sm text-muted">No one matches yet. Post it below and the year group will see it.</p> : null}
        {found?.map((m, i) => (
          <p key={i} className="text-sm"><strong>{m.name}</strong> · {[m.profession, m.business, m.city].filter(Boolean).join(" · ")} <span className="text-muted">({m.reason})</span></p>
        ))}
      </section>
      {list.map((a) => (
        <article key={a.id} className="rounded-3xl border border-line bg-card p-4">
          <p className="text-xs tracking-widest text-gold uppercase">{a.category}</p>
          <h2 className="font-display text-2xl">{a.title}</h2>
          <p className="mt-1">{a.body}</p>
          <p className="mt-2 text-sm text-muted">{a.author} {a.sample ? <SampleTag /> : null}</p>
          {a.replies.map((r) => (
            <p key={r.id} className="mt-2 text-sm">{r.author}: {r.body} {r.recommended ? "· recommended" : ""}</p>
          ))}
          <div className="mt-3 flex gap-2">
            <input value={reply} onChange={(e) => setReply(e.target.value)} className="h-12 flex-1 rounded-2xl border border-line px-3" placeholder="Reply" />
            <button type="button" className="h-12 rounded-full bg-crimson px-4 text-on-crimson" onClick={async () => { await hubAct({ data: { type: "reply", slug, askId: a.id, body: reply, recommended: false } }); setReply(""); reload(); }}>Send</button>
          </div>
        </article>
      ))}
      <h2 className="font-display text-2xl">Ask</h2>
      <label className="block text-sm text-muted">Category
        <select className="mt-1 h-12 w-full rounded-2xl border border-line bg-card px-3" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {cats.map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>
      <Field label="Title" value={form.title} onChange={(title) => setForm({ ...form, title })} />
      <Field label="What you need" value={form.body} onChange={(body) => setForm({ ...form, body })} />
      <Button onClick={async () => { await hubAct({ data: { type: "ask", slug, ...form } }); reload(); }}>Post the ask</Button>
    </div>
  );
}

function Events({ slug, bag, reload }: { slug: string; bag: Record<string, unknown>; reload: () => void }) {
  const list = rows<{ id: string; title: string; place: string; startsAt: string; story: string; price: number | null; purposeId: string | null; going: number; mine: string | null }>(bag, "events");
  return (
    <div className="space-y-3">
      <Cover motif="tie" alt="" className="h-44 rounded-3xl" />
      {list.map((e) => (
        <article key={e.id} className="rounded-3xl border border-line bg-card p-4">
          <p className="text-sm text-muted">{new Date(e.startsAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })} · {e.place}</p>
          <h2 className="font-display text-2xl">{e.title}</h2>
          <p className="mt-1">{e.story}</p>
          <p className="mt-2 text-sm">{e.going} going {e.mine ? `· you said ${e.mine}` : ""}</p>
          {e.price && e.purposeId ? (
            <Link className="mt-3 flex h-12 items-center justify-center rounded-full bg-crimson text-on-crimson" href={`/o/${slug}/give/${e.purposeId}`}>Ticket {formatGhs(e.price)}</Link>
          ) : (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {(["going", "maybe", "no"] as const).map((s) => (
                <button key={s} type="button" className="h-12 rounded-full border border-line" onClick={async () => { await hubAct({ data: { type: "rsvp", slug, eventId: e.id, status: s } }); reload(); }}>{s}</button>
              ))}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

function Photos({ bag, slug, reload }: { bag: Record<string, unknown>; slug: string; reload: () => void }) {
  const albums = rows<{ id: string; title: string; year: number; caption: string; motif: string; photos: { id: string; caption: string; motif: string; dataUrl: string | null }[] }>(bag, "albums");
  const [album, setAlbum] = useState(albums[0]?.id ?? "");
  const [err, setErr] = useState("");
  const open = albums.find((a) => a.id === album) ?? albums[0];
  async function onFile(file: File) {
    setErr("");
    const dataUrl = await compress(file);
    try {
      await hubAct({ data: { type: "photo", slug, albumId: open?.id, caption: file.name.replace(/\.[^.]+$/, ""), dataUrl } });
      reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "The photo did not upload.");
    }
  }
  return (
    <div className="space-y-4">
      <Note>Pictures are compressed on this phone before they upload. Faces of the real year group arrive with your own photographs.</Note>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {albums.map((a) => (
          <button key={a.id} type="button" onClick={() => setAlbum(a.id)} className={`w-40 shrink-0 overflow-hidden rounded-3xl text-left ${album === a.id ? "ring-2 ring-gold" : ""}`}>
            <Cover motif={a.motif} alt="" className="h-24" />
            <span className="block bg-card px-3 py-2">
              <span className="block text-xs text-muted">{a.year}</span>
              <span className="font-display text-lg leading-tight">{a.title}</span>
            </span>
          </button>
        ))}
      </div>
      {open ? (
        <div className="space-y-3">
          <h2 className="font-display text-3xl">{open.title}</h2>
          <p className="text-muted">{open.caption}</p>
          {open.photos.map((p) => (
            <figure key={p.id} className="overflow-hidden rounded-3xl border border-line bg-card">
              {p.dataUrl ? <img src={p.dataUrl} alt="" className="h-52 w-full object-cover" /> : <Cover motif={p.motif} alt="" className="h-52" />}
              <figcaption className="p-4">{p.caption}</figcaption>
            </figure>
          ))}
        </div>
      ) : null}
      <label className="flex h-12 items-center justify-center rounded-full bg-crimson text-on-crimson">
        Add a photo
        <input type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) void onFile(f); }} />
      </label>
      {err ? <p className="text-sm text-crimson">{err}</p> : null}
    </div>
  );
}

function compress(file: File) {
  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 900 / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.62));
    };
    img.onerror = () => reject(new Error("That picture could not be read."));
    img.src = URL.createObjectURL(file);
  });
}

function Polls({ slug, bag, reload }: { slug: string; bag: Record<string, unknown>; reload: () => void }) {
  const polls = rows<{ id: string; question: string; closesOn: string; mine: string | null; options: { id: string; label: string; votes: number }[] }>(bag, "polls");
  return (
    <div className="space-y-4">
      {polls.map((p) => (
        <article key={p.id} className="rounded-3xl border border-line bg-card p-4">
          <h2 className="font-display text-2xl">{p.question}</h2>
          <div className="mt-3 space-y-2">
            {p.options.map((o) => (
              <button key={o.id} type="button" disabled={!!p.mine} className="flex h-12 w-full items-center justify-between rounded-2xl border border-line px-4" onClick={async () => { await hubAct({ data: { type: "vote", slug, optionId: o.id } }); reload(); }}>
                <span>{o.label}</span><span className="tabular-nums">{o.votes}</span>
              </button>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function Welfare({ slug, bag, reload }: { slug: string; bag: Record<string, unknown>; reload: () => void }) {
  const list = rows<{ id: string; category: string; body: string; status: string; author: string; mine: boolean }>(bag, "requests");
  const [body, setBody] = useState("");
  return (
    <div className="space-y-3">
      <Note>This record stays off the board and away from the ledger. Any money still goes through an approval.</Note>
      {list.map((w) => (
        <article key={w.id} className="rounded-3xl border border-line bg-card p-4">
          <p className="text-sm text-muted">{w.category} · {w.status} · {w.author}</p>
          <p className="mt-2">{w.body}</p>
        </article>
      ))}
      <Field label="A confidential note" value={body} onChange={setBody} />
      <Button onClick={async () => { await hubAct({ data: { type: "welfare", slug, category: "other", body } }); setBody(""); reload(); }}>Send to the secretary</Button>
    </div>
  );
}

function Mentors({ slug, bag, reload }: { slug: string; bag: Record<string, unknown>; reload: () => void }) {
  const list = rows<{ id: string; field: string; kind: string; note: string; author: string; sample: boolean }>(bag, "offers");
  const [field, setField] = useState("");
  const [note, setNote] = useState("");
  return (
    <div className="space-y-3">
      {list.map((m) => (
        <article key={m.id} className="rounded-3xl border border-line bg-card p-4">
          <p className="text-sm text-gold">{m.kind === "offer" ? "Offering" : "Seeking"} · {m.field}</p>
          <p className="mt-1">{m.note}</p>
          <p className="mt-2 text-sm text-muted">{m.author} {m.sample ? <SampleTag /> : null}</p>
        </article>
      ))}
      <Field label="Field" value={field} onChange={setField} />
      <Field label="Note" value={note} onChange={setNote} />
      <Button onClick={async () => { await hubAct({ data: { type: "mentor", slug, field, kind: "offer", note } }); reload(); }}>Offer</Button>
    </div>
  );
}

function Trivia({ slug, bag, reload }: { slug: string; bag: Record<string, unknown>; reload: () => void }) {
  const questions = rows<{ id: string; prompt: string; choices: string[]; yourChoice: number | null; correct: boolean | null }>(bag, "questions");
  const scores = rows<{ house: string; points: number }>(bag, "scores");
  return (
    <div className="space-y-4">
      {scores.length ? (
        <ul className="rounded-3xl border border-line bg-card p-4 text-sm">
          {scores.map((s) => <li key={s.house} className="flex justify-between"><span>{s.house}</span><span className="tabular-nums">{s.points}</span></li>)}
        </ul>
      ) : null}
      {questions.map((q) => (
        <article key={q.id}>
          <h2 className="font-display text-2xl">{q.prompt}</h2>
          <div className="mt-2 space-y-2">
            {q.choices.map((c, i) => (
              <button key={c} type="button" disabled={q.yourChoice != null} className="h-12 w-full rounded-2xl border border-line bg-card text-left px-4" onClick={async () => { await hubAct({ data: { type: "trivia", slug, questionId: q.id, choice: i } }); reload(); }}>
                {c} {q.yourChoice === i ? (q.correct ? "· right" : "· not this one") : ""}
              </button>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function Capsules({ slug, bag, reload }: { slug: string; bag: Record<string, unknown>; reload: () => void }) {
  const list = rows<{ id: string; title: string; body: string | null; sealed: boolean; until: string; author: string }>(bag, "capsules");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [until, setUntil] = useState("2032-04-08");
  return (
    <div className="space-y-3">
      {list.map((c) => (
        <article key={c.id} className="rounded-3xl border border-line bg-card p-4">
          <p className="text-sm text-muted">{c.author} · {c.sealed ? `Sealed until ${c.until}` : "Open"}</p>
          <h2 className="font-display text-2xl">{c.title}</h2>
          {c.body ? <p className="mt-2">{c.body}</p> : <Note>The words stay shut.</Note>}
        </article>
      ))}
      <Field label="Title" value={title} onChange={setTitle} />
      <Field label="The note" value={body} onChange={setBody} />
      <Field label="Open on" value={until} onChange={setUntil} />
      <Button onClick={async () => { await hubAct({ data: { type: "capsule", slug, title, body, sealsUntil: until } }); reload(); }}>Seal it</Button>
    </div>
  );
}

function Milestones({ slug, bag, reload }: { slug: string; bag: Record<string, unknown>; reload: () => void }) {
  const list = rows<{ id: string; kind: string; body: string; author: string; sample: boolean }>(bag, "items");
  const [body, setBody] = useState("");
  return (
    <div className="space-y-3">
      <Note>Share work or a business. The hub does not ask about private life.</Note>
      {list.map((m) => (
        <article key={m.id} className="rounded-3xl border border-line bg-card p-4">
          <p className="text-sm text-muted">{m.author} {m.sample ? <SampleTag /> : null}</p>
          <p className="mt-1">{m.body}</p>
        </article>
      ))}
      <Field label="Your news" value={body} onChange={setBody} />
      <Button onClick={async () => { await hubAct({ data: { type: "milestone", slug, kind: "work", body } }); setBody(""); reload(); }}>Share</Button>
    </div>
  );
}

function Spotlight({ bag }: { bag: Record<string, unknown> }) {
  const items = rows<{ name: string; full: string; profession: string | null; city: string | null; story: string; sample: boolean }>(bag, "items");
  return (
    <div className="space-y-3">
      {items.map((s) => (
        <article key={s.name} className="rounded-3xl bg-crimson p-5 text-on-crimson">
          <p className="text-xs tracking-widest uppercase text-gold-soft">With consent</p>
          <h2 className="mt-2 font-display text-3xl">{s.name}</h2>
          <p className="mt-3">{s.story}</p>
        </article>
      ))}
    </div>
  );
}

function Elections({ slug, bag, reload }: { slug: string; bag: Record<string, unknown>; reload: () => void }) {
  const elections = rows<{ id: string; role: string; blurb: string; closesOn: string; voted: boolean; nominations: { id: string; statement: string; name: string; votes: number }[] }>(bag, "elections");
  const [statement, setStatement] = useState("");
  return (
    <div className="space-y-4">
      <Note>The ballot is secret. We record that you voted, and separately what was chosen, with nothing joining the two.</Note>
      {elections.map((e) => (
        <article key={e.id} className="space-y-3">
          <h2 className="font-display text-3xl">{e.role}</h2>
          <p>{e.blurb}</p>
          {e.nominations.map((n) => (
            <button key={n.id} type="button" disabled={e.voted} className="w-full rounded-3xl border border-line bg-card p-4 text-left" onClick={async () => { await hubAct({ data: { type: "ballot", slug, nominationId: n.id } }); reload(); }}>
              <span className="font-display text-2xl">{n.name}</span>
              <span className="mt-1 block">{n.statement}</span>
              <span className="mt-2 block text-sm text-muted tabular-nums">{n.votes} votes</span>
            </button>
          ))}
          <Field label="Stand, in one sentence" value={statement} onChange={setStatement} />
          <Button onClick={async () => { await hubAct({ data: { type: "nominate", slug, electionId: e.id, statement } }); reload(); }}>Nominate yourself</Button>
        </article>
      ))}
    </div>
  );
}

function Impact({ bag }: { bag: Record<string, unknown> }) {
  const projects = rows<{ title: string; story: string; net: number }>(bag, "projects");
  return (
    <div className="space-y-3">
      <Cover motif="class" alt="" className="h-48 rounded-3xl" />
      <Note>Figures come from the ledger, not from a separate total.</Note>
      {projects.map((p) => (
        <article key={p.title} className="rounded-3xl border border-line bg-card p-4">
          <h2 className="font-display text-2xl">{p.title}</h2>
          <p className="mt-1">{p.story}</p>
          <p className="mt-3 font-display text-3xl"><Money value={p.net} /></p>
        </article>
      ))}
    </div>
  );
}

function Store({ slug, bag }: { slug: string; bag: Record<string, unknown> }) {
  const router = useRouter();
  const products = rows<{ id: string; name: string; blurb: string; price: number; stock: number; motif: string }>(bag, "products");
  const [err, setErr] = useState("");
  return (
    <div className="space-y-3">
      {products.map((p) => (
        <article key={p.id} className="overflow-hidden rounded-3xl border border-line bg-card">
          <Cover motif={p.motif} alt="" className="h-44" />
          <div className="p-4">
            <h2 className="font-display text-2xl">{p.name}</h2>
            <p className="mt-1">{p.blurb}</p>
            <p className="mt-2 tabular-nums"><Money value={p.price} /> · {p.stock} left</p>
            <div className="mt-3">
              <Button onClick={async () => {
                setErr("");
                try {
                  const res = await hubAct({ data: { type: "buy", slug, productId: p.id } }) as { intentId?: string };
                  if (res.intentId) router.push(`/o/${slug}/pay/${res.intentId}`);
                } catch (e) {
                  setErr(e instanceof Error ? e.message : "Could not start that order.");
                }
              }}>Order</Button>
            </div>
          </div>
        </article>
      ))}
      {err ? <p className="text-sm text-crimson">{err}</p> : null}
    </div>
  );
}

function Roll({ bag, nodeId, setNodeId }: { bag: Record<string, unknown>; nodeId: string; setNodeId: (v: string) => void }) {
  const picks = rows<{ id: string; name: string; level: string }>(bag, "picks");
  const people = rows<{ id: string; name: string; full: string; status: string; sample: boolean }>(bag, "people");
  return (
    <div className="space-y-3">
      <Note>Who is in, and who is still missing from the sheet.</Note>
      <div className="flex gap-2 overflow-x-auto">
        {picks.map((p) => (
          <button key={p.id} type="button" className={`h-12 shrink-0 rounded-full border px-4 ${nodeId === p.id ? "border-crimson bg-gold-soft" : "border-line"}`} onClick={() => setNodeId(p.id)}>{p.name}</button>
        ))}
      </div>
      {!nodeId && typeof bag.missing === "number" ? <p>{bag.missing} names are still on the import sheet.</p> : null}
      <ul className="space-y-2">
        {people.map((p) => (
          <li key={p.id} className="flex items-center justify-between rounded-2xl bg-card px-4 py-3">
            <span>{p.name} <span className="text-sm text-muted">{p.full}</span></span>
            {p.sample ? <SampleTag /> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Birthdays({ bag }: { bag: Record<string, unknown> }) {
  const people = rows<{ id: string; name: string; day: number; sample: boolean; city: string | null }>(bag, "people");
  return (
    <div className="space-y-3">
      <h2 className="font-display text-2xl">{String(bag.month ?? "")}</h2>
      <Note>Only people in your circles, and only if they have not opted out.</Note>
      {people.length === 0 ? <Note>No birthdays in your circles this month.</Note> : null}
      {people.map((p) => (
        <p key={p.id} className="rounded-2xl bg-card px-4 py-3">{p.day} · {p.name} {p.sample ? <SampleTag /> : null}</p>
      ))}
    </div>
  );
}

function Inbox({ bag }: { bag: Record<string, unknown> }) {
  const messages = rows<{ template: string; payload: string; status: string; channel: string }>(bag, "messages");
  return (
    <ul className="space-y-2">
      {messages.length === 0 ? <Note>Nothing in the inbox yet.</Note> : null}
      {messages.map((m, i) => (
        <li key={i} className="rounded-2xl border border-line bg-card p-4 text-sm">
          <p className="text-muted">{m.channel} · {m.status}</p>
          <p>{m.template}</p>
        </li>
      ))}
    </ul>
  );
}

