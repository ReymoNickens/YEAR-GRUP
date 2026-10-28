import { HomeScreen } from "@/components/hub/home-screen";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <HomeScreen slug={slug} />;
}
