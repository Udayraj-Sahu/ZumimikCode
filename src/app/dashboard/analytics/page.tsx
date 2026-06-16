import type { Metadata } from "next";
import { DojoShell } from "@/components/dashboard/dojo-shell";
import { cn } from "@/lib/utils";
import { Target, BarChart3, Zap, Trophy, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Analytics — Exam Arena",
  description: "Deep-dive performance metrics from your training sessions.",
  robots: "noindex, nofollow",
};

const ACTIVITY = [
  { day: "Mon", value: 85 },
  { day: "Tue", value: 62 },
  { day: "Wed", value: 78 },
  { day: "Thu", value: 91 },
  { day: "Fri", value: 55 },
  { day: "Sat", value: 73 },
  { day: "Sun", value: 88 },
];

const RECENT = [
  { action: "Completed Sprint", detail: "Quantitative Aptitude — 92%", time: "2h ago" },
  { action: "New High Score", detail: "Logical Reasoning — 78%", time: "1d ago" },
  { action: "Streak Milestone", detail: "12-Day Streak Achieved", time: "2d ago" },
  { action: "Rank Up", detail: "Climbed to #47 in Arena Rankings", time: "3d ago" },
];

export default function AnalyticsPage() {
  return (
    <DojoShell>
      <header>
        <h1 className="text-xl font-bold tracking-tight md:text-3xl">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Deep-dive performance metrics from your last 47 sessions.
        </p>
      </header>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { icon: BarChart3, label: "Total Sessions", value: "47", accent: "text-primary" },
          { icon: Target, label: "Avg Score", value: "82%", accent: "text-chart-2" },
          { icon: Zap, label: "Best Streak", value: "12d", accent: "text-chart-3" },
          { icon: Trophy, label: "Arena Rank", value: "#47", accent: "text-chart-4" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl bg-card p-4">
              <div className="flex items-center gap-2">
                <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </p>
              </div>
              <p className={cn("mt-2 text-2xl font-bold tracking-tight md:text-3xl", s.accent)}>
                {s.value}
              </p>
            </div>
          );
        })}
      </div>

      <section className="mt-6 rounded-3xl bg-card p-5 md:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-primary">Weekly Activity</h2>
          <TrendingUp className="size-4 text-muted-foreground" aria-hidden="true" />
        </div>
        <div className="mt-6 flex items-end justify-between gap-2">
          {ACTIVITY.map((d) => (
            <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-[10px] font-semibold text-muted-foreground">{d.value}%</span>
              <div className="w-full rounded-full bg-muted" style={{ height: "clamp(40px, 12vw, 80px)" }}>
                <div
                  className="w-full rounded-full bg-primary transition-all duration-700"
                  style={{ height: `${d.value}%` }}
                />
              </div>
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">{d.day}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-3xl bg-card p-5 md:p-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-primary">Recent Activity</h2>
        <ul className="mt-4 divide-y divide-border">
          {RECENT.map((r) => (
            <li key={r.time} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">{r.action}</p>
                <p className="text-xs text-muted-foreground">{r.detail}</p>
              </div>
              <span className="shrink-0 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {r.time}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </DojoShell>
  );
}
