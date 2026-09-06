import { getAllTechniques } from "@/lib/mock/techniques";
import { getAllTechniqueIds } from "@/lib/mock/explorer";
import { ClientTechniquePage } from "./client-page";

export function generateStaticParams() {
  const ids = new Set([...getAllTechniques().map((t) => t.id), ...getAllTechniqueIds()]);
  return [...ids].map((id) => ({ id }));
}

export default function TechniquePageWrapper() {
  return <ClientTechniquePage />;
}
