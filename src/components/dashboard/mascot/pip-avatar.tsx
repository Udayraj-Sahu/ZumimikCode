"use client";

/**
 * Mascot renderer — Exam Arena dashboard only.
 *
 * Engine: @bible-strong/avatar-react + @bible-strong/avatar-core, licensed
 * AGPL-3.0-only. Source: https://github.com/smontlouis/bible-strong-avatar-lab
 *
 * The definition in ./pip.avatar.json was assembled PROGRAMMATICALLY from the
 * open-source Avatar Lab default starters (the "Strobi" sphere body recolored to
 * the Exam Arena lime palette) and validated against the published
 * avatar-definition v1 JSON schema. To customise it later, open
 * https://avatars.bible-strong.app/ → BUILD → Export, then replace
 * ./pip.avatar.json with the downloaded file. Do not hand-edit the JSON.
 */

import type { ComponentProps } from "react";
import { createAvatar } from "@bible-strong/avatar-react";
import "@bible-strong/avatar-react/styles.css";
import definition from "./pip.avatar.json";

const Pip = createAvatar(definition);

type MascotAnimation = "waking" | "idle";
type MascotExpression = NonNullable<ComponentProps<typeof Pip>["expression"]>;

type PipAvatarProps = {
  /** Controlled timeline. Mutually exclusive with `expression`. */
  animation?: MascotAnimation;
  /** Controlled still target (used when the visitor prefers reduced motion). */
  expression?: MascotExpression;
};

export default function PipAvatar({ animation, expression }: PipAvatarProps) {
  return <Pip animation={animation} expression={expression} size="100%" />;
}
