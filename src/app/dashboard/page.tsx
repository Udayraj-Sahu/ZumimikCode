import Link from "next/link";
import { Bell, Zap, Brain, MoreHorizontal, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { DojoShell } from "@/components/dashboard/dojo-shell";
import { CognitiveRadar } from "@/components/dashboard/cognitive-radar";
import { STATS, TOPIC_MASTERY, RADAR_AXES } from "@/lib/dashboard-data";

export default function DashboardPage() {
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

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <section aria-label="Key stats" className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {STATS.map((s) => (
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
              {TOPIC_MASTERY.map((t) => (
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
              ))}
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
            <CognitiveRadar axes={RADAR_AXES} className="mt-4" />
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
    </DojoShell>
  );
}
