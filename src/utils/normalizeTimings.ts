import type { WordTiming } from "@/types/lesson";

/** Values above this threshold are treated as milliseconds */
const MS_THRESHOLD = 100;

export function normalizeToSeconds(timing: WordTiming): WordTiming {
  if (timing.start > MS_THRESHOLD) {
    return {
      ...timing,
      start: timing.start / 1000,
      end: timing.end / 1000,
    };
  }
  return timing;
}

export function normalizeTimings(timings: WordTiming[]): WordTiming[] {
  return timings.map(normalizeToSeconds);
}
