import type { WordTiming } from "@/types/lesson";

export function normalizeTimings(timings: WordTiming[]): WordTiming[] {
  if (timings.length === 0) return [];

  const maxTime = Math.max(...timings.map((t) => t.end));
  const isMs = maxTime > 1000;

  return timings.map((timing) =>
    isMs
      ? { ...timing, start: timing.start / 1000, end: timing.end / 1000 }
      : timing
  );
}
