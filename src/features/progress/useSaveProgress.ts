import { useCallback, useEffect, useRef } from "react";
import { AppState } from "react-native";
import { toStoredProgress } from "./progress";
import { getProgressState, saveChapterProgress } from "./progressStore";

/** Minimum gap between writes while audio is playing. */
const SAVE_INTERVAL_MS = 5000;

interface UseSaveProgressOptions {
  chapterId: string;
  currentTime: number;
  durationMs: number;
  isPlaying: boolean;
  didJustFinish: boolean;
  /**
   * False until the player has loaded and jumped to the resume point. Saving
   * before that would overwrite the bookmark with 0.
   */
  enabled: boolean;
}

/**
 * Keeps the chapter's bookmark up to date: when it is opened, every few
 * seconds during playback, and on pause, finish, backgrounding and leaving
 * the screen — not on every playback tick.
 */
export function useSaveProgress(options: UseSaveProgressOptions) {
  const { chapterId, currentTime, isPlaying, didJustFinish, enabled } = options;

  // Latest values for the callbacks that fire outside render (unmount,
  // app backgrounding), which would otherwise see a stale position.
  const latest = useRef(options);
  latest.current = options;
  const lastSavedAt = useRef(0);

  const save = useCallback(
    (finished = false) => {
      const current = latest.current;
      if (!current.enabled) return;
      const now = Date.now();
      lastSavedAt.current = now;
      saveChapterProgress(
        chapterId,
        toStoredProgress({
          positionMs: finished ? current.durationMs : current.currentTime,
          durationMs: current.durationMs,
          previous: getProgressState().byChapter[chapterId],
          now,
        }),
      );
    },
    [chapterId],
  );

  // Opening the chapter makes it the most recent one.
  useEffect(() => {
    if (enabled) save();
  }, [enabled, save]);

  useEffect(() => {
    if (!isPlaying) return;
    if (Date.now() - lastSavedAt.current >= SAVE_INTERVAL_MS) save();
  }, [currentTime, isPlaying, save]);

  const wasPlaying = useRef(false);
  useEffect(() => {
    if (wasPlaying.current && !isPlaying) save();
    wasPlaying.current = isPlaying;
  }, [isPlaying, save]);

  useEffect(() => {
    if (didJustFinish) save(true);
  }, [didJustFinish, save]);

  // A force-quit gives no unmount, so also save when the app leaves the
  // foreground — the last chance before the OS may kill it.
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (appState) => {
      if (appState !== "active") save();
    });
    return () => subscription.remove();
  }, [save]);

  useEffect(() => () => save(), [save]);
}
