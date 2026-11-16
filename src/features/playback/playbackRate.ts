/** The speeds the lesson player offers, in the order the control cycles. */
export const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5] as const;

export type PlaybackRate = (typeof PLAYBACK_RATES)[number];

export const DEFAULT_PLAYBACK_RATE: PlaybackRate = 1;

export function isPlaybackRate(value: unknown): value is PlaybackRate {
  return PLAYBACK_RATES.includes(value as PlaybackRate);
}

/** The rate after `rate` in the cycle, wrapping from the fastest to the slowest. */
export function nextPlaybackRate(rate: PlaybackRate): PlaybackRate {
  const index = PLAYBACK_RATES.indexOf(rate);
  return PLAYBACK_RATES[(index + 1) % PLAYBACK_RATES.length];
}

/** "0.75×", "1×", "1.25×", "1.5×". */
export function formatPlaybackRate(rate: PlaybackRate): string {
  return `${rate}×`;
}

/**
 * The rate held in storage, or the default when nothing usable is there:
 * never stored, corrupt, or a speed this version no longer offers.
 */
export function parseStoredPlaybackRate(raw: string | null): PlaybackRate {
  if (raw === null) return DEFAULT_PLAYBACK_RATE;
  try {
    const value: unknown = JSON.parse(raw);
    return isPlaybackRate(value) ? value : DEFAULT_PLAYBACK_RATE;
  } catch {
    return DEFAULT_PLAYBACK_RATE;
  }
}
