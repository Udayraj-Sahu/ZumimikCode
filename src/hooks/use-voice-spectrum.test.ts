import { describe, expect, it } from "vitest";

import { buildBandRanges, smoothInto } from "@/hooks/use-voice-spectrum";

/** Mirrors what the hook asks the analyser for at 48kHz / fftSize 256. */
const OPTIONS = { binCount: 128, bars: 28, fftSize: 256, sampleRate: 48_000 };

describe("buildBandRanges", () => {
  it("leaves no unlistened bins between neighbouring bands", () => {
    const bands = buildBandRanges(OPTIONS);
    for (let i = 1; i < bands.length; i += 1) {
      // Bands may overlap (that is deliberate — it stops dead bins appearing
      // between bars) but must never leave a gap.
      expect(bands[i - 1][1]).toBeGreaterThanOrEqual(bands[i][0]);
    }
  });

  it("starts above DC and stops at the voice ceiling", () => {
    const bands = buildBandRanges(OPTIONS);
    expect(bands[0][0]).toBe(1);

    const top = bands[bands.length - 1][1];
    expect(top).toBeLessThanOrEqual(OPTIONS.binCount);
    // 3.5kHz at 48kHz across a 256-point FFT is bin ~19, so anything past ~21 is
    // hiss and would only jitter the crest.
    expect(top).toBeLessThanOrEqual(21);
  });

  it("gives every band at least one bin even when bars outnumber bins", () => {
    const bands = buildBandRanges({ binCount: 4, bars: 28, fftSize: 256, sampleRate: 48_000 });
    expect(bands).toHaveLength(28);
    for (const [start, end] of bands) {
      expect(end).toBeGreaterThan(start);
    }
  });

  it("widens bands toward the top instead of leaving them hairline", () => {
    const bands = buildBandRanges(OPTIONS);
    const width = (i: number) => bands[i][1] - bands[i][0];
    // Log spacing: early bands are sub-bin, later ones are several bins wide.
    expect(width(bands.length - 1)).toBeGreaterThanOrEqual(width(0));
  });

  it("returns nothing for a degenerate request", () => {
    expect(buildBandRanges({ binCount: 128, bars: 0, fftSize: 256, sampleRate: 48_000 })).toEqual([]);
    expect(buildBandRanges({ binCount: 0, bars: 28, fftSize: 256, sampleRate: 48_000 })).toEqual([]);
  });

  it("never indexes past the analyser's bin count", () => {
    const bands = buildBandRanges({ ...OPTIONS, sampleRate: 8_000 });
    for (const [, end] of bands) expect(end).toBeLessThanOrEqual(OPTIONS.binCount);
  });
});

describe("smoothInto", () => {
  it("rises toward a louder target and never overshoots it", () => {
    const smoothed = [0, 0, 0];
    smoothInto([1, 1, 1], smoothed);
    for (const level of smoothed) {
      expect(level).toBeGreaterThan(0);
      expect(level).toBeLessThanOrEqual(1);
    }
  });

  it("attacks faster than it releases, so the crest does not strobe", () => {
    const up = [0];
    smoothInto([1], up, 0.55, 0.14);
    expect(up[0]).toBeCloseTo(0.55, 5);

    const down = [0.55];
    smoothInto([0], down, 0.55, 0.14);
    expect(down[0]).toBeCloseTo(0.55 * (1 - 0.14), 5);
    expect(down[0]).toBeLessThan(up[0]);
  });

  it("converges on the target instead of drifting", () => {
    const smoothed = [0, 0, 0];
    const target = [0.2, 0.5, 0.9];
    for (let i = 0; i < 400; i += 1) smoothInto(target, smoothed);
    smoothed.forEach((level, i) => expect(level).toBeCloseTo(target[i], 2));
  });

  it("clamps out-of-range and non-finite input so no bar can be thrown off screen", () => {
    const smoothed = [0.5, 0.5, 0.5, 0.5];
    smoothInto([-4, 9, Number.NaN, Number.POSITIVE_INFINITY], smoothed);
    for (const level of smoothed) {
      expect(Number.isFinite(level)).toBe(true);
      expect(level).toBeGreaterThanOrEqual(0);
      expect(level).toBeLessThanOrEqual(1);
    }
  });

  it("reports the loudest band so auto-gain can be driven from the same pass", () => {
    const smoothed = [0, 0, 0];
    expect(smoothInto([0.1, 0.8, 0.4], smoothed)).toBeCloseTo(Math.max(...smoothed), 6);
  });

  it("treats a missing target value as silence rather than freezing the band", () => {
    const smoothed = [0.4, 0.4, 0.4];
    smoothInto([1], smoothed);
    expect(smoothed).toHaveLength(3);
    // Band 0 hears something and rises; the others have no input and fall away.
    expect(smoothed[0]).toBeGreaterThan(0.4);
    expect(smoothed[1]).toBeLessThan(0.4);
    expect(smoothed[2]).toBeLessThan(0.4);
  });

  it("works on a Float32Array without leaving stale values", () => {
    const smoothed = new Float32Array(3);
    for (let i = 0; i < 50; i += 1) smoothInto([0.5, 0.5, 0.5], smoothed);
    for (const level of smoothed) expect(level).toBeCloseTo(0.5, 2);
  });
});