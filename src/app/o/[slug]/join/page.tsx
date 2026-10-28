import { JoinFlow } from "@/components/hub/join-flow";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <JoinFlow slug={slug} />;
}
