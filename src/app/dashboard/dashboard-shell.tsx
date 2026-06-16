"use client";

import { DojoShell } from "@/components/dashboard/dojo-shell";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return <DojoShell>{children}</DojoShell>;
}
