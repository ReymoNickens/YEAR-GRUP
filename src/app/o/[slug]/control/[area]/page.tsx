import { ControlScreen } from "@/components/hub/control-screen";

export default async function Page({ params }: { params: Promise<{ slug: string; area: string }> }) {
  const { slug, area } = await params;
  return <ControlScreen slug={slug} area={area} />;
}
