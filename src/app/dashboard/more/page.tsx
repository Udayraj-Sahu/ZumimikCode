"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useCallback, useRef } from "react";
import gsap from "gsap";
import { ChevronLeft, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, MOBILE_NAV } from "@/lib/mock/dashboard";
import { useProfileData } from "@/hooks/queries/use-profile";

const EXCLUDED_HREFS = new Set(MOBILE_NAV.map((n) => n.href));
const FILTERED_ITEMS = NAV_ITEMS.filter((item) => !EXCLUDED_HREFS.has(item.href));

const SIDEBAR_SECTIONS = Object.entries(
  FILTERED_ITEMS.reduce<Record<string, typeof FILTERED_ITEMS>>((acc, item) => {
    const section = item.section ?? "";
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {}),
);

export default function MorePage() {
  const router = useRouter();
  const { data } = useProfileData();
  const profile = data?.profile;

  const headerRef = useCallback((el: HTMLDivElement | null) => {
    if (el) gsap.fromTo(el, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
  }, []);

  const sectionRef = useCallback((el: HTMLDivElement | null) => {
    if (el && !el.dataset.animated) {
      el.dataset.animated = "true";
      const idx = parseInt(el.dataset.sectionIndex ?? "0", 10);
      gsap.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, delay: idx * 0.08, ease: "power2.out" });
    }
  }, []);

  return (
    <div className="pb-10">
      {/* Header */}
      <div ref={headerRef} className="flex items-center gap-2 px-4 pt-5 pb-4 border-b border-border">
        <button
          type="button"
          onClick={() => router.back()}
          className="grid size-8 place-items-center rounded-lg text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Back"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-fluid-xl font-black tracking-tight text-foreground">More</h1>
      </div>

      {/* User card */}
      {profile && (
        <div className="mx-4 mt-5 flex items-center gap-4 rounded-2xl border border-border/40 bg-card p-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary/30 to-primary/10 text-fluid-xl font-black text-primary ring-2 ring-primary/20">
            {profile.initials}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-fluid-base font-bold text-foreground truncate">{profile.name}</p>
            <p className="text-fluid-xs text-muted-foreground/60 truncate">
              {profile.badge} &middot; {profile.level}
            </p>
          </div>
          <Link
            href="/dashboard/profile/edit"
            className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-fluid-xs font-bold uppercase tracking-wider text-primary outline-none transition-colors hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-ring shrink-0"
          >
            <Pencil size={12} />
            Edit
          </Link>
        </div>
      )}

      {/* Nav sections */}
      <div className="mt-5 px-4 flex flex-col gap-5">
        {SIDEBAR_SECTIONS.map(([section, items], sectionIndex) => (
          <div key={section} ref={sectionRef} data-section-index={sectionIndex}>
            <p className="mb-2.5 text-fluid-xs font-bold uppercase tracking-[0.15em] text-muted-foreground/40">
              {section}
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-xl border border-border/40 bg-card px-3 py-3 outline-none transition-all hover:border-border hover:bg-accent/40 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Icon size={18} />
                    </span>
                    <span className="text-fluid-sm font-bold text-foreground/80 leading-tight">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
