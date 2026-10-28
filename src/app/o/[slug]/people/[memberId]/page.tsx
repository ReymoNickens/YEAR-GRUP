import { PersonPage } from "@/components/hub/community";

export default async function Page({ params }: { params: Promise<{ slug: string; memberId: string }> }) {
  const { slug, memberId } = await params;
  return <PersonPage slug={slug} memberId={memberId} />;
}
