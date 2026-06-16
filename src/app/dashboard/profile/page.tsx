import type { Metadata } from "next";
import { DojoShell } from "@/components/dashboard/dojo-shell";

export const metadata: Metadata = {
  title: "Profile — Exam Arena",
  description: "Your Exam Arena profile, stats, and achievements.",
  robots: "noindex, nofollow",
};

export default function ProfilePage() {
  return (
    <DojoShell>
      <header>
        <h1 className="text-2xl font-bold uppercase italic tracking-tight text-primary md:text-4xl">
          Profile
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Champion &middot; 12-day streak &middot; Level 04
        </p>
      </header>
    </DojoShell>
  );
}
