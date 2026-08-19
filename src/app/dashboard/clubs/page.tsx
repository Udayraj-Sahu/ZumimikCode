"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import gsap from "gsap";
import { Search, Users, Plus, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePageMeta } from "@/hooks/use-page-meta";
import { MOCK_CLUBS, CLUB_FILTERS, type ClubFilter } from "@/lib/mock/clubs";
import type { Club } from "@/lib/types/clubs";

type Tab = "find" | "yours";

function formatMembers(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

export default function ClubsPage() {
  usePageMeta("Clubs — Exam Arena");
  const [tab, setTab] = useState<Tab>("find");
  const [activeFilter, setActiveFilter] = useState<ClubFilter>("All");
  const listRef = useRef<HTMLDivElement>(null);

  const headerRef = useCallback((el: HTMLDivElement | null) => {
    if (el) gsap.fromTo(el, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
  }, []);

  const animateSection = useCallback((el: HTMLDivElement | null) => {
    if (el && !el.dataset.animated) {
      el.dataset.animated = "true";
      const idx = parseInt(el.dataset.sectionIndex ?? "0", 10);
      gsap.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, delay: idx * 0.08, ease: "power2.out" });
    }
  }, []);

  useEffect(() => {
    if (listRef.current) {
      const items = listRef.current.querySelectorAll<HTMLElement>("[data-club-item]");
      if (items.length) {
        gsap.fromTo(items, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: "power2.out" });
      }
    }
  }, [tab, activeFilter]);

  const filteredClubs = MOCK_CLUBS.filter((club) => {
    if (tab === "yours" && !club.isJoined) return false;
    if (activeFilter === "All") return true;
    if (activeFilter === "Free") return !club.isPremium;
    if (activeFilter === "Premium") return club.isPremium;
    return club.tags.some((t) => t.toLowerCase() === activeFilter.toLowerCase());
  });

  return (
    <div className="px-4 sm:px-6 pt-6 pb-24">
      <div ref={headerRef} className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold tracking-[0.15em] text-primary">EXAM ARENA</p>
          <h1 className="text-fluid-2xl font-black tracking-tight text-foreground mt-1">Clubs</h1>
        </div>
        <button
          type="button"
          className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Search size={18} />
        </button>
      </div>

      <div ref={animateSection} data-section-index="0" className="mt-5 flex border-b border-border/60">
        {(["find", "yours"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 pb-3 text-fluid-sm font-bold transition-colors outline-none relative focus-visible:ring-2 focus-visible:ring-ring",
              tab === t ? "text-foreground" : "text-muted-foreground/50",
            )}
          >
            {t === "find" ? "Find Clubs" : "Your Clubs"}
            {tab === t && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-foreground" />
            )}
          </button>
        ))}
      </div>

      <div ref={animateSection} data-section-index="1" className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {CLUB_FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setActiveFilter(f)}
            className={cn(
              "rounded-full px-3.5 py-2 text-fluid-xs font-semibold whitespace-nowrap outline-none transition-all border focus-visible:ring-2 focus-visible:ring-ring",
              activeFilter === f
                ? "bg-foreground text-background border-foreground"
                : "bg-muted text-foreground/80 border-border/40 hover:bg-accent",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div ref={animateSection} data-section-index="2" className="mt-5">
        <div ref={listRef} className="flex flex-col gap-3">
          {filteredClubs.length === 0 && (
            <div className="py-14 text-center">
              <Users size={28} className="mx-auto text-muted-foreground/20 mb-2" />
              <p className="text-fluid-sm text-muted-foreground/60">No clubs found</p>
              <p className="text-fluid-xs text-muted-foreground/40 mt-1">Try a different filter</p>
            </div>
          )}

          {filteredClubs.map((club) => (
            <ClubCard key={club.id} club={club} />
          ))}
        </div>
      </div>

      <button
        type="button"
        className="fixed right-5 bottom-20 z-40 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 outline-none transition-all hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Plus size={22} strokeWidth={2.5} />
      </button>
    </div>
  );
}

function ClubCard({ club }: { club: Club }) {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={cardRef}
      data-club-item
      className="flex items-center gap-3.5 rounded-2xl border border-border/60 bg-card p-4 outline-none transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
    >
      <img
        src={club.coverUrl}
        alt={club.name}
        className="w-[52px] h-[70px] shrink-0 rounded-lg object-cover border border-border/40"
      />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-muted-foreground/50 truncate">
          {club.moderator.name} moderates
        </p>
        <p className="text-fluid-sm font-bold text-foreground truncate leading-tight mt-0.5">
          {club.name}
        </p>
        <div className="flex items-center gap-2.5 mt-2">
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
            <Users size={10} /> {formatMembers(club.memberCount)}
          </span>
          <span className="text-[11px] text-muted-foreground/40">
            {club.lastActivity}
          </span>
          {club.isPremium && (
            <span className="flex items-center gap-0.5 text-[10px] text-chart-4 font-bold">
              <Crown size={9} /> Pro
            </span>
          )}
        </div>
      </div>
      <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-black text-primary">
        {club.moderator.initials}
      </div>
    </div>
  );
}
