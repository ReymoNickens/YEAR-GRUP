import { DuesScreen } from "@/components/hub/dues-screen";

export const metadata = { title: "Your dues" };

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <DuesScreen slug={slug} />;
}
