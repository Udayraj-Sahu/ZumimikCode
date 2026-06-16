import type { Metadata } from "next";
import { DojoShell } from "@/components/dashboard/dojo-shell";
import { Zap, Trophy, Target, Star, Flame, Shield, Brain, Swords } from "lucide-react";

export const metadata: Metadata = {
  title: "Profile — Exam Arena",
  description: "Your Exam Arena profile, stats, and achievements.",
  robots: "noindex, nofollow",
};

const ACHIEVEMENTS = [
  { icon: Flame, label: "Week Warrior", desc: "7-day streak", unlocked: true },
  { icon: Zap, label: "Speed Demon", desc: "10 sprints in a day", unlocked: true },
  { icon: Trophy, label: "Top 50", desc: "Arena rank #47", unlocked: true },
  { icon: Star, label: "Perfect Score", desc: "100% on any sprint", unlocked: false },
  { icon: Shield, label: "Iron Will", desc: "30-day streak", unlocked: false },
  { icon: Swords, label: "Gladiator", desc: "100 sprints completed", unlocked: false },
];

export default function ProfilePage() {
  return (
    <DojoShell>
      <div className="mx-auto max-w-2xl">
        <header className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <span className="grid size-16 shrink-0 place-items-center rounded-full bg-primary/10 text-2xl font-bold text-primary md:size-20 md:text-3xl">
            UA
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight md:text-3xl">Udayraj Sahu</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Champion &middot; Level 04 &middot; 12-Day Streak
            </p>
          </div>
        </header>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { label: "Sessions", value: "47", icon: Target },
            { label: "Streak", value: "12d", icon: Flame },
            { label: "Rank", value: "#47", icon: Trophy },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-2xl bg-card p-4 text-center">
                <Icon className="mx-auto size-4 text-muted-foreground" aria-hidden="true" />
                <p className="mt-2 text-xl font-bold tracking-tight text-primary">{s.value}</p>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </p>
              </div>
            );
          })}
        </div>

        <section className="mt-6 rounded-3xl bg-card p-5 md:p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-primary">Achievements</h2>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ACHIEVEMENTS.map((a) => {
              const Icon = a.icon;
              return (
                <div
                  key={a.label}
                  className={`rounded-2xl border p-4 text-center ${
                    a.unlocked
                      ? "border-border bg-card"
                      : "border-dashed border-border/30 opacity-40"
                  }`}
                >
                  <Icon
                    className={`mx-auto size-5 ${a.unlocked ? "text-primary" : "text-muted-foreground"}`}
                    aria-hidden="true"
                  />
                  <p className="mt-2 text-[11px] font-bold uppercase tracking-wide">{a.label}</p>
                  <p className="text-[9px] text-muted-foreground">{a.desc}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </DojoShell>
  );
}
