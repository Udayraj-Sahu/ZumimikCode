import type { Metadata } from "next";
import { Zap, Trophy, Target, Star, Flame, Shield, Swords, Medal } from "lucide-react";

export const metadata: Metadata = {
  title: "Profile — Exam Arena",
  description: "Your Exam Arena profile, stats, and achievements.",
  robots: "noindex, nofollow",
};

const ACHIEVEMENTS = [
  { icon: Flame, label: "Week Warrior", desc: "7-day streak", unlocked: true },
  { icon: Zap, label: "Speed Demon", desc: "10 sprints in a day", unlocked: true },
  { icon: Medal, label: "Top 50", desc: "Arena rank #47", unlocked: true },
  { icon: Star, label: "Perfect Score", desc: "100% on any sprint", unlocked: false },
  { icon: Shield, label: "Iron Will", desc: "30-day streak", unlocked: false },
  { icon: Swords, label: "Gladiator", desc: "100 sprints completed", unlocked: false },
];

export default function ProfilePage() {
  return (
      <div className="px-4 sm:px-6">
        <div className="pt-5 pb-4 border-b border-border mb-5">
          <p className="text-fluid-xs font-semibold tracking-[0.15em] text-muted-foreground/60">
            EXAM ARENA
          </p>
          <p className="text-fluid-xl font-bold tracking-tight text-foreground mt-0.5">
            Profile
          </p>
        </div>

        <header className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
          <span className="relative grid size-20 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-fluid-3xl font-black text-primary ring-2 ring-primary/30 sm:size-24">
            UA
          </span>
          <div className="text-center sm:text-left">
            <h1 className="text-fluid-2xl font-black tracking-tight text-foreground">
              Udayraj Sahu
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-0.5 text-fluid-xs font-bold uppercase tracking-wider text-primary">
                <Zap size={10} />
                Champion
              </span>
              <span className="text-fluid-xs text-muted-foreground/60">Lv. 04</span>
              <span className="text-fluid-xs text-muted-foreground/60">&middot;</span>
              <span className="text-fluid-xs font-semibold text-chart-4">12-Day Streak</span>
            </div>
          </div>
        </header>

        <div className="mt-5 grid grid-cols-3 gap-2.5 sm:gap-4">
          {[
            { label: "Sessions", value: "47", icon: Target },
            { label: "Streak", value: "12d", icon: Flame },
            { label: "Rank", value: "#47", icon: Trophy },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="relative overflow-hidden rounded-2xl border border-border/40 bg-card px-3 py-4 text-center transition-all active:scale-95 sm:p-5"
              >
                <Icon className="mx-auto size-3.5 text-muted-foreground/30 sm:size-4" aria-hidden="true" />
                <p className="mt-1.5 text-fluid-xl font-black tracking-tight text-primary sm:text-fluid-2xl">
                  {s.value}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 sm:text-fluid-xs">
                  {s.label}
                </p>
              </div>
            );
          })}
        </div>

        <section className="mt-6 mb-4" aria-label="Achievements">
          <h2 className="mb-3 text-fluid-sm font-bold uppercase tracking-widest text-primary">
            Achievements
          </h2>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-6">
            {ACHIEVEMENTS.map((a) => {
              const Icon = a.icon;
              return (
                <div
                  key={a.label}
                  className={`rounded-2xl border px-3 py-4 text-center transition-all sm:p-5 ${
                    a.unlocked
                      ? "border-border/40 bg-card"
                      : "border-dashed border-border/20 opacity-40"
                  }`}
                >
                  <div
                    className={`mx-auto mb-2 grid size-8 place-items-center rounded-xl sm:size-10 ${
                      a.unlocked ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="size-4 sm:size-5" aria-hidden="true" />
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-wide sm:text-fluid-sm">
                    {a.label}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground/60 sm:text-fluid-xs">
                    {a.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
  );
}
