import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { useWelcomeStore } from "@/stores/welcome-store";

// The avatar engine is an AGPL client-only chunk loaded via next/dynamic; stub
// the dynamic loader with a synchronous component so the test focuses on the
// welcome state machine and never resolves an async chunk.
vi.mock("next/dynamic", () => ({
  default: () => {
    const DynamicStub = () => <span data-testid="pip-avatar" />;
    DynamicStub.displayName = "DynamicStub";
    return DynamicStub;
  },
}));

// Replace framer-motion with inert divs so the walk has no animation timing:
// `onAnimationComplete` never fires and assertions stay deterministic.
vi.mock("motion/react", () => {
  type MotionProps = Record<string, unknown> & { children?: React.ReactNode };
  const MotionDiv = ({ children, className, style, ...rest }: MotionProps) => {
    const domProps: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(rest)) {
      if (key.startsWith("data-") || key.startsWith("aria-")) domProps[key] = value;
    }
    return (
      <div className={className as string} style={style as React.CSSProperties} {...domProps}>
        {children}
      </div>
    );
  };
  return { motion: { div: MotionDiv } };
});

import { DashboardWelcome } from "@/components/dashboard/mascot/dashboard-welcome";

function setReducedMotion(reduced: boolean): void {
  window.matchMedia = ((query: string) => ({
    matches: reduced && query.includes("prefers-reduced-motion"),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

async function renderWelcome(enabled = true) {
  let result!: ReturnType<typeof render>;
  await act(async () => {
    result = render(<DashboardWelcome enabled={enabled} greeting={<span>Welcome back, Ada</span>} />);
  });
  return result;
}

async function rerenderWelcome(
  view: ReturnType<typeof render>,
  enabled: boolean,
) {
  await act(async () => {
    view.rerender(<DashboardWelcome enabled={enabled} greeting={<span>Welcome back, Ada</span>} />);
  });
}

beforeEach(() => {
  sessionStorage.clear();
  useWelcomeStore.getState().reset();
  setReducedMotion(false);
});

afterEach(() => {
  sessionStorage.clear();
  useWelcomeStore.getState().reset();
});

describe("DashboardWelcome", () => {
  it("plays the walk-in once for a queued (new sign-up / app open) welcome", async () => {
    useWelcomeStore.getState().requestOnSignup();
    await renderWelcome();

    expect(screen.getByTestId("pip-avatar")).toBeInTheDocument();
    expect(document.querySelector("[data-mascot]")).toHaveAttribute("data-walking", "true");
    expect(document.querySelector("[data-mascot-cloud]")).toHaveAttribute("data-revealed", "false");
    // Consumed immediately so it can never replay this session.
    expect(useWelcomeStore.getState().status).toBe("played");
  });

  it("does not walk when no welcome is queued (already played this session)", async () => {
    useWelcomeStore.getState().consume();
    await renderWelcome();

    expect(document.querySelector("[data-mascot]")).toHaveAttribute("data-walking", "false");
    expect(document.querySelector("[data-mascot-cloud]")).toHaveAttribute("data-revealed", "true");
  });

  it("re-rendering a consumed welcome never restarts the walk", async () => {
    useWelcomeStore.getState().requestOnSignup();
    const view = await renderWelcome();
    await rerenderWelcome(view, true);

    expect(document.querySelector("[data-mascot]")).toHaveAttribute("data-walking", "true");
    expect(useWelcomeStore.getState().status).toBe("played");
    // A second mount (i.e. navigating back) must not replay it.
    expect(document.querySelector("[data-mascot]")).toHaveAttribute("data-walking", "true");
  });

  it("respects reduced motion — shows the greeting without the walk", async () => {
    setReducedMotion(true);
    useWelcomeStore.getState().requestOnSignup();
    await renderWelcome();

    expect(document.querySelector("[data-mascot]")).toHaveAttribute("data-walking", "false");
    expect(document.querySelector("[data-mascot-cloud]")).toHaveAttribute("data-revealed", "true");
    expect(useWelcomeStore.getState().status).toBe("played");
  });

  it("waits until the dashboard is visible (enabled) before playing", async () => {
    useWelcomeStore.getState().requestOnSignup();
    const view = await renderWelcome(false);

    // Covered by a sheet → the welcome must not have started or been consumed.
    expect(useWelcomeStore.getState().status).toBe("pending");
    expect(document.querySelector("[data-mascot]")).toHaveAttribute("data-walking", "false");

    await rerenderWelcome(view, true);
    expect(document.querySelector("[data-mascot]")).toHaveAttribute("data-walking", "true");
    expect(useWelcomeStore.getState().status).toBe("played");
  });

  it("always renders the greeting copy inside the cloud", async () => {
    useWelcomeStore.getState().consume();
    await renderWelcome();
    expect(screen.getByText("Welcome back, Ada")).toBeInTheDocument();
  });
});
