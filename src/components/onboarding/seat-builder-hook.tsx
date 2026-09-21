"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Clock, Plus, ShieldCheck, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/stores/onboarding-store";

const ACCENT = "#C8FF4D";
const inr = (n: number) => `₹${new Intl.NumberFormat("en-IN").format(n)}`;

/* ── pricing rules (matches app/seat-builder reference) ── */

const STACK_DISCOUNT_PCT = 30;
const stackPrice = (list: number) => Math.round((list * (100 - STACK_DISCOUNT_PCT)) / 100);
const PRIVATE_TUTOR_ANNUAL = 48000;

const PRIMARY = [
  {
    id: "exam",
    title: "Parent Exam Prep",
    summary: "Parent Exam Prep (Full)",
    desc: "GMAT / CAT / Speed Logic • Full Adaptive Prep & Arena",
    price: 600,
    time: "6 mins / day micro drill",
    tag: "PODIUM ACUITY",
  },
  {
    id: "oversight",
    title: "Parent Oversight & Telemetry",
    summary: "Parent Oversight & Telemetry",
    desc: "Zero-test burden • Activity Grading, Live Progress Radar",
    price: 299,
    time: "2 mins / week review",
    tag: "GUARDIAN DASHBOARD",
  },
] as const;

const STACK: { id: string; title: string; summary: string; desc: string; tag: string; list: number; badge?: string }[] = [
  {
    id: "kid1",
    title: "Kid 01: Olympiad & Speed Math",
    summary: "Kid 01 Olympiad Speed Math",
    desc: "Nikhilam & IMO shortcuts • Live Arena Duels",
    tag: "OLYMPIAD FOUNDATION",
    list: 600,
  },
  {
    id: "kid2",
    title: "Kid 02 / Sibling Track",
    summary: "Kid 02 Sibling Track",
    desc: "School mental speed • Table mastery & confidence",
    tag: "FOUNDATION SPEED CORE",
    list: 600,
  },
  {
    id: "elder",
    title: "Elder / Silver Brain Track",
    summary: "Elder Silver Brain Track",
    desc: "Anti-decay neuroplasticity • High contrast, low stress",
    tag: "MICRO-KEEPER",
    list: 600,
    badge: "PREMIUM",
  },
];

function SectionHeader({
  n,
  title,
  tag,
  tagClass,
  numClass,
  titleClass,
}: {
  n: number;
  title: string;
  tag: string;
  tagClass: string;
  numClass: string;
  titleClass: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className={cn("grid h-5 w-5 place-items-center rounded-full border font-mono text-[10px] font-bold", numClass)}>{n}</span>
        <h2 className={cn("font-mono text-[10px] font-bold tracking-widest", titleClass)}>{title}</h2>
      </div>
      <span className={cn("shrink-0 rounded border px-1.5 py-0.5 font-mono text-[7px] font-bold tracking-wider", tagClass)}>{tag}</span>
    </div>
  );
}

/* ── presentational selector (used inside AdaptiveReprompt plan step) ── */

export function SeatBuilderSelector({ onCheckout }: { onCheckout?: (total: number) => void }) {
  const [primaryId, setPrimaryId] = useState<"exam" | "oversight">("exam");
  const [stacked, setStacked] = useState<string[]>(["kid1"]);

  const toggleSeat = (id: string) =>
    setStacked((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const { lines, total, monthly, savePct } = useMemo(() => {
    const primary = PRIMARY.find((p) => p.id === primaryId)!;
    const seats = STACK.filter((s) => stacked.includes(s.id));
    const _lines = [
      { label: `Base: ${primary.summary}`, amount: primary.price },
      ...seats.map((s, i) => ({ label: `Seat ${i + 2}: ${s.summary}`, amount: stackPrice(s.list) })),
    ];
    const _total = _lines.reduce((sum, l) => sum + l.amount, 0);
    return {
      lines: _lines,
      total: _total,
      monthly: Math.round(_total / 12),
      savePct: Math.max(0, Math.round((1 - _total / PRIVATE_TUTOR_ANNUAL) * 100)),
    };
  }, [primaryId, stacked]);

  useEffect(() => {
    onCheckout?.(total);
  }, [total, onCheckout]);

  return (
    <div className="flex flex-col gap-5">
      {/* 1 — primary seat */}
      <section>
        <SectionHeader
          n={1}
          title="PRIMARY SEAT (PARENT TRACK)"
          tag="REQUIRED BASE"
          tagClass="border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-300"
          numClass="border-[#C8FF4D]/40 bg-[#C8FF4D]/10 text-[#C8FF4D]"
          titleClass="text-[#C8FF4D]"
        />
        <div role="radiogroup" aria-label="Primary seat" className="mt-3 space-y-2.5">
          {PRIMARY.map((p) => {
            const selected = p.id === primaryId;
            return (
              <button
                key={p.id}
                role="radio"
                aria-checked={selected}
                onClick={() => setPrimaryId(p.id)}
                className={cn(
                  "w-full rounded-xl border p-3 text-left transition",
                  selected
                    ? "border-[#C8FF4D] bg-[#C8FF4D]/[0.05] shadow-[0_0_24px_rgba(200,255,77,0.15)]"
                    : "border-white/[0.06] bg-white/[0.02] hover:border-white/25",
                )}
              >
                <div className="flex items-start gap-3">
                  <span className={cn("mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border-2", selected ? "border-[#C8FF4D]" : "border-white/25")}>
                    {selected && <span className="size-2 rounded-full bg-[#C8FF4D]" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h3 className="text-[12px] font-bold uppercase tracking-wide text-foreground">{p.title}</h3>
                          {selected && (
                            <span className="rounded bg-[#C8FF4D] px-1.5 py-px font-mono text-[7px] font-bold tracking-wider text-[#0A0C0A]">
                              ACTIVE SEAT
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-[10px] leading-snug text-muted-foreground/60">{p.desc}</p>
                      </div>
                      <div className="shrink-0 text-right text-[14px] font-bold text-[#C8FF4D]">
                        {inr(p.price)}
                        <span className="text-[9px] font-normal text-muted-foreground/50"> /yr</span>
                      </div>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[9px] text-muted-foreground/50">
                        <Clock size={10} /> {p.time}
                      </span>
                      <span className="font-mono text-[8px] font-bold tracking-wider text-[#C8FF4D]">{p.tag}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2 — stack vertical seats */}
      <section>
        <SectionHeader
          n={2}
          title="STACK VERTICAL SEATS"
          tag={`${STACK_DISCOUNT_PCT}% OFF STACK ENABLED`}
          tagClass="border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
          numClass="border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
          titleClass="text-cyan-300"
        />
        <div className="mt-3 space-y-2.5">
          {STACK.map((s) => {
            const added = stacked.includes(s.id);
            return (
              <button
                key={s.id}
                aria-pressed={added}
                onClick={() => toggleSeat(s.id)}
                className={cn(
                  "w-full rounded-xl border p-3 text-left transition",
                  added
                    ? "border-cyan-400 bg-cyan-400/[0.04] shadow-[0_0_24px_rgba(34,211,238,0.18)]"
                    : "border-white/[0.06] bg-white/[0.02] hover:border-white/25",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="text-[12px] font-bold uppercase leading-snug tracking-wide text-foreground">{s.title}</h3>
                      {s.badge && (
                        <span className="rounded border border-fuchsia-400/40 bg-fuchsia-400/15 px-1.5 py-px font-mono text-[7px] font-bold tracking-wider text-fuchsia-300">
                          {s.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[10px] leading-snug text-muted-foreground/60">{s.desc}</p>
                  </div>
                  <span
                    className={cn(
                      "flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 font-mono text-[8px] font-bold tracking-wider",
                      added ? "border-cyan-400 bg-cyan-400 text-[#0A0C0A]" : "border-white/20 text-muted-foreground/70",
                    )}
                  >
                    {added ? <Check size={10} /> : <Plus size={10} />}
                    {added ? "ADDED" : "ADD SEAT"}
                  </span>
                </div>
                <div className="mt-2.5 flex items-end justify-between">
                  <span className={cn("font-mono text-[8px] font-bold tracking-wider", added ? "text-cyan-300" : "text-muted-foreground/50")}>
                    {s.tag}
                  </span>
                  <div className="text-right">
                    <span className="mr-1.5 text-[10px] text-muted-foreground/50 line-through">{inr(s.list)}</span>
                    <span className="text-[14px] font-bold text-[#C8FF4D]">{inr(stackPrice(s.list))}</span>
                    <span className="text-[9px] text-muted-foreground/50"> /yr</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* summary */}
      <section className="rounded-2xl border border-[#C8FF4D]/25 bg-black/50 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-mono text-[7px] font-bold tracking-[0.2em] text-[#C8FF4D]">ACTIVE CONFIGURATION SUMMARY</p>
            <h2 className="mt-1 text-[14px] font-black uppercase tracking-tight text-foreground">Vertical seat breakdown</h2>
          </div>
          <div className="shrink-0 rounded-lg border border-[#C8FF4D]/40 bg-[#C8FF4D]/10 px-2.5 py-1 text-center">
            <div className="text-[14px] font-black leading-none text-[#C8FF4D]">{inr(monthly)}/mo</div>
            <div className="mt-0.5 font-mono text-[6px] tracking-widest text-muted-foreground/50">EFFECTIVE</div>
          </div>
        </div>

        <ul className="mt-3 space-y-1.5">
          {lines.map((l) => (
            <li key={l.label} className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-2 text-[10px]">
              <span className="text-muted-foreground/80">{l.label}</span>
              <span className="shrink-0 font-mono font-bold text-foreground">{inr(l.amount)}</span>
            </li>
          ))}
          <li className="flex items-center justify-between gap-2 rounded-lg border border-[#C8FF4D]/30 bg-[#C8FF4D]/[0.06] px-2.5 py-2 text-[10px]">
            <span className="text-muted-foreground/80">Vs 1-on-1 Private Tutors ({inr(PRIVATE_TUTOR_ANNUAL)}/yr)</span>
            <span className="shrink-0 font-mono text-[9px] font-bold text-[#C8FF4D]">SAVE {savePct}%</span>
          </li>
        </ul>
      </section>

      <p className="flex items-center justify-center gap-1.5 text-center font-mono text-[7px] tracking-wider text-muted-foreground/50">
        <ShieldCheck size={10} />
        100% COPPA & DPDP COMPLIANT • ZERO ADS • CANCEL ANYTIME
      </p>
    </div>
  );
}

/* ── plan hook overlay for vedic (dashboard) ── */

export function SeatBuilderHook({ onClose }: { onClose: () => void }) {
  const store = useOnboardingStore();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    if (overlayRef.current) {
      overlayRef.current.animate([{ transform: "translateX(100%)" }, { transform: "translateX(0%)" }], {
        duration: 320,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      });
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const closingRef = useRef(false);

  const exit = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    const el = overlayRef.current;
    const done = () => onCloseRef.current();
    if (!el) return done();
    el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: "ease-in", fill: "forwards" }).addEventListener("finish", done, { once: true });
  }, []);

  const confirm = useCallback(() => {
    store.setPlanId("dual-lane");
    store.setPlanLane(store.targetExam || "cat");
    exit();
  }, [store, exit]);

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[220] overflow-y-auto"
      style={{ background: "linear-gradient(180deg, rgba(10,12,10,0.99) 0%, rgba(14,17,13,0.99) 100%)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="seat-builder-hook-title"
    >
      <div className="pointer-events-none absolute -top-16 right-0 h-56 w-56 rounded-full bg-[#C8FF4D]/[0.08] blur-[90px]" />
      <div className="pointer-events-none absolute left-0 top-[50%] h-64 w-64 rounded-full bg-cyan-500/[0.08] blur-[100px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(200,255,77,0.35), transparent)" }} />

      <div className="relative mx-auto w-full max-w-[400px] min-h-full">
        {/* top bar */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0a0a0d]/85 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-lg border border-[#C8FF4D]/40 bg-[#C8FF4D]/10 text-[#C8FF4D]">
              <Zap size={14} />
            </span>
            <div>
              <div className="font-mono text-[11px] font-bold tracking-[0.25em] text-[#C8FF4D]">EXAM ARENA</div>
              <div className="text-[10px] font-medium tracking-wide text-muted-foreground/70">SEAT BUILDER HUB</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-[#C8FF4D]/40 bg-[#C8FF4D]/10 px-2.5 py-1 font-mono text-[8px] font-bold tracking-wider text-[#C8FF4D]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#C8FF4D]" />
              MULTI-PLAN {STACK_DISCOUNT_PCT}% OFF
            </span>
            <button aria-label="Close" onClick={exit} className="text-[#C8FF4D] transition-colors hover:text-[#D9FF85] active:scale-95">
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="relative space-y-5 px-4 pb-8 pt-5">
          {/* hero */}
          <section>
            <div className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5">
              <span className="font-mono text-[8px] font-bold tracking-wider text-cyan-300">MODULAR PROTOCOL ARCHITECTURE</span>
            </div>
            <h2 id="seat-builder-hook-title" className="mt-3 text-[26px] font-black uppercase leading-[1.1] tracking-tight text-foreground">
              Build your{' '}
              <span className="bg-gradient-to-r from-[#C8FF4D] to-cyan-300 bg-clip-text text-transparent">
                cognitive suite
              </span>
            </h2>
            <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground/70">
              Select primary track, then stack additional family seats with instant {STACK_DISCOUNT_PCT}% multi-seat discount.
            </p>
          </section>

          <SeatBuilderSelector onCheckout={setTotal} />

          {/* CTA */}
          <button
            onClick={confirm}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-mono text-[11px] font-bold tracking-wider text-[#0A0C0A] transition hover:brightness-110 active:scale-[0.98]"
            style={{
              background: "linear-gradient(90deg, #C8FF4D, #B9F45C)",
              boxShadow: "0 0 28px rgba(200,255,77,0.35), 0 1px 0 rgba(255,255,255,0.25) inset",
            }}
          >
            <Zap size={14} />
            ACTIVATE CONFIGURED PASS ({inr(total)}/YEAR)
          </button>

          <button
            onClick={exit}
            className="mx-auto block text-center text-[10px] text-muted-foreground/50 underline-offset-2 transition-colors hover:text-muted-foreground hover:underline"
          >
            Cancel and return to training
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}