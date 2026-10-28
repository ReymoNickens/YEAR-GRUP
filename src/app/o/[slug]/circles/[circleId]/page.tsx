import { CirclePage } from "@/components/hub/community";

export default async function Page({ params }: { params: Promise<{ slug: string; circleId: string }> }) {
  const { slug, circleId } = await params;
  return <CirclePage slug={slug} circleId={circleId} />;
}
