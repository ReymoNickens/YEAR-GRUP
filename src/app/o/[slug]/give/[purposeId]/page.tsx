import { GivePurpose } from "@/components/hub/give-flow";

export default async function Page({ params }: { params: Promise<{ slug: string; purposeId: string }> }) {
  const { slug, purposeId } = await params;
  return <GivePurpose slug={slug} purposeId={purposeId} />;
}
