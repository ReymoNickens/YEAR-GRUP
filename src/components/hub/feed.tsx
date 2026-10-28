"use client";
import { feedData } from "@/lib/hub/api";
import { Shell } from "@/components/hub/shell";
import { Back, SampleTag, State } from "@/components/hub/ui";
import { useHub } from "@/components/hub/use-hub";

export function Feed({ slug }: { slug: string }) {
  const { data, error, loading, reload } = useHub(`feed-${slug}`, () => feedData({ data: slug }));
  return (
    <Shell slug={slug}>
      <Back href={`/o/${slug}/home`} label="Home" />
      <h1 className="font-display text-4xl">Latest</h1>
      <State loading={loading} error={error} onRetry={reload} empty={data && data.length === 0 ? "Nothing in your circles yet. Join a circle to see its posts here." : null}>
        <ul className="mt-4 space-y-3">
          {data?.map((p) => (
            <li key={p.id} className="rounded-3xl border border-line bg-card p-4">
              <p className="text-sm text-muted">{p.circle} · {p.author} {p.sample ? <SampleTag /> : null}</p>
              <p className="mt-2">{p.body}</p>
            </li>
          ))}
        </ul>
      </State>
    </Shell>
  );
}
