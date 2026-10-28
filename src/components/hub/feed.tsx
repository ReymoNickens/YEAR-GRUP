"use client";
import { feedData } from "@/lib/hub/api";
import { Shell } from "@/components/hub/shell";
import { Avatar, Back, PageHead, SampleTag, State } from "@/components/hub/ui";
import { useHub } from "@/components/hub/use-hub";
import { timeAgo } from "@/lib/hub/words-money";

export function Feed({ slug }: { slug: string }) {
  const { data, error, loading, reload } = useHub(`feed-${slug}`, () => feedData({ data: slug }));
  return (
    <Shell slug={slug}>
      <Back href={`/o/${slug}/home`} label="Home" />
      <PageHead kicker="Your circles" title="Latest" />
      <State loading={loading} error={error} onRetry={reload} empty={data && data.length === 0 ? "Nothing in your circles yet. Join a circle to see its notes here." : null}>
        <ul className="ruled-list border-b border-line">
          {data?.map((p) => (
            <li key={p.id} className="flex gap-3.5 py-4">
              <Avatar name={p.full} size={40} />
              <div className="min-w-0 flex-1">
                <p className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate">
                    <span className="font-semibold">{p.author}</span>
                    {p.sample ? <SampleTag /> : null}
                    <span className="text-muted"> in {p.circle}</span>
                  </span>
                  <span className="shrink-0 font-mono text-[11px] text-muted">{timeAgo(p.at)}</span>
                </p>
                <p className="mt-1 text-[15px] leading-relaxed">{p.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </State>
    </Shell>
  );
}
