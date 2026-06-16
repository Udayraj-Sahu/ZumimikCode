import type { Metadata } from "next";
import { DashboardShell } from "./dashboard-shell";

export const metadata: Metadata = {
  title: "Dashboard — Exam Arena",
  description: "Track your performance, mastery, and training progress in Exam Arena.",
  robots: "noindex, nofollow",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
