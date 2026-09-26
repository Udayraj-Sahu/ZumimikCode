"use client";

import { RankSignal } from "@/components/landing/rank-signal";
import { LIME_BRIGHT } from "@/lib/theme-tokens";
import { ExamPortals } from "@/components/landing/exam-portals";
import { AchievementWall } from "@/components/landing/achievement-wall";
import { ConstellationCoach } from "@/components/landing/constellation-coach";
import { EnergyTower } from "@/components/landing/energy-tower";
import { HorizonScene } from "@/components/landing/horizon-scene";
import { SectionReveal } from "@/components/landing/section-reveal";
import { SectionNav } from "@/components/landing/section-nav";
import { FloatingActions } from "@/components/landing/floating-actions";

export default function Home() {
  return (
    <main>
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 pointer-events-none">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="w-5 h-5">
          <polygon
            points="12,2 20,7 20,17 12,22 4,17 4,7"
            fill="none"
            stroke={LIME_BRIGHT}
            strokeWidth="1.5"
            opacity="0.6"
          />
          <circle cx="12" cy="12" r="2" fill={LIME_BRIGHT} opacity="0.4" />
        </svg>
        <span className="font-display text-micro tracking-[0.3em] text-primary/60 font-semibold">
          EXAM ARENA
        </span>
      </div>
      <SectionNav />
      <section id="arena">
        <RankSignal />
      </section>
      <SectionReveal><ExamPortals /></SectionReveal>
      <SectionReveal><AchievementWall /></SectionReveal>
      <SectionReveal><ConstellationCoach /></SectionReveal>
      <SectionReveal><EnergyTower /></SectionReveal>
      <section id="horizon">
        <SectionReveal className="relative" style={{ minHeight: '100dvh', height: '100dvh' }}>
          <HorizonScene />
        </SectionReveal>
      </section>
      <FloatingActions />
    </main>
  );
}
