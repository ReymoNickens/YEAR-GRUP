import { CircleIndex } from "@/components/hub/community";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CircleIndex slug={slug} />;
}
