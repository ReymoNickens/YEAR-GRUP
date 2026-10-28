import { ModuleScreen } from "@/components/hub/module-screen";

export default async function Page({ params }: { params: Promise<{ slug: string; module: string }> }) {
  const { slug, module } = await params;
  return <ModuleScreen slug={slug} module={module} />;
}
