import { RankSignal } from "@/components/sections/RankSignal";
import { ExamPortals } from "@/components/sections/ExamPortals";
import { AchievementWall } from "@/components/sections/AchievementWall";
import { ConstellationCoach } from "@/components/sections/ConstellationCoach";
import { EnergyTower } from "@/components/sections/EnergyTower";
import { HorizonScene } from "@/components/sections/HorizonScene";
import { SectionReveal } from "@/components/SectionReveal";

export default function Home() {
  return (
    <main>
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
    </main>
  );
}
