"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useEffect, useCallback, useState } from "react";
import gsap from "gsap";
import { LogOut, Zap, Flame, Sun, Moon, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, MOBILE_NAV } from "@/lib/mock/dashboard";
import { useAuthStore } from "@/stores/auth-store";
import { useThemeStore } from "@/stores/theme-store";
import { Walkthrough } from "@/components/dashboard/walkthrough";
import { RatePrompt } from "@/components/dashboard/rate-prompt";

const PRIMARY_NAV: { label: string; href: string }[] = [
  { label: "Arena", href: "/dashboard" },
  { label: "Quests", href: "/dashboard/configure-sprint" },
  { label: "Compete", href: "/dashboard/duel" },
  { label: "Practice", href: "/dashboard/practice" },
  { label: "Analytics", href: "/dashboard/analytics" },
];

const FLYOUT_HREFS = [
  "/dashboard/leaderboard",
  "/dashboard/history",
  "/dashboard/achievements",
  "/dashboard/settings",
  "/dashboard/friends",
  "/dashboard/planner",
  "/dashboard/reports",
  "/dashboard/notifications",
  "/dashboard/help",
  "/dashboard/profile",
];

const NAV_BY_HREF = new Map(NAV_ITEMS.map((item) => [item.href, item]));

export function DojoShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const { theme, toggleTheme } = useThemeStore();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

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

  const visibleItems = PRIMARY_NAV.map((p) => ({ ...NAV_BY_HREF.get(p.href)!, label: p.label }));
  const flyoutItems = FLYOUT_HREFS.map((href) => NAV_BY_HREF.get(href)!).filter(Boolean);
  const anyFlyoutActive = flyoutItems.some((item) => pathname === item.href);
  const avatarInitial = user?.name?.[0]?.toUpperCase() ?? "U";
  const displayName = (user?.name ?? "Operative").toUpperCase();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside
        ref={sidebarRef}
        className="fixed inset-y-0 left-0 z-50 hidden w-[250px] flex-col border-r border-chrome-border bg-chrome px-4 py-7 lg:flex"
      >
        {/* Logo */}
        <div className="mb-12 flex items-center gap-3 pl-1.5">
          <span className="grid size-9 place-items-center rounded bg-primary text-primary-foreground">
            <Flame size={18} />
          </span>
          <h1 className="text-[19px] font-black tracking-[0.1em] leading-tight text-primary">
            EXAM ARENA
          </h1>
        </div>

        {/* Nav */}
        <nav data-sidebar-section className="relative flex flex-col gap-2.5" aria-label="Primary">
          {visibleItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3.5 rounded-[10px] border border-transparent px-4 py-[13px] text-[13.5px] font-bold uppercase tracking-[0.6px] outline-none transition-[background,color,border-color] duration-150 focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "border-primary bg-chrome-active text-primary"
                    : "text-chrome-muted hover:text-chrome-hover",
                )}
              >
                <Icon className="size-[18px] shrink-0" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}

          {/* More + flyout */}
          <div ref={moreRef} className="relative">
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              aria-expanded={moreOpen}
              className={cn(
                "flex w-full items-center gap-3.5 rounded-[10px] border border-transparent px-4 py-[13px] text-[13.5px] font-bold uppercase tracking-[0.6px] outline-none transition-[background,color,border-color] duration-150 focus-visible:ring-2 focus-visible:ring-ring",
                moreOpen || anyFlyoutActive
                  ? "border-primary bg-chrome-active text-primary"
                  : "text-chrome-muted hover:text-chrome-hover",
              )}
            >
              <MoreHorizontal className="size-[18px] shrink-0" aria-hidden="true" />
              More
            </button>

            <div
              className={cn(
                "absolute left-[calc(100%+14px)] top-0 z-50 w-[190px] rounded-[10px] border border-chrome-border bg-chrome-raised p-2 shadow-[0_12px_30px_rgba(0,0,0,0.5)] transition-[opacity,transform,visibility] duration-150",
                moreOpen ? "visible translate-x-0 opacity-100" : "invisible -translate-x-1.5 opacity-0",
              )}
            >
              <span className="absolute -left-1.5 top-[22px] size-3 rotate-45 border-b border-l border-chrome-border bg-chrome-raised" />
              <ul className="flex max-h-[70vh] flex-col overflow-y-auto">
                {flyoutItems.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-[7px] px-3 py-2.5 text-[13.5px] font-semibold tracking-[0.2px] text-chrome-foreground outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring",
                          active
                            ? "bg-chrome-active text-primary"
                            : "hover:bg-chrome-active hover:text-primary",
                        )}
                      >
                        <Icon className="size-4 shrink-0" aria-hidden="true" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </nav>

        {/* Bottom */}
        <div data-sidebar-section className="mt-auto flex flex-col gap-4 pt-4">
          <Link
            href="/dashboard/configure-sprint"
            className="flex items-center justify-center gap-2 rounded-[10px] bg-primary px-4 py-3 text-sm font-bold uppercase tracking-[0.1em] text-primary-foreground outline-none transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Zap className="size-4" aria-hidden="true" />
            START SPRINT
          </Link>

          <div className="flex items-center gap-3 px-1.5">
            <span className="grid size-[34px] shrink-0 place-items-center rounded-full bg-chrome-avatar text-sm font-bold text-white">
              {avatarInitial}
            </span>
            <span className="flex-1 truncate text-[12.5px] font-bold uppercase tracking-[0.5px] text-chrome-foreground/60">
              {displayName}
            </span>
            <button
              type="button"
              onClick={() => { logout(); router.push("/"); }}
              aria-label="Logout"
              className="grid size-11 shrink-0 place-items-center rounded-lg text-chrome-muted outline-none transition-colors hover:bg-white/5 hover:text-chrome-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <LogOut className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>

      <main className="lg:ml-[250px] h-dvh overflow-y-auto overflow-x-hidden pb-24 lg:pb-0 pt-[max(0px,env(safe-area-inset-top))]">
        <div key={pathname} ref={pageRef}>
          {children}
        </div>
      </main>

      {/* Floating theme toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        className="fixed right-4 top-[calc(env(safe-area-inset-top)+1rem)] z-40 grid size-11 place-items-center rounded-full border border-chrome-border bg-chrome text-chrome-muted outline-none shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-colors hover:text-chrome-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        {theme === "dark" ? <Sun className="size-5" aria-hidden="true" /> : <Moon className="size-5" aria-hidden="true" />}
      </button>

      {/* Floating mobile nav */}
      <nav
        ref={mobileNavRef}
        aria-label="Primary mobile"
        className="fixed inset-x-0 bottom-[calc(1rem+max(0px,env(safe-area-inset-bottom)))] z-40 flex justify-center px-5 lg:hidden pointer-events-none"
      >
        <div className="flex items-center gap-1 rounded-full border border-white/[0.08] bg-[#14170F]/90 backdrop-blur-2xl px-2 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] pointer-events-auto">
          {MOBILE_NAV.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center justify-center rounded-full outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-primary/15 text-primary px-4 py-2.5 gap-2"
                    : "text-muted-foreground/50 hover:text-muted-foreground px-3 py-2.5",
                )}
              >
                <Icon className="size-[18px] shrink-0" strokeWidth={active ? 2.4 : 1.8} />
                {active && (
                  <span className="text-[11px] font-bold tracking-wide">{item.label}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
      <Walkthrough />
      <RatePrompt />
    </div>
  );
}
