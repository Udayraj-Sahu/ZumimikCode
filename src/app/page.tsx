import dynamic from "next/dynamic";
import { RankSignal } from "@/components/sections/RankSignal";
import { ExamPortals } from "@/components/sections/ExamPortals";
import { AchievementWall } from "@/components/sections/AchievementWall";
import { ConstellationCoach } from "@/components/sections/ConstellationCoach";
import { EnergyTower } from "@/components/sections/EnergyTower";
import { SectionReveal } from "@/components/SectionReveal";

const HorizonScene = dynamic(() => import("@/components/sections/HorizonScene").then((m) => m.HorizonScene), { ssr: false });

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
