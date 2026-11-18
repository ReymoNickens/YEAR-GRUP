import { MeDetails } from "@/components/hub/me-details";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <MeDetails slug={slug} />;
}
