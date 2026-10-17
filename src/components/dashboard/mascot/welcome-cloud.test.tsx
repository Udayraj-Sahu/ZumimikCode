import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

// framer-motion -> inert divs; the cloud's structure and attributes are what
// matter here, not the entrance transitions.
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

import { WelcomeCloud } from "@/components/dashboard/mascot/welcome-cloud";

describe("WelcomeCloud", () => {
  it("drives its outline and shadow from the theme token, not hard-coded colours", () => {
    const { container } = render(
      <WelcomeCloud revealed showText>
        <span>Welcome back</span>
      </WelcomeCloud>,
    );

    const silhouette = container.querySelector("[aria-hidden='true']") as HTMLElement | null;
    expect(silhouette).not.toBeNull();
    // The rim + ambient shadow must come from the theme-aware token so the same
    // markup separates from the page background in both light and dark mode.
    expect(silhouette?.style.filter).toBe("var(--cloud-shadow-filter)");

    // Every silhouette piece stays filled with the card token (no raw colours).
    const pieces = silhouette?.querySelectorAll(".bg-card") ?? [];
    expect(pieces.length).toBeGreaterThanOrEqual(5);
  });

  it("keeps the contract the welcome sequence reads", () => {
    const { container, getByText } = render(
      <WelcomeCloud revealed={false} showText={false}>
        <span>Welcome back</span>
      </WelcomeCloud>,
    );

    const root = container.querySelector("[data-mascot-cloud='true']");
    expect(root).toHaveAttribute("data-revealed", "false");
    expect(root).toHaveAttribute("data-text", "false");
    expect(getByText("Welcome back")).toBeInTheDocument();
  });
});
