import { RouteRedirect } from "@/components/dashboard/route-redirect";

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default async function LegacyTechniqueRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RouteRedirect to={`/learn/technique/${id}`} />;
}