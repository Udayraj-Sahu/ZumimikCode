"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { Clock, Zap, Award, ChevronRight, Check, X, Filter, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHistory } from "@/hooks/queries/use-history";
import { TOPICS_FILTER, DIFFICULTY_FILTER } from "@/lib/mock/history";
import type { HistoryEntry } from "@/lib/types/history";
import { usePageMeta } from "@/hooks/use-page-meta";

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function HistoryRow({
  entry, index, onSelect,
}: {
  entry: HistoryEntry; index: number; onSelect: (e: HistoryEntry) => void;
}) {
  return (
    <button
      type="button"
      data-history-row
      onClick={() => onSelect(entry)}
      className="flex w-full items-center gap-3 px-4 py-3 text-left outline-none transition-colors hover:bg-accent/20 active:bg-accent/30 focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
    >
      <div className={cn(
        "grid size-9 shrink-0 place-items-center rounded-lg",
        entry.accuracy >= 80 ? "bg-primary/10" : entry.accuracy >= 50 ? "bg-chart-3/10" : "bg-destructive/10",
      )}>
        <span className={cn(
          "text-fluid-xs font-black font-mono",
          entry.accuracy >= 80 ? "text-primary" : entry.accuracy >= 50 ? "text-chart-3" : "text-destructive",
        )}>
          {entry.accuracy}%
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-fluid-sm font-semibold text-foreground/80 truncate">{entry.topicLabel}</p>
        <div className="flex items-center gap-2 text-fluid-xs text-muted-foreground/40 mt-0.5">
          <span>{entry.difficulty}</span>
          <span>&middot;</span>
          <span>{entry.score}/{entry.total}</span>
          <span>&middot;</span>
          <span>+{entry.xpEarned} XP</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-fluid-xs font-mono text-muted-foreground/40">{formatTime(entry.totalTimeSpent)}</p>
        <p className="text-fluid-xs text-muted-foreground/30 mt-0.5">{formatDate(entry.completedAt)}</p>
      </div>
      <ChevronRight size={14} className="text-muted-foreground/20 shrink-0" />
    </button>
  );
}

export default function HistoryPage() {
  usePageMeta("Sprint History — Exam Arena");
  const router = useRouter();
  const { data: entries, isLoading, error } = useHistory();
  const [topicFilter, setTopicFilter] = useState("all");
  const [diffFilter, setDiffFilter] = useState("all");
  const [sortAsc, setSortAsc] = useState(false);
  const [selected, setSelected] = useState<HistoryEntry | null>(null);
  const [page, setPage] = useState(0);
  const perPage = 10;
  const listRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);

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
    if (listRef.current && entries && entries.length > 0) {
      const rows = listRef.current.querySelectorAll<HTMLElement>("[data-history-row]");
      if (rows.length) {
        gsap.fromTo(rows, { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.3, stagger: 0.04, ease: "power2.out" });
      }
    }
  }, [entries, topicFilter, diffFilter, sortAsc, page]);

  useEffect(() => {
    if (detailRef.current && selected) {
      gsap.fromTo(detailRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
    }
  }, [selected]);

  const filtered = (entries ?? []).filter((e) => {
    if (topicFilter !== "all" && e.topic !== topicFilter) return false;
    if (diffFilter !== "all" && e.difficulty !== diffFilter) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const da = new Date(a.completedAt).getTime();
    const db = new Date(b.completedAt).getTime();
    return sortAsc ? da - db : db - da;
  });

  const totalPages = Math.ceil(sorted.length / perPage);
  const paged = sorted.slice(page * perPage, (page + 1) * perPage);

  return (
    <div className="px-4 sm:px-6 pt-6 pb-10">
      <div ref={headerRef}>
        <p className="text-fluid-xs font-semibold tracking-[0.15em] text-muted-foreground/60">EXAM ARENA</p>
        <h1 className="text-fluid-2xl font-black tracking-tight text-foreground">Sprint History</h1>
        <p className="text-fluid-sm text-muted-foreground/60">Review your past sprint performances</p>
      </div>

      {/* Filters */}
      <div ref={animateSection} data-section-index="0" className="mt-5 flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-2.5 min-h-[44px]">
          <Filter size={12} className="text-muted-foreground/40" />
          <select
            value={topicFilter}
            onChange={(e) => { setTopicFilter(e.target.value); setPage(0); }}
            className="bg-transparent text-fluid-xs font-bold uppercase tracking-wider text-foreground outline-none appearance-none cursor-pointer"
          >
            {TOPICS_FILTER.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-1">
          {DIFFICULTY_FILTER.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => { setDiffFilter(d.id); setPage(0); }}
              className={cn(
                "rounded-lg px-3 py-1.5 text-fluid-xs font-bold uppercase tracking-wider outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring",
                diffFilter === d.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setSortAsc(!sortAsc)}
          className="ml-auto flex items-center gap-1 rounded-lg bg-muted px-3 py-2.5 text-fluid-xs font-bold uppercase tracking-wider text-muted-foreground outline-none hover:text-foreground active:text-foreground focus-visible:ring-2 focus-visible:ring-ring min-h-[44px]"
        >
          <ArrowUpDown size={12} />
          {sortAsc ? "Oldest" : "Newest"}
        </button>
      </div>

      {/* Content */}
      <div ref={animateSection} data-section-index="1" className="mt-4">
        {selected && (
          <div ref={detailRef} className="mb-4 rounded-xl border border-border/40 bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-fluid-sm font-bold text-foreground/80">{selected.topicLabel}</p>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-fluid-xs text-muted-foreground/40 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring rounded px-1"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center mb-3">
              <div className="rounded-lg bg-muted p-2">
                <p className="text-fluid-xs text-muted-foreground/40">Score</p>
                <p className="text-fluid-lg font-black text-foreground">{selected.score}/{selected.total}</p>
              </div>
              <div className="rounded-lg bg-muted p-2">
                <p className="text-fluid-xs text-muted-foreground/40">Accuracy</p>
                <p className={cn(
                  "text-fluid-lg font-black",
                  selected.accuracy >= 80 ? "text-primary" : selected.accuracy >= 50 ? "text-chart-3" : "text-destructive",
                )}>
                  {selected.accuracy}%
                </p>
              </div>
              <div className="rounded-lg bg-muted p-2">
                <p className="text-fluid-xs text-muted-foreground/40">XP</p>
                <p className="text-fluid-lg font-black text-chart-2">+{selected.xpEarned}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-fluid-xs text-muted-foreground/40">
              <span>{selected.difficulty}</span>
              <span>{formatTime(selected.totalTimeSpent)}</span>
              <span>{formatDate(selected.completedAt)}</span>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="animate-pulse space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-card" />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-fluid-sm font-semibold text-destructive">Failed to load history</p>
          </div>
        )}

        {sorted.length === 0 && (
          <div className="py-14 text-center">
            <Award size={32} className="mx-auto text-muted-foreground/20 mb-3" />
            <p className="text-fluid-sm text-muted-foreground/60">No sprint history yet. Complete a sprint to see it here!</p>
          </div>
        )}

        {sorted.length > 0 && (
          <div ref={listRef} className="rounded-xl border border-border/40 bg-card divide-y divide-border/40 overflow-hidden">
            {paged.map((entry, i) => (
              <HistoryRow key={entry.id} entry={entry} index={i} onSelect={setSelected} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPage(i)}
                className={cn(
                  "min-w-[44px] min-h-[44px] rounded-lg text-fluid-xs font-bold font-mono outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring",
                  page === i ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
