import { PayScreen } from "@/components/hub/give-flow";

export default async function Page({ params }: { params: Promise<{ slug: string; intentId: string }> }) {
  const { slug, intentId } = await params;
  return <PayScreen slug={slug} intentId={intentId} />;
}
