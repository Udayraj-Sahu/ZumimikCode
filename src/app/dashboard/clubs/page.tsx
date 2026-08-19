"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import gsap from "gsap";
import { Search, Users, Plus, Crown, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePageMeta } from "@/hooks/use-page-meta";
import { MOCK_CLUBS, CLUB_FILTERS, type ClubFilter } from "@/lib/mock/clubs";
import type { Club } from "@/lib/types/clubs";

const GLASS_BG = "rgba(255,255,255,0.04)";
const GLASS_BORDER = "rgba(255,255,255,0.08)";

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
    <div className="min-h-screen px-5 pt-6 pb-6">
      <div ref={headerRef}>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm px-4 py-1.5 mb-3">
          <Users size={12} className="text-primary" />
          <span className="text-[10px] font-semibold tracking-[0.22em] text-primary/80">CLUBS</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] text-muted-foreground/45 font-normal">Find and join study communities</p>
          </div>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full border border-white/[0.06] bg-white/[0.04] backdrop-blur-xl text-muted-foreground outline-none transition-colors hover:bg-white/[0.08] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Search size={18} />
          </button>
        </div>
      </div>

      <div ref={animateSection} data-section-index="0" className="mt-5 flex gap-2 p-1 rounded-3xl border border-white/[0.06] bg-white/[0.02]">
        {(["find", "yours"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-2.5 rounded-2xl text-[12px] font-bold transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring",
              tab === t ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground/50 hover:text-foreground",
            )}
          >
            {t === "find" ? "Find Clubs" : "Your Clubs"}
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
              "rounded-full px-3.5 py-2 text-[10px] font-semibold whitespace-nowrap outline-none transition-all border focus-visible:ring-2 focus-visible:ring-ring",
              activeFilter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "text-foreground/80 border-white/[0.06] bg-white/[0.04] backdrop-blur-xl hover:bg-white/[0.08]",
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
              <p className="text-[12px] text-muted-foreground/60">No clubs found</p>
              <p className="text-[10px] text-muted-foreground/40 mt-1">Try a different filter</p>
            </div>
          )}

          {filteredClubs.map((club) => (
            <ClubCard key={club.id} club={club} />
          ))}
        </div>
      </div>

      <button
        type="button"
        className="fixed right-5 bottom-20 z-40 grid size-14 place-items-center rounded-full bg-gradient-to-r from-[#C7F252] to-[#A8D43A] text-[#0A0C0A] shadow-lg shadow-primary/30 outline-none transition-all hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring"
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
      className="flex items-center gap-3.5 rounded-3xl border border-white/[0.06] backdrop-blur-xl p-4 outline-none transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
      style={{ backgroundColor: GLASS_BG, borderColor: GLASS_BORDER }}
    >
      <img
        src={club.coverUrl}
        alt={club.name}
        className="w-[52px] h-[70px] shrink-0 rounded-xl object-cover border border-white/[0.06]"
      />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-muted-foreground/50 truncate">
          {club.moderator.name} moderates
        </p>
        <p className="text-[12px] font-bold text-foreground truncate leading-tight mt-0.5">
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
      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-[11px] font-black text-primary">
        {club.moderator.initials}
      </div>
    </div>
  );
}
