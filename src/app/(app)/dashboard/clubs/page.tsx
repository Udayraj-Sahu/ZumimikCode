"use client";

import { useState, useRef, useEffect } from "react";
import { Users, Plus, Crown, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEntranceAnimations } from "@/lib/use-entrance-animations";
import { usePageMeta } from "@/hooks/use-page-meta";
import { PageContainer } from "@/components/ui/page-container";
import { MOCK_CLUBS, CLUB_FILTERS, type ClubFilter } from "@/lib/mock/clubs";
import type { Club } from "@/lib/types/clubs";
import { GLASS_BG, GLASS_BORDER } from "@/lib/theme-tokens";

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
  const { headerRef, animateSection, staggerIn } = useEntranceAnimations();

  useEffect(() => {
    if (listRef.current) {
      const items = listRef.current.querySelectorAll<HTMLElement>("[data-club-item]");
      staggerIn(items, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: "power2.out" });
    }
  }, [tab, activeFilter, staggerIn]);

  const filteredClubs = MOCK_CLUBS.filter((club) => {
    if (tab === "yours" && !club.isJoined) return false;
    if (activeFilter === "All") return true;
    if (activeFilter === "Free") return !club.isPremium;
    if (activeFilter === "Premium") return club.isPremium;
    return club.tags.some((t) => t.toLowerCase() === activeFilter.toLowerCase());
  });

  return (
    <PageContainer>
      <div className="mx-auto w-full md:max-w-3xl">
      <div ref={headerRef} className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm px-4 py-1.5 mb-3 max-[359px]:px-3">
          <Users size={12} className="text-primary" />
          <span className="text-micro font-semibold tracking-[0.22em] text-primary/80">CLUBS</span>
        </div>
        <p className="text-[12px] text-muted-foreground/45 font-normal">Find and join study communities</p>
      </div>

      <div ref={animateSection} data-section-index="0" className="mt-5 flex gap-1 p-1 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        {(["find", "yours"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-2 rounded-xl text-[12px] font-bold transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring whitespace-nowrap",
              tab === t ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground/50 hover:text-foreground",
            )}
          >
            {t === "find" ? "Find Clubs" : "Your Clubs"}
          </button>
        ))}
      </div>

      <div ref={animateSection} data-section-index="1" className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-thin max-[359px]:gap-1.5">
        {CLUB_FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setActiveFilter(f)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-bold uppercase tracking-wider whitespace-nowrap outline-none transition-all border backdrop-blur-xl focus-visible:ring-2 focus-visible:ring-ring min-h-[32px]",
              activeFilter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "text-foreground/80 border-white/[0.06] bg-white/[0.04] hover:bg-white/[0.08]",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div ref={animateSection} data-section-index="2" className="mt-5">
        <div ref={listRef} className="flex flex-col gap-3 md:grid md:grid-cols-2 md:items-stretch md:gap-5 max-[359px]:gap-1.5">
          {filteredClubs.length === 0 && (
            <div className="py-14 text-center md:col-span-2 max-[359px]:py-10">
              <Users size={28} className="mx-auto text-muted-foreground/20 mb-2" />
              <p className="text-[12px] text-muted-foreground/60">No clubs found</p>
              <p className="text-micro text-muted-foreground/40 mt-1">Try a different filter</p>
            </div>
          )}

          {filteredClubs.map((club) => (
            <ClubCard key={club.id} club={club} />
          ))}
        </div>
      </div>

      <button
        type="button"
        aria-label="Create club"
        className="fixed right-5 bottom-20 z-40 grid size-14 place-items-center rounded-full bg-cta text-[var(--bg)] shadow-lg shadow-primary/30 outline-none transition-all hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring max-[359px]:right-4"
      >
        <Plus size={22} strokeWidth={2.5} />
      </button>
      </div>
    </PageContainer>
  );
}

function ClubCard({ club }: { club: Club }) {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={cardRef}
      data-club-item
      className="flex items-center gap-3.5 rounded-3xl border border-white/[0.06] backdrop-blur-xl p-4 outline-none transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring max-[359px]:gap-2.5 max-[359px]:p-3"
      style={{ backgroundColor: GLASS_BG, borderColor: GLASS_BORDER }}
    >
      <img
        src={club.coverUrl}
        alt={club.name}
        loading="lazy"
        decoding="async"
        className="w-[52px] h-[70px] shrink-0 rounded-xl object-cover border border-white/[0.06]"
      />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-muted-foreground/50 truncate">
          {club.moderator.name} moderates
        </p>
        <p className="text-[12px] font-bold text-foreground truncate leading-tight mt-0.5">
          {club.name}
        </p>
        <div className="flex items-center gap-2.5 mt-2 max-[359px]:gap-1.5">
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground/60 whitespace-nowrap">
            <Users size={10} /> {formatMembers(club.memberCount)}
          </span>
          <span className="text-[11px] text-muted-foreground/40 whitespace-nowrap">
            {club.lastActivity}
          </span>
          {club.isPremium && (
            <span className="flex items-center gap-0.5 text-micro text-chart-4 font-bold whitespace-nowrap">
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
