"use client";

import { useState } from "react";
import {
  Activity,
  BarChart3,
  Gauge,
  Infinity as InfinityIcon,
  Video,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ACCENT = "#C8FF4D";
const inr = (n: number) => `₹${new Intl.NumberFormat("en-IN").format(n)}`;

export const SPEED_RATIO = 91.4;
export const MOCKS_ONLINE = 12;

const FEATURES: {
  id: string;
  title: string;
  desc: string;
  Icon: LucideIcon;
  tile: string;
  badge?: string;
}[] = [
  {
    id: "sims",
    title: "Infinite Full-Length Simulations",
    desc: "CAT, GMAT & GRE simulated batteries with authentic percentile scaling and test-day time pressure.",
    Icon: InfinityIcon,
    tile: "border-[#C8FF4D]/40 bg-[#C8FF4D]/10 text-[#C8FF4D]",
  },
  {
    id: "forensics",
    title: "Sub-Second Video Forensics",
    desc: "Instant post-mock breakdown showing exactly where you lost seconds and which Vedic shortcuts would have saved you 45s per problem.",
    Icon: Video,
    tile: "border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300",
  },
  {
    id: "stress",
    title: "Dynamic Difficulty Stress Tests",
    desc: "Adaptive section tests that specifically expand and reinforce your detected cognitive vulnerabilities.",
    Icon: Activity,
    tile: "border-cyan-400/40 bg-cyan-400/10 text-cyan-300",
  },
  {
    id: "hud",
    title: "All-India Neural Percentile HUD",
    desc: "Real-time predictive rank projections based on high-intensity batch cohorts across national testing centers.",
    Icon: BarChart3,
    tile: "border-[#C8FF4D]/40 bg-[#C8FF4D]/10 text-[#C8FF4D]",
    badge: "LIVE",
  },
];

const OPTIONS = [
  {
    id: "unlimited",
    title: "Add Unlimited Mocks",
    badge: "BEST VALUE",
    price: 499,
    desc: "Attach directly to your active training roadmap",
    note: "SAVES 66% VS SECTIONAL PURCHASE",
    cta: "ACTIVATE UNLIMITED MOCKS",
  },
  {
    id: "bundle",
    title: "Full Multi-Lane Bundle",
    price: 1200,
    desc: "All Vedic Lanes + Speed Drills + Unlimited Mocks",
    note: "EARLY LIMITED BONUS • ALL UNLOCKED",
    cta: "ACTIVATE FULL BUNDLE",
  },
] as const;

type OptionId = (typeof OPTIONS)[number]["id"];

export function MockArenaSelector({
  onActivate,
}: {
  onActivate?: (optionId: string, price: number) => void;
}) {
  const [optionId, setOptionId] = useState<OptionId>("unlimited");
  const selected = OPTIONS.find((o) => o.id === optionId)!;

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* hero */}
        <section>
          <div className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5">
            <span className="font-mono text-[8px] font-bold tracking-wider text-cyan-300">
              BATTLE ARENA ACCESS // PRO MOCK PACK
            </span>
            <span className="shrink-0 rounded border border-fuchsia-400/40 bg-fuchsia-400/10 px-1.5 py-px font-mono text-[8px] font-bold text-fuchsia-300">
              V3.0
            </span>
          </div>

          <h2 className="mt-4 text-[26px] font-black uppercase leading-[1.1] tracking-tight">
            Unlock unlimited{" "}
            <span className="bg-gradient-to-r from-[#C8FF4D] to-emerald-300 bg-clip-text text-transparent">
              full-length mocks
            </span>
          </h2>
          <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
            You have completed your complimentary diagnostic. Now, enter simulated battle conditions
            with AI sub-second error forensics.
          </p>
        </section>

        {/* diagnostic status */}
        <section className="flex items-center gap-3 rounded-xl border border-[#C8FF4D]/30 bg-[#C8FF4D]/[0.04] p-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-[#C8FF4D]/40 bg-[#C8FF4D]/10 text-[#C8FF4D]">
            <Gauge size={16} />
          </span>
          <div>
            <div className="font-mono text-[8px] font-bold tracking-[0.2em] text-muted-foreground/60">
              FREE DIAGNOSTIC STATUS
            </div>
            <div className="mt-0.5 text-[13px] font-bold">
              <span className="font-mono text-[10px] font-medium text-muted-foreground/60">
                CALCULATED:{" "}
              </span>
              <span className="text-[#C8FF4D]">{SPEED_RATIO}%</span> SPEED RATIO
            </div>
          </div>
        </section>

        {/* engine banner */}
        <div className="relative h-20 overflow-hidden rounded-xl border border-white/10 bg-[linear-gradient(120deg,#0f172a_0%,#064e3b_50%,#1e1b4b_100%)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(163,230,53,0.25),transparent_55%)]" />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent px-3 pb-2 pt-6">
            <span className="font-mono flex items-center gap-1.5 text-[8px] font-bold tracking-wider text-[#C8FF4D]">
              <span className="size-1.5 animate-pulse rounded-full bg-[#C8FF4D] shadow-[0_0_8px_rgba(200,255,77,0.9)]" />
              NEURAL SIMULATION ENGINE ACTIVE
            </span>
            <span className="font-mono text-[8px] font-bold tracking-wider text-muted-foreground/80">
              {MOCKS_ONLINE} MOCKS ONLINE
            </span>
          </div>
        </div>

        {/* what you get */}
        <section>
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-[9px] font-bold tracking-[0.2em] text-muted-foreground/80">
              WHAT YOU GET WITH MOCK ARENA ELITE
            </h3>
            <span className="font-mono text-[8px] font-bold tracking-wider text-[#C8FF4D]">
              {FEATURES.length} MODULES
            </span>
          </div>

          <ul className="mt-3 space-y-2.5">
            {FEATURES.map(({ id, title, desc, Icon, tile, badge }) => (
              <li key={id} className="flex gap-3 rounded-xl border border-white/10 bg-black/40 p-3">
                <span
                  className={cn("grid size-8 shrink-0 place-items-center rounded-lg border", tile)}
                >
                  <Icon size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-[11px] font-bold uppercase leading-snug tracking-wide">
                      {title}
                    </h4>
                    {badge && (
                      <span className="shrink-0 rounded border border-[#C8FF4D]/40 bg-[#C8FF4D]/10 px-1.5 py-px font-mono text-[7px] font-bold tracking-wider text-[#C8FF4D]">
                        {badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground/70">
                    {desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* access clearance */}
        <section>
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-[9px] font-bold tracking-[0.2em] text-muted-foreground/80">
              SELECT ACCESS CLEARANCE
            </h3>
            <span className="font-mono text-[8px] font-bold tracking-wider text-cyan-300">
              FLEXIBLE BILLING
            </span>
          </div>

          <div role="radiogroup" aria-label="Access clearance" className="mt-3 space-y-2.5">
            {OPTIONS.map((o) => {
              const active = o.id === optionId;
              return (
                <button
                  key={o.id}
                  role="radio"
                  aria-checked={active}
                  onClick={() => setOptionId(o.id)}
                  className={cn(
                    "w-full rounded-xl border p-3 text-left transition",
                    active
                      ? "border-[#C8FF4D] bg-[#C8FF4D]/[0.05] shadow-[0_0_24px_rgba(200,255,77,0.18)]"
                      : "border-white/10 bg-white/[0.02] hover:border-white/25",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border",
                        active ? "border-[#C8FF4D]" : "border-muted-foreground/40",
                      )}
                    >
                      {active && <span className="size-2 rounded-full bg-[#C8FF4D]" />}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h4 className="text-[12px] font-bold uppercase tracking-wide">
                              {o.title}
                            </h4>
                            {"badge" in o && (
                              <span className="rounded bg-[#C8FF4D] px-1.5 py-px font-mono text-[7px] font-bold tracking-wider text-[#0A0C0A]">
                                {o.badge}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-[10px] leading-snug text-muted-foreground/60">
                            {o.desc}
                          </p>
                        </div>
                        <div className="shrink-0 text-right text-[15px] font-bold text-[#C8FF4D]">
                          {inr(o.price)}
                          <span className="text-[9px] font-normal text-muted-foreground/50">
                            /yr
                          </span>
                        </div>
                      </div>
                      <div
                        className={cn(
                          "mt-2 font-mono text-[7px] font-bold tracking-wider",
                          active ? "text-[#C8FF4D]" : "text-muted-foreground/40",
                        )}
                      >
                        {o.note}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* sticky CTA */}
      <footer className="sticky bottom-0 z-10 -mx-1 border-t border-[#C8FF4D]/20 bg-[#0a0a0d]/95 px-1 pb-1 pt-3 backdrop-blur">
        <button
          type="button"
          onClick={() => onActivate?.(selected.id, selected.price)}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-mono text-[11px] font-bold tracking-wider text-[#0A0C0A] transition hover:brightness-110 active:scale-[0.98]"
          style={{
            background: `linear-gradient(90deg, ${ACCENT}, #B9F45C)`,
            boxShadow: "0 0 28px rgba(200,255,77,0.35), 0 1px 0 rgba(255,255,255,0.25) inset",
          }}
        >
          <Zap size={14} />
          {selected.cta} — {inr(selected.price)}/YEAR
        </button>
      </footer>
    </div>
  );
}
