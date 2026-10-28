import { PeopleIndex } from "@/components/hub/community";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PeopleIndex slug={slug} />;
}
