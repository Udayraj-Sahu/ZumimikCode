"use client";

import { useRouter } from "next/navigation";
import { GraduationCap, ArrowRight } from "lucide-react";

export function CompleteSetupGate({
  title = "Choose your exam to continue",
  subtitle = "You haven't picked a target exam yet. Complete the quick setup flow to unlock topics, preps and mocks.",
}: {
  title?: string;
  subtitle?: string;
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-5 pt-6 pb-4 flex items-center justify-center">
      <div className="w-full max-w-sm rounded-3xl border backdrop-blur-xl p-6 text-center" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" }}>
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 border border-primary/20">
          <GraduationCap size={22} className="text-primary" />
        </span>
        <h2 className="mt-4 text-[18px] font-bold tracking-[-0.02em] text-foreground leading-tight">{title}</h2>
        <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground/50 font-normal">{subtitle}</p>
        <button
          type="button"
          onClick={() => router.push("/onboarding")}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-[13px] font-bold uppercase tracking-widest text-primary-foreground outline-none transition-all hover:opacity-90 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
        >
          Complete setup <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}