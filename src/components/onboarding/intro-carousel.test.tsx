import { beforeAll, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// The carousel reads live dashboard data for the "up next" slide; a non-empty
// list keeps every Arena slide in the flow (Arena 7, Pitch 3 + 3 Pitch-only).
vi.mock("@/hooks/queries/use-dashboard", () => ({
  useDashboardData: () => ({ data: { upcoming: [{ id: "next-1" }] } }),
}));

import { ArenaIntro } from "@/components/onboarding/arena-intro";
import { PitchIntro } from "@/components/onboarding/pitch-intro";

// jsdom has no Web Animations API; the carousel uses it for the entrance/exit.
beforeAll(() => {
  if (!Element.prototype.animate) {
    Element.prototype.animate = vi.fn(() => ({
      addEventListener: vi.fn(),
      finished: Promise.resolve(),
      cancel: vi.fn(),
    })) as unknown as typeof Element.prototype.animate;
  }
});

// Slides other than the active one are `aria-hidden`, so include hidden nodes;
// the label filter drops the nested `<article>` cards inside slide bodies.
const slideLabels = () =>
  screen
    .getAllByRole("article", { hidden: true })
    .map((el) => el.getAttribute("aria-label"))
    .filter((label): label is string => /^\d+ of \d+:/.test(label ?? ""));

describe("ArenaIntro", () => {
  it("keeps its seven slides in order", () => {
    render(<ArenaIntro onClose={() => {}} />);

    expect(slideLabels()).toEqual([
      "1 of 7: ACTIVE LANES",
      "2 of 7: FEATURES",
      "3 of 7: SPONSOR REEL",
      "4 of 7: SPEED",
      "5 of 7: HABIT",
      "6 of 7: REVIEWS",
      "7 of 7: HOW IT WORKS",
    ]);
  });

  it("keeps the Arena badge and hero heading", () => {
    render(<ArenaIntro onClose={() => {}} />);

    expect(screen.getByText("ARENA")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "The arena is live." })).toBeInTheDocument();
  });
});

describe("PitchIntro", () => {
  it("opens on StopFeeding, Manifesto, the sponsor reel, the chart, reviews and how it works", () => {
    render(<PitchIntro onClose={() => {}} />);

    expect(slideLabels()).toEqual([
      "1 of 6: TACTICAL EFFICIENCY",
      "2 of 6: MANIFESTO",
      "3 of 6: SPONSOR REEL",
      "4 of 6: COMPOUND EFFECT",
      "5 of 6: REVIEWS",
      "6 of 6: HOW IT WORKS",
    ]);

    expect(screen.getByText("Stop feeding")).toBeInTheDocument();
    expect(screen.getByText("The algorithm")).toBeInTheDocument();
    expect(
      screen.getByText("Stop letting TikTok lobotomize you. Reclaim your focus."),
    ).toBeInTheDocument();
  });

  it("does not start the chart animation on load", () => {
    render(<PitchIntro onClose={() => {}} />);

    // The overlay portals into document.body, so query the document.
    expect(document.querySelector("section.play")).toBeNull();
    expect(document.body.textContent).toContain("+0%");
    expect(document.body.textContent).not.toContain("+312%");
  });

  it("shows the Pitch badge and hero heading instead of the Arena ones", () => {
    render(<PitchIntro onClose={() => {}} />);

    expect(screen.getByText("TACTICAL FOCUS")).toBeInTheDocument();
    expect(screen.queryByText("ARENA")).toBeNull();
    expect(screen.getByRole("heading", { name: "Your focus compounds." })).toBeInTheDocument();
  });

  it("renders one indicator per slide", () => {
    render(<PitchIntro onClose={() => {}} />);

    expect(screen.getAllByRole("button", { name: /Go to slide/ })).toHaveLength(6);
    expect(screen.getByRole("button", { name: /Go to slide 1 of 6/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Go to slide 6 of 6/ })).toBeInTheDocument();
  });
});
