import { RankSignal } from "@/components/sections/RankSignal";
import { ExamPortals } from "@/components/sections/ExamPortals";
import { AchievementWall } from "@/components/sections/AchievementWall";
import { ConstellationCoach } from "@/components/sections/ConstellationCoach";
import { EnergyTower } from "@/components/sections/EnergyTower";
import { HorizonScene } from "@/components/sections/HorizonScene";
import { SectionReveal } from "@/components/SectionReveal";
import { VerticalNav } from "@/components/nav/VerticalNav";
import { FloatingActions } from "@/components/FloatingActions";

export default function Home() {
  return (
    <main>
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 pointer-events-none">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="w-5 h-5">
          <polygon
            points="12,2 20,7 20,17 12,22 4,17 4,7"
            fill="none"
            stroke="#C8FF5A"
            strokeWidth="1.5"
            opacity="0.6"
          />
          <circle cx="12" cy="12" r="2" fill="#C8FF5A" opacity="0.4" />
        </svg>
        <span className="font-display text-[10px] tracking-[0.3em] text-primary/60 font-semibold">
          EXAM ARENA
        </span>
      </div>
      <VerticalNav />
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
