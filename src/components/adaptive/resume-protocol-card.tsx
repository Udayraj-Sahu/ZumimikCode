"use client";

import { useRouter } from "next/navigation";
import { Play, X, History, Clock } from "lucide-react";
import { useResumeStore } from "@/stores/resume-store";

function timeAgo(ts: number): string {
  const s = Math.max(1, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function ResumeProtocolCard() {
  const router = useRouter();
  const snapshot = useResumeStore((s) => s.snapshot);
  const clearSnapshot = useResumeStore((s) => s.clearSnapshot);

  if (!snapshot) return null;

  const completed = Math.max(0, snapshot.currentIndex);
  const total = snapshot.questions.length;

  const continueHref = () => {
    const params = new URLSearchParams({
      topic: snapshot.topic,
      length: String(snapshot.questions.length),
      difficulty: snapshot.difficulty,
      resume: "1",
    });
    if (snapshot.isAdaptive) {
      params.set("adaptive", "1");
      if (snapshot.domain) params.set("domain", snapshot.domain);
    }
    router.push(`/play/sprint?${params.toString()}`);
  };

  return (
    <div className="mt-4 px-5">
      <div className="relative overflow-hidden rounded-3xl border backdrop-blur-xl px-5 py-4" style={{ borderColor: "rgba(167,139,250,0.25)", background: "linear-gradient(135deg, rgba(167,139,250,0.08) 0%, rgba(255,255,255,0.03) 100%)" }}>
        <div className="absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b from-[#A78BFA] to-[#22D3EE]" />

        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-xl grid place-items-center" style={{ background: "rgba(167,139,250,0.12)" }}>
            <History size={15} className="text-[#A78BFA]" />
          </div>
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#A78BFA]/80">Resume Protocol</p>
          <span className="ml-auto text-[10px] font-medium text-muted-foreground/50">{timeAgo(snapshot.savedAt)}</span>
        </div>

        <p className="mt-2.5 text-[16px] font-bold tracking-[-0.02em] text-foreground leading-tight">{snapshot.topicLabel}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground/55">Based on topic → subtopic practice set</p>

        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold text-foreground/70" style={{ background: "rgba(255,255,255,0.05)" }}>
            <Play size={9} /> {completed + 1}/{total} questions
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold font-mono text-foreground/70" style={{ background: "rgba(255,255,255,0.05)" }}>
            <Clock size={9} /> {formatTime(snapshot.timeLeft)} left
          </span>
        </div>

        <div className="mt-3 h-1.5 w-full rounded-full bg-white/[0.05] overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-[#A78BFA] to-[#22D3EE]" style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }} />
        </div>

        <div className="mt-4 flex gap-2.5">
          <button
            type="button"
            onClick={continueHref}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 text-[11px] font-bold uppercase tracking-widest text-[#0A0C0A] transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: "#C8FF4D" }}
          >
            <Play size={12} strokeWidth={2.5} /> Continue
          </button>
          <button
            type="button"
            onClick={clearSnapshot}
            className="shrink-0 rounded-2xl border border-white/[0.08] px-4 py-3 text-[11px] font-bold text-muted-foreground/60 transition-all hover:text-foreground hover:bg-white/[0.05] active:scale-[0.98]"
          >
            <span className="inline-flex items-center gap-1.5"><X size={11} /> Dismiss</span>
          </button>
        </div>
      </div>
    </div>
  );
}