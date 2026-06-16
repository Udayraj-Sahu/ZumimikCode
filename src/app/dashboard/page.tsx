"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Zap, Brain, MoreHorizontal, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { DojoShell } from "@/components/dashboard/dojo-shell";
import { CognitiveRadar } from "@/components/dashboard/cognitive-radar";
import { getDashboardStats, getTopicMastery, getRadarAxes } from "@/services/dashboard";
import type { Stat, Topic, RadarAxis } from "@/lib/types/dashboard";

export default function DashboardPage() {
  const [stats, setStats] = useState<Stat[] | null>(null);
  const [topics, setTopics] = useState<Topic[] | null>(null);
  const [radarAxes, setRadarAxes] = useState<RadarAxis[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [s, t, r] = await Promise.all([
          getDashboardStats(),
          getTopicMastery(),
          getRadarAxes(),
        ]);
        if (cancelled) return;
        setStats(s);
        setTopics(t);
        setRadarAxes(r);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load dashboard data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <DojoShell>
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-balance text-2xl font-bold tracking-tight md:text-4xl">
            Welcome back,{" "}
            <span className="italic text-primary">Champion</span>
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <Zap className="size-4 text-primary" aria-hidden="true" />
            12-Day Streak Active
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Notifications"
            className="grid size-10 place-items-center rounded-xl bg-card outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Bell className="size-5 text-muted-foreground" aria-hidden="true" />
          </button>
          <span
            aria-hidden="true"
            className="grid size-10 place-items-center rounded-xl bg-secondary text-secondary-foreground"
          >
            <Brain className="size-5" />
          </span>
        </div>
      </header>

      {error ? (
        <div className="mt-8 flex flex-col items-center gap-4 rounded-3xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="text-sm font-semibold text-destructive">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-primary-foreground outline-none transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-ring"
          >
            Retry
          </button>
        </div>
      ) : loading ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl bg-card p-4">
                  <div className="h-3 w-20 rounded bg-muted" />
                  <div className="mt-4 h-8 w-16 rounded bg-muted" />
                </div>
              ))}
            </div>
            <div className="animate-pulse rounded-3xl border border-border bg-card p-6 md:p-8">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="mt-4 h-8 w-72 rounded bg-muted" />
              <div className="mt-3 h-4 w-56 rounded bg-muted" />
              <div className="mt-6 h-10 w-36 rounded-xl bg-muted" />
            </div>
            <div className="animate-pulse rounded-3xl bg-card p-6">
              <div className="h-5 w-28 rounded bg-muted" />
              <div className="mt-6 flex flex-col gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="h-3 w-32 rounded bg-muted" />
                    <div className="h-2 w-full rounded-full bg-muted" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <aside className="flex flex-col gap-4">
            <div className="animate-pulse rounded-3xl bg-card p-6">
              <div className="mx-auto h-3 w-28 rounded bg-muted" />
              <div className="mx-auto mt-2 h-5 w-36 rounded bg-muted" />
              <div className="mt-4 flex items-center justify-center">
                <div className="size-52 rounded-full bg-muted" />
              </div>
            </div>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-card px-5 py-4">
                <div className="h-4 w-28 rounded bg-muted" />
              </div>
            ))}
          </aside>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-6">
            <section aria-label="Key stats" className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {(stats ?? []).map((s) => (
                <div key={s.label} className="rounded-2xl bg-card p-4">
                  <p className="text-[10px] font-semibold uppercase leading-tight tracking-widest text-muted-foreground">
                    {s.label}
                  </p>
                  <p
                    className={cn(
                      "mt-3 text-3xl font-bold tracking-tight",
                      s.accent === "primary" && "text-primary",
                      s.accent === "secondary" && "text-secondary",
                    )}
                  >
                    {s.value}
                    <span className="ml-1 text-xs font-medium text-muted-foreground">{s.suffix}</span>
                  </p>
                </div>
              ))}
            </section>

            <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-secondary/30 via-card to-background p-6 md:p-8">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">
                Today&apos;s Priority
              </p>
              <h2 className="mt-2 max-w-md text-balance text-2xl font-bold uppercase italic tracking-tight md:text-4xl">
                Hyper-Speed Cognitive Sprint
              </h2>
              <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
                Push your limits in the visual processing chamber. Current record: 0:42s held by
                @NeuralRacer.
              </p>
              <Link
                href="/dashboard/configure-sprint"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold uppercase tracking-widest text-primary-foreground outline-none transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-ring"
              >
                Start Sprint
              </Link>
            </section>

            <section className="rounded-3xl bg-card p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold uppercase italic tracking-tight text-primary">
                  Topic Mastery
                </h2>
                <button
                  type="button"
                  aria-label="Topic mastery options"
                  className="grid size-8 place-items-center rounded-lg outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <MoreHorizontal className="size-5 text-muted-foreground" aria-hidden="true" />
                </button>
              </div>
              <ul className="mt-6 flex flex-col gap-5">
                {(topics ?? []).length === 0 ? (
                  <li className="py-4 text-center text-sm text-muted-foreground">
                    No mastery data available yet. Complete a sprint to see your progress.
                  </li>
                ) : (
                  (topics ?? []).map((t) => (
                    <li key={t.name}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{t.name}</span>
                        <span
                          className={cn(
                            "font-bold",
                            t.color === "primary" ? "text-primary" : "text-secondary",
                          )}
                        >
                          {t.value}%
                        </span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          role="progressbar"
                          aria-valuenow={t.value}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={t.name}
                          className={cn(
                            "h-full rounded-full",
                            t.color === "primary" ? "bg-primary" : "bg-secondary",
                          )}
                          style={{ width: `${t.value}%` }}
                        />
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </section>
          </div>

          <aside className="flex flex-col gap-4">
            <section className="rounded-3xl bg-card p-6">
              <p className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Performance Matrix
              </p>
              <h2 className="mt-1 text-center text-xl font-bold uppercase italic tracking-tight text-primary">
                Cognitive Radar
              </h2>
              {(radarAxes ?? []).length > 0 ? (
                <CognitiveRadar axes={radarAxes ?? []} className="mt-4" />
              ) : (
                <p className="mt-8 text-center text-sm text-muted-foreground">
                  No radar data yet.
                </p>
              )}
            </section>

            <div className="flex items-center justify-between rounded-2xl bg-card px-5 py-4">
              <span className="flex items-center gap-3 text-sm font-medium">
                <Zap className="size-5 text-secondary" aria-hidden="true" />
                Action Delay
              </span>
              <span className="font-bold">142ms</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-card px-5 py-4">
              <span className="flex items-center gap-3 text-sm font-medium">
                <TrendingUp className="size-5 text-primary" aria-hidden="true" />
                Focus Density
              </span>
              <span className="font-bold">89%</span>
            </div>
          </aside>
        </div>
      )}
    </DojoShell>
  );
}
