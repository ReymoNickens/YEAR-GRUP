import { Feed } from "@/components/hub/feed";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <Feed slug={slug} />;
}
