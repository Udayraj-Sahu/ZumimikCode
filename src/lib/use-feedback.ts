import { useCallback } from "react";
import { useSettingsStore } from "@/stores/settings-store";
import * as sound from "./sound";
import * as haptics from "./haptics";

export function useFeedback() {
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const hapticEnabled = useSettingsStore((s) => s.hapticEnabled);

  const correct = useCallback(() => {
    if (soundEnabled) sound.playCorrect();
    if (hapticEnabled) haptics.hapticCorrect();
  }, [soundEnabled, hapticEnabled]);

  const wrong = useCallback(() => {
    if (soundEnabled) sound.playWrong();
    if (hapticEnabled) haptics.hapticWrong();
  }, [soundEnabled, hapticEnabled]);

  const complete = useCallback(() => {
    if (soundEnabled) sound.playComplete();
    if (hapticEnabled) haptics.hapticComplete();
  }, [soundEnabled, hapticEnabled]);

  const tap = useCallback(() => {
    if (soundEnabled) sound.playTap();
    if (hapticEnabled) haptics.hapticTap();
  }, [soundEnabled, hapticEnabled]);

  const countdown = useCallback(() => {
    if (soundEnabled) sound.playCountdown();
    if (hapticEnabled) haptics.hapticTap();
  }, [soundEnabled, hapticEnabled]);

  const duelResult = useCallback((won: boolean) => {
    if (soundEnabled) won ? sound.playDuelWin() : sound.playDuelLose();
    if (hapticEnabled) haptics.hapticDuel();
  }, [soundEnabled, hapticEnabled]);

  return { correct, wrong, complete, tap, countdown, duelResult };
}
