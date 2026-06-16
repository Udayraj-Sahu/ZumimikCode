"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, MOBILE_NAV } from "@/lib/dashboard-data";

export function DojoShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 lg:flex">
        <div className="px-3">
          <div className="flex items-center gap-2">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="w-5 h-5">
              <polygon
                points="12,2 20,7 20,17 12,22 4,17 4,7"
                fill="none"
                stroke="#C8FF5A"
                strokeWidth="1.5"
                opacity="0.6"
              />
              <circle cx="12" cy="12" r="2" fill="#C8FF5A" opacity="0.4" />
            </svg>
            <h1 className="font-mono text-lg font-bold italic tracking-tight text-primary">
              EXAM ARENA
            </h1>
          </div>
          <p className="font-mono text-[10px] tracking-widest text-muted-foreground">
            Training Ground
          </p>
        </div>

        <nav className="mt-10 flex flex-1 flex-col gap-1" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold uppercase tracking-wide outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "border-l-2 border-primary bg-sidebar-accent text-primary"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                )}
              >
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard/configure-sprint"
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold uppercase tracking-widest text-primary-foreground outline-none transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-ring"
          >
            Start Workout
          </Link>
          <button
            type="button"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <LogOut className="size-5" aria-hidden="true" />
            Logout
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 md:px-8 lg:pb-10">{children}</main>
      </div>

      <nav
        aria-label="Primary mobile"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur lg:hidden"
      >
        <ul className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
          {MOBILE_NAV.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                    active ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export { Zap };
