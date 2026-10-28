import { MeScreen } from "@/components/hub/me-screen";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <MeScreen slug={slug} />;
}
