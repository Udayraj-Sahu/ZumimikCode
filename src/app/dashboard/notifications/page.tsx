"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import gsap from "gsap";
import { Bell, BellDot, Zap, Award, Swords, Info, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/queries/use-notifications";
import type { NotificationItem } from "@/lib/types/notifications";

const TYPE_ICON: Record<NotificationItem["type"], typeof Bell> = {
  sprint_reminder: Zap,
  achievement: Award,
  challenge: Swords,
  system: Info,
};

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const { data: notifications, isLoading, error } = useNotifications();
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
    if (listRef.current && notifications && notifications.length > 0) {
      const items = listRef.current.querySelectorAll<HTMLElement>("[data-notification-item]");
      if (items.length) {
        gsap.fromTo(items, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.06, ease: "power2.out" });
      }
    }
  }, [notifications, filter]);

  const filtered = notifications?.filter((n) => filter === "all" || !n.read) ?? [];
  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  return (
    <div className="px-4 sm:px-6 pt-6 pb-10">
      {/* Header */}
      <div ref={headerRef}>
        <p className="text-fluid-xs font-semibold tracking-[0.15em] text-muted-foreground/60">EXAM ARENA</p>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-fluid-2xl font-black tracking-tight text-foreground">Notifications</h1>
            <p className="text-fluid-sm text-muted-foreground/60">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-fluid-xs font-bold uppercase tracking-wider text-primary outline-none transition-colors hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <CheckCheck size={14} />
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div ref={animateSection} data-section-index="0" className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={cn(
            "rounded-lg px-4 py-2 text-fluid-xs font-bold uppercase tracking-wider outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring",
            filter === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground",
          )}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setFilter("unread")}
          className={cn(
            "rounded-lg px-4 py-2 text-fluid-xs font-bold uppercase tracking-wider outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring",
            filter === "unread"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground",
          )}
        >
          Unread {unreadCount > 0 && <span className="ml-1 text-primary">({unreadCount})</span>}
        </button>
      </div>

      {/* Content */}
      <div ref={animateSection} data-section-index="1" className="mt-4">
        {isLoading && (
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-card" />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-fluid-sm font-semibold text-destructive">Failed to load notifications</p>
            <p className="mt-1 text-fluid-xs text-muted-foreground/60">{error instanceof Error ? error.message : "Something went wrong"}</p>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="py-14 text-center">
            <Bell size={32} className="mx-auto text-muted-foreground/20 mb-3" />
            <p className="text-fluid-sm text-muted-foreground/60">
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </p>
          </div>
        )}

        {filtered.length > 0 && (
          <div ref={listRef} className="rounded-xl border border-border/40 bg-card divide-y divide-border/40 overflow-hidden">
            {filtered.map((n) => {
              const Icon = TYPE_ICON[n.type];
              return (
                <div
                  key={n.id}
                  data-notification-item
                  className="flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-accent/20"
                >
                  <div className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-lg mt-0.5",
                    n.read ? "bg-muted" : "bg-primary/10",
                  )}>
                    <Icon size={16} className={n.read ? "text-muted-foreground/40" : "text-primary"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {!n.read && <span className="size-2 shrink-0 rounded-full bg-primary" />}
                      <p className={cn(
                        "text-fluid-sm font-semibold truncate",
                        n.read ? "text-foreground/60" : "text-foreground",
                      )}>
                        {n.title}
                      </p>
                    </div>
                    <p className={cn(
                      "text-fluid-xs mt-0.5 leading-relaxed",
                      n.read ? "text-muted-foreground/40" : "text-muted-foreground/60",
                    )}>
                      {n.message}
                    </p>
                    <p className="text-fluid-xs text-muted-foreground/30 mt-1">{n.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
