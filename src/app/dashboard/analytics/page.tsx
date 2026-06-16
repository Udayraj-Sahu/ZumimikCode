import type { Metadata } from "next";
import { DojoShell } from "@/components/dashboard/dojo-shell";

export const metadata: Metadata = {
  title: "Analytics — Exam Arena",
  description: "Deep-dive performance metrics from your training sessions.",
  robots: "noindex, nofollow",
};

export default function AnalyticsPage() {
  return (
    <DojoShell>
      <header>
        <h1 className="text-2xl font-bold uppercase italic tracking-tight text-primary md:text-4xl">
          Analytics
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Deep-dive performance metrics are syncing from your last 47 sessions.
        </p>
      </header>
    </DojoShell>
  );
}
