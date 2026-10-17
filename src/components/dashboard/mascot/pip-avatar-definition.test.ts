import { describe, expect, it } from "vitest";
import { pipDefinitionForAccent } from "@/components/dashboard/mascot/pip-avatar-definition";
import definition from "@/components/dashboard/mascot/pip.avatar.json";

describe("pipDefinitionForAccent", () => {
  it("recolors the body to the given accent and leaves the eyes unchanged", () => {
    const recolored = pipDefinitionForAccent("#A78BFA");
    expect(recolored.colors.body).toBe("#a78bfa");
    expect(recolored.colors.eyes).toBe(definition.colors.eyes);
  });

  it("lowercases the accent to satisfy the engine's color schema", () => {
    // Uppercase hex is rejected by the engine's `^#[0-9a-f]{6}$` validation.
    expect(pipDefinitionForAccent("#C8FF5A").colors.body).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("does not mutate the base definition", () => {
    const before = definition.colors.body;
    pipDefinitionForAccent("#22D3EE");
    expect(definition.colors.body).toBe(before);
  });

  it("keeps the lime default visually identical to the shipped mascot", () => {
    expect(pipDefinitionForAccent("#C8FF5A").colors.body.toLowerCase()).toBe(
      definition.colors.body.toLowerCase(),
    );
  });
});
