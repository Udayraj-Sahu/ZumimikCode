"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Fragment, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { LogOut, Zap, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, MOBILE_NAV } from "@/lib/mock/dashboard";

const SIDEBAR_SECTIONS = Object.entries(
  NAV_ITEMS.reduce<Record<string, typeof NAV_ITEMS>>((acc, item) => {
    const section = item.section ?? "";
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {}),
);

export function DojoShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const sidebarRef = useRef<HTMLElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (sidebarRef.current) {
      const els = sidebarRef.current.querySelectorAll<HTMLElement>("[data-sidebar-section]");
      gsap.fromTo(
        els,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: "power2.out" },
      );
    }
  }, []);

  useEffect(() => {
    if (mobileNavRef.current) {
      gsap.fromTo(
        mobileNavRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: "power2.out", delay: 0.25 },
      );
    }
  }, []);

  const pageRef = useCallback(
    (el: HTMLDivElement | null) => {
      if (el) {
        gsap.fromTo(el, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.15, ease: "power2.out" });
      }
    },
    [],
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside
        ref={sidebarRef}
        className="fixed inset-y-0 left-0 hidden w-[240px] flex-col border-r border-sidebar-border bg-sidebar lg:flex"
      >
        {/* Logo */}
        <div className="px-4 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <span className="grid size-8 place-items-center rounded bg-primary text-primary-foreground">
              <Flame size={16} />
            </span>
            <div>
              <h1 className="text-fluid-lg font-black tracking-[0.1em] leading-tight text-primary">
                EXAM ARENA
              </h1>
              <p className="text-fluid-sm tracking-[0.08em] text-muted-foreground/50">
                Training Ground
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5" aria-label="Primary">
          {SIDEBAR_SECTIONS.map(([section, items], sectionIndex) => (
            <Fragment key={section}>
              {sectionIndex > 0 && (
                <div
                  data-sidebar-section
                  className="my-3 mx-2 border-t border-sidebar-border"
                />
              )}
              <div data-sidebar-section>
                <p className="mb-1.5 px-3 text-fluid-sm font-bold uppercase tracking-[0.15em] text-muted-foreground/40">
                  {section}
                </p>
                <div className="flex flex-col gap-0.5">
                  {items.map((item) => {
                    const active = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "relative flex items-center gap-3 px-3 py-2.5 rounded outline-none transition-all duration-150 focus-visible:ring-2 focus-visible:ring-ring",
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                        )}
                      >
                        {active && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r bg-primary" />
                        )}
                        <Icon size={16} />
                        <span className="text-fluid-base font-bold tracking-[0.08em]">
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </Fragment>
          ))}
        </nav>

        {/* Bottom actions */}
        <div data-sidebar-section className="px-3 pb-4 flex flex-col gap-2 border-t border-sidebar-border pt-3">
          <Link
            href="/dashboard/configure-sprint"
            className="flex items-center justify-center gap-2 py-3 rounded bg-primary text-primary-foreground text-fluid-sm font-bold tracking-[0.1em] transition-all hover:opacity-90 active:scale-95"
          >
            <Zap size={14} />
            START SPRINT
          </Link>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex items-center justify-center gap-2 py-2 rounded text-fluid-sm font-bold tracking-[0.08em] text-muted-foreground/50 outline-none transition-colors hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <LogOut size={12} />
            LOGOUT
          </button>
        </div>
      </aside>

      <main className="lg:ml-[240px] h-dvh overflow-y-auto pb-24 lg:pb-0">
        <div key={pathname} ref={pageRef}>
          {children}
        </div>
      </main>

      <nav
        ref={mobileNavRef}
        aria-label="Primary mobile"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-lg lg:hidden"
      >
        <ul className="mx-auto flex max-w-md items-center justify-around px-2 py-1.5">
          {MOBILE_NAV.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-w-16 flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-wide outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground/60 hover:text-muted-foreground",
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
