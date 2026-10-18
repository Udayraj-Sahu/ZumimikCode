"use client";

import { IntroCarousel, usePitchIntroSlides } from "@/components/onboarding/intro-carousel";

/**
 * Pitch intro — shown when no exam date is set yet ("whenever" / "not sure").
 * It reuses the same carousel, design and interactions as the Arena intro and
 * opens on the StopFeeding hook and the Manifesto, then the sponsor reel, the
 * compound-interest chart, reviews and how-it-works slides. Curate the Pitch
 * slide set in `usePitchIntroSlides`; the Arena flow is unaffected.
 */
export function PitchIntro({
  onClose,
  onSkip,
  preloaded = false,
}: {
  onClose: () => void;
  /** "Skip for now": dismiss the whole intro with no goal recorded. */
  onSkip?: () => void;
  preloaded?: boolean;
}) {
  const { slides, lanes } = usePitchIntroSlides();

  return (
    <IntroCarousel
      slides={slides}
      lanesCount={lanes.length}
      onClose={onClose}
      onSkip={onSkip}
      preloaded={preloaded}
      titleId="pitch-hook-title"
      badge="TACTICAL FOCUS"
      heading={{ lead: "Your focus", highlight: "compounds." }}
    />
  );
}
