/** What is remembered about one chapter between sessions. */
export interface ChapterProgress {
  /** Where to resume, in ms. 0 once the chapter has been finished. */
  positionMs: number;
  /** True once the chapter has been played to the end at least once. */
  completed: boolean;
  /** When the chapter was last open (ms since epoch). */
  lastOpenedAt: number;
}

export type ProgressMap = Record<string, ChapterProgress>;

/**
 * Stopping this close to the end counts as finishing: resuming there would
 * drop the listener into the last second of audio.
 */
export const END_THRESHOLD_MS = 2000;

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Reads the stored JSON. Anything unreadable is dropped rather than thrown:
 * losing a bookmark is better than an app that cannot open.
 */
export function parseStoredProgress(raw: string | null): ProgressMap {
  if (!raw) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return {};
  }

  const result: ProgressMap = {};
  for (const [chapterId, value] of Object.entries(parsed)) {
    if (typeof value !== "object" || value === null) continue;
    const { positionMs, completed, lastOpenedAt } = value as Record<
      string,
      unknown
    >;
    if (!isFiniteNumber(positionMs) || positionMs < 0) continue;
    result[chapterId] = {
      positionMs,
      completed: completed === true,
      lastOpenedAt: isFiniteNumber(lastOpenedAt) ? lastOpenedAt : 0,
    };
  }
  return result;
}

/**
 * The record to store for a playback position. Reaching the end marks the
 * chapter completed and rewinds the bookmark to 0, so reopening a finished
 * chapter starts from the beginning. `completed` never goes back to false.
 */
export function toStoredProgress(input: {
  positionMs: number;
  durationMs: number;
  previous: ChapterProgress | undefined;
  now: number;
}): ChapterProgress {
  const { positionMs, durationMs, previous, now } = input;
  const reachedEnd =
    durationMs > 0 && positionMs >= durationMs - END_THRESHOLD_MS;
  return {
    positionMs: reachedEnd ? 0 : Math.max(0, Math.round(positionMs)),
    completed: reachedEnd || previous?.completed === true,
    lastOpenedAt: now,
  };
}

/** Where playback should start when a chapter is opened, in ms. */
export function resumePositionMs(
  progress: ChapterProgress | undefined,
  durationMs: number,
): number {
  if (!progress) return 0;
  const { positionMs } = progress;
  if (positionMs <= 0) return 0;
  // A bookmark at or past the end (e.g. the audio file got shorter).
  if (durationMs > 0 && positionMs >= durationMs - END_THRESHOLD_MS) return 0;
  return positionMs;
}

/** How far through the chapter the bookmark is, from 0 to 1. */
export function progressFraction(
  progress: ChapterProgress | undefined,
  durationMs: number,
): number {
  if (!progress || durationMs <= 0) return 0;
  return Math.min(1, Math.max(0, progress.positionMs / durationMs));
}

/**
 * The chapter to offer under "Continuar": the most recently opened one that
 * was left part-way through. Chapters not in `chapterIds` are ignored.
 */
export function findContinueChapterId(
  progress: ProgressMap,
  chapterIds: readonly string[],
): string | null {
  let best: string | null = null;
  for (const id of chapterIds) {
    const entry = progress[id];
    if (!entry || entry.positionMs <= 0) continue;
    if (best === null || entry.lastOpenedAt > progress[best].lastOpenedAt) {
      best = id;
    }
  }
  return best;
}
