import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useWelcomeStore, type WelcomeStatus } from "@/stores/welcome-store";

const KEY = "zuzumik-welcome";

function storedStatus(): WelcomeStatus | null {
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  return (JSON.parse(raw) as { status: WelcomeStatus }).status;
}

beforeEach(() => {
  sessionStorage.clear();
  useWelcomeStore.getState().reset();
});

afterEach(() => {
  sessionStorage.clear();
  useWelcomeStore.getState().reset();
});

describe("welcome store — session-gated dashboard welcome", () => {
  it("starts idle with no persisted entry", () => {
    expect(useWelcomeStore.getState().status).toBe("idle");
    expect(sessionStorage.getItem(KEY)).toBeNull();
  });

  it("requests a welcome on a cold app open", () => {
    useWelcomeStore.getState().requestOnAppOpen();
    expect(useWelcomeStore.getState().status).toBe("pending");
    expect(storedStatus()).toBe("pending");
  });

  it("does NOT re-queue on app open once a welcome already played this session", () => {
    useWelcomeStore.getState().requestOnAppOpen();
    useWelcomeStore.getState().consume();
    expect(useWelcomeStore.getState().status).toBe("played");

    useWelcomeStore.getState().requestOnAppOpen();
    expect(useWelcomeStore.getState().status).toBe("played");
  });

  it("always queues on a fresh sign-up, even after one already played", () => {
    useWelcomeStore.getState().requestOnAppOpen();
    useWelcomeStore.getState().consume();
    useWelcomeStore.getState().requestOnSignup();
    expect(useWelcomeStore.getState().status).toBe("pending");
  });

  it("consumes a pending welcome so it never replays within the session", () => {
    useWelcomeStore.getState().requestOnSignup();
    useWelcomeStore.getState().consume();
    expect(useWelcomeStore.getState().status).toBe("played");

    // Simulate any number of re-renders / route mounts re-reading the status.
    expect(useWelcomeStore.getState().status).not.toBe("pending");
  });

  it("persists played status to sessionStorage (survives refresh, not a new session)", () => {
    useWelcomeStore.getState().requestOnSignup();
    useWelcomeStore.getState().consume();
    expect(storedStatus()).toBe("played");

    // A reload re-reads sessionStorage; the queued flag is gone so it stays played.
    sessionStorage.setItem(KEY, JSON.stringify({ status: "played" }));
    expect(storedStatus()).toBe("played");
  });

  it("reset clears both memory and the persisted session entry", () => {
    useWelcomeStore.getState().requestOnSignup();
    useWelcomeStore.getState().reset();
    expect(useWelcomeStore.getState().status).toBe("idle");
    expect(sessionStorage.getItem(KEY)).toBeNull();
  });

  it("ignores a corrupt persisted value and falls back to idle", async () => {
    vi.resetModules();
    sessionStorage.setItem(KEY, "{not-json");
    const mod = await import("@/stores/welcome-store");
    expect(mod.useWelcomeStore.getState().status).toBe("idle");
  });

  it("rehydrates a persisted played status from sessionStorage", async () => {
    vi.resetModules();
    sessionStorage.setItem(KEY, JSON.stringify({ status: "played" }));
    const mod = await import("@/stores/welcome-store");
    expect(mod.useWelcomeStore.getState().status).toBe("played");
  });
});
