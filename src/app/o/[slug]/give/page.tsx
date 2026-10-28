import { GiveList } from "@/components/hub/give-flow";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <GiveList slug={slug} />;
}
