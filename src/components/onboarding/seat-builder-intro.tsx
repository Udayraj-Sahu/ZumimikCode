"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  BicepsFlexed,
  Brain,
  Check,
  Clock,
  Crown,
  Plus,
  ShieldCheck,
  Trophy,
} from "lucide-react";
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

const STACK: {
  id: string;
  title: string;
  summary: string;
  desc: string;
  tag: string;
  list: number;
  badge?: string;
  Icon: typeof Trophy;
}[] = [
  {
    id: "kid1",
    title: "Kid 01: Olympiad & Speed Math",
    summary: "Kid 01 Olympiad Speed Math",
    desc: "Nikhilam & IMO shortcuts • Live Arena Duels",
    tag: "OLYMPIAD FOUNDATION",
    list: 600,
    Icon: Trophy,
  },
  {
    id: "kid2",
    title: "Kid 02 / Sibling Track",
    summary: "Kid 02 Sibling Track",
    desc: "School mental speed • Table mastery & confidence",
    tag: "FOUNDATION SPEED CORE",
    list: 600,
    Icon: BicepsFlexed,
  },
  {
    id: "elder",
    title: "Elder / Silver Brain Track",
    summary: "Elder Silver Brain Track",
    desc: "Anti-decay neuroplasticity • High contrast, low stress",
    tag: "MICRO-KEEPER",
    list: 600,
    badge: "PREMIUM",
    Icon: Brain,
  },
];

function SectionTitle({ marker, title, tag }: { marker: string; title: string; tag: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-full border border-[#C8FF4D]/35 bg-[#C8FF4D]/10 text-[10px] font-black text-[#C8FF4D]">
          {marker}
        </span>
        <h2 className="text-[10px] font-black tracking-[0.18em] text-foreground">{title}</h2>
      </div>
      <span className="shrink-0 rounded-full border border-white/10 bg-black/30 px-2 py-0.5 text-[8px] font-bold tracking-wider text-[#C8FF4D]">
        {tag}
      </span>
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
      ...seats.map((s, i) => ({
        label: `Seat ${i + 2}: ${s.summary}`,
        amount: stackPrice(s.list),
      })),
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

  const seatCount = stacked.length + 1;

  return (
    <div className="space-y-6">
      {/* 1 — head of the table */}
      <section>
        <SectionTitle marker="1" title="HEAD OF THE TABLE" tag="REQUIRED BASE" />
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
                  "relative w-full overflow-hidden rounded-2xl border p-3.5 text-left transition",
                  selected
                    ? "border-[#C8FF4D]/50 bg-[#C8FF4D]/[0.05]"
                    : "border-white/[0.07] bg-black/25 hover:border-white/25",
                )}
              >
                {selected && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-px"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(200,255,77,0.5), transparent)",
                    }}
                  />
                )}
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2",
                      selected ? "border-[#C8FF4D]" : "border-white/25",
                    )}
                  >
                    {selected && <span className="size-2.5 rounded-full bg-[#C8FF4D]" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Crown
                            size={13}
                            className={cn(selected ? "text-[#C8FF4D]" : "text-muted-foreground/50")}
                          />
                          <h3 className="text-[12px] font-bold uppercase tracking-wide text-foreground">
                            {p.title}
                          </h3>
                          {selected && (
                            <span className="rounded bg-[#C8FF4D] px-1.5 py-px text-[7px] font-bold tracking-wider text-[#0A0C0A]">
                              HOLDING THIS SEAT
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-[10px] leading-snug text-muted-foreground/60">
                          {p.desc}
                        </p>
                      </div>
                      <div className="shrink-0 text-right text-[14px] font-bold text-[#C8FF4D]">
                        {inr(p.price)}
                        <span className="text-[9px] font-normal text-muted-foreground/50">
                          {" "}
                          /yr
                        </span>
                      </div>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[9px] text-muted-foreground/50">
                        <Clock size={10} /> {p.time}
                      </span>
                      <span className="text-[8px] font-bold tracking-wider text-[#C8FF4D]">
                        {p.tag}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2 — pull up a chair */}
      <section>
        <SectionTitle marker="2" title="PULL UP A CHAIR" tag={`${STACK_DISCOUNT_PCT}% OFF EACH`} />
        <div className="mt-3 space-y-2.5">
          {STACK.map((s) => {
            const added = stacked.includes(s.id);
            return (
              <button
                key={s.id}
                aria-pressed={added}
                onClick={() => toggleSeat(s.id)}
                className={cn(
                  "w-full rounded-2xl border p-3.5 text-left transition",
                  added
                    ? "border-[#C8FF4D]/40 bg-[#C8FF4D]/[0.04]"
                    : "border-white/[0.07] bg-black/25 hover:border-white/25",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className={cn(
                        "grid h-9 w-9 shrink-0 place-items-center rounded-xl border",
                        added
                          ? "border-[#C8FF4D]/30 bg-[#C8FF4D]/10 text-[#C8FF4D]"
                          : "border-white/10 bg-white/[0.03] text-muted-foreground/60",
                      )}
                    >
                      <s.Icon size={16} />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className="text-[12px] font-bold uppercase leading-snug tracking-wide text-foreground">
                          {s.title}
                        </h3>
                        {s.badge && (
                          <span className="rounded border border-fuchsia-400/40 bg-fuchsia-400/15 px-1.5 py-px text-[7px] font-bold tracking-wider text-fuchsia-300">
                            {s.badge}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[10px] leading-snug text-muted-foreground/60">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[8px] font-bold tracking-wider",
                      added
                        ? "border-[#C8FF4D] bg-[#C8FF4D] text-[#0A0C0A]"
                        : "border-white/20 text-muted-foreground/70",
                    )}
                  >
                    {added ? <Check size={10} /> : <Plus size={10} />}
                    {added ? "SEATED" : "ADD"}
                  </span>
                </div>
                <div className="mt-2.5 flex items-end justify-between pl-0.5">
                  <span
                    className={cn(
                      "text-[8px] font-bold tracking-wider",
                      added ? "text-[#C8FF4D]" : "text-muted-foreground/50",
                    )}
                  >
                    {s.tag}
                  </span>
                  <div className="text-right">
                    <span className="mr-1.5 text-[10px] text-muted-foreground/50 line-through">
                      {inr(s.list)}
                    </span>
                    <span className="text-[14px] font-bold text-[#C8FF4D]">
                      {inr(stackPrice(s.list))}
                    </span>
                    <span className="text-[9px] text-muted-foreground/50"> /yr</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* reservation receipt */}
      <section className="relative overflow-hidden rounded-2xl border border-[#C8FF4D]/25 bg-[#0a0c0a] p-4">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(200,255,77,0.45), transparent)",
          }}
        />
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[8px] font-black tracking-[0.2em] text-[#C8FF4D]">
              YOUR RESERVATION
            </p>
            <h2 className="mt-1 text-[14px] font-black uppercase tracking-tight text-foreground">
              {seatCount} seat{seatCount > 1 ? "s" : ""} at the table
            </h2>
          </div>
          <div className="shrink-0 rounded-xl border border-[#C8FF4D]/40 bg-[#C8FF4D]/10 px-3 py-1.5 text-center">
            <div className="text-[14px] font-black leading-none text-[#C8FF4D]">
              {inr(monthly)}/mo
            </div>
            <div className="mt-0.5 text-[6px] tracking-widest text-muted-foreground/50">
              EFFECTIVE
            </div>
          </div>
        </div>

        <ul className="mt-3 space-y-1.5">
          {lines.map((l) => (
            <li
              key={l.label}
              className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.07] bg-white/[0.02] px-2.5 py-2 text-[10px]"
            >
              <span className="text-muted-foreground/80">{l.label}</span>
              <span className="shrink-0 font-bold text-foreground">{inr(l.amount)}</span>
            </li>
          ))}
          <li className="flex items-center justify-between gap-2 rounded-lg border border-[#C8FF4D]/30 bg-[#C8FF4D]/[0.06] px-2.5 py-2 text-[10px]">
            <span className="text-muted-foreground/80">
              Vs 1-on-1 Private Tutors ({inr(PRIVATE_TUTOR_ANNUAL)}/yr)
            </span>
            <span className="shrink-0 text-[9px] font-bold text-[#C8FF4D]">SAVE {savePct}%</span>
          </li>
        </ul>
      </section>

      <p className="flex items-center justify-center gap-1.5 text-center text-[7px] tracking-wider text-muted-foreground/50">
        <ShieldCheck size={10} />
        100% COPPA & DPDP COMPLIANT • ZERO ADS • CANCEL ANYTIME
      </p>
    </div>
  );
}

/* ── plan hook overlay for vedic (dashboard) ── */

export function SeatBuilderIntro({
  onClose,
  preloaded = false,
}: {
  onClose: () => void;
  preloaded?: boolean;
}) {
  const store = useOnboardingStore();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [total, setTotal] = useState(0);

  useLayoutEffect(() => {
    if (preloaded) return;
    document.body.style.overflow = "hidden";
    if (overlayRef.current) {
      overlayRef.current.animate(
        [{ transform: "translateX(100%)" }, { transform: "translateX(0%)" }],
        {
          duration: 320,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        },
      );
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [preloaded]);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const closingRef = useRef(false);

  const exit = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    const el = overlayRef.current;
    const done = () => onCloseRef.current();
    if (!el) return done();
    el.animate([{ transform: "translateX(0%)" }, { transform: "translateX(-100%)" }], {
      duration: 280,
      easing: "cubic-bezier(0.55, 0, 0.55, 0.2)",
      fill: "forwards",
    }).addEventListener("finish", done, { once: true });
  }, []);

  const confirm = useCallback(() => {
    store.setPlanId("dual-lane");
    store.setPlanLane(store.targetExam || "cat");
    exit();
  }, [store, exit]);

  return createPortal(
    <div
      ref={overlayRef}
      className={cn(
        "fixed inset-0 z-[220] overflow-y-auto md:flex md:items-center md:justify-center md:overflow-hidden md:bg-black/60 md:backdrop-blur-sm",
        preloaded && "invisible pointer-events-none",
      )}
      role="dialog"
      aria-modal="true"
      aria-hidden={preloaded || undefined}
      aria-labelledby="seat-builder-hook-title"
    >
      <div
        className="relative w-full min-h-full md:min-h-0 md:max-w-md md:max-h-[90vh] md:flex md:flex-col md:overflow-hidden md:rounded-3xl md:border md:border-white/[0.06] md:shadow-2xl"
        style={{
          background: "radial-gradient(130% 90% at 50% 0%, #10140e 0%, #0a0b08 48%, #070907 100%)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 22px)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[-80px] h-52 w-52 -translate-x-1/2 rounded-full bg-[#C8FF4D]/[0.12] blur-[90px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(200,255,77,0.4), transparent)",
          }}
        />

        <div className="relative mx-auto w-full max-w-[400px] px-5 pb-8 pt-[max(1.5rem,env(safe-area-inset-top))] md:min-h-0 md:max-w-none md:flex-1 md:overflow-y-auto max-[359px]:px-4">
        <section className="mt-8 text-center">
          <h1
            id="seat-builder-hook-title"
            className="text-[34px] font-extrabold uppercase leading-[0.98] tracking-tight text-foreground"
          >
            One seat is
            <br />
            never{" "}
            <span
              className="text-transparent"
              style={{
                background: "linear-gradient(90deg, #C8FF4D, #9be66a)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
              }}
            >
              enough.
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-[320px] text-[12.5px] leading-relaxed text-muted-foreground/80">
            Head of the table picks the primary lane, then pull up chairs for everyone else — each
            extra seat gets the stack on the spot.
          </p>
        </section>

        <div className="mt-6">
          <SeatBuilderSelector onCheckout={setTotal} />
        </div>

        <button
          onClick={confirm}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-[16px] py-4 text-[12px] font-bold tracking-[0.12em] text-[#0A0C0A] transition hover:brightness-110 active:scale-[0.98]"
          style={{
            background: "linear-gradient(90deg, #C8FF4D, #B9F45C)",
            boxShadow: "0 10px 34px rgba(163,230,53,0.25), 0 1px 0 rgba(255,255,255,0.25) inset",
          }}
        >
          RESERVE YOUR SEATS FOR {inr(total)}/YR
          <ArrowRight size={14} />
        </button>

        <button
          onClick={exit}
          className="mx-auto block text-center text-[10px] text-muted-foreground/50 underline-offset-2 transition-colors hover:text-muted-foreground hover:underline"
        >
          Reserve later
        </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
