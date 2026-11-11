interface TimeWindow {
  start: number;
  end: number;
}

/**
 * Index of the sentence being spoken at `timeInSeconds`.
 *
 * During a silence between sentences (or after the last one) this holds the
 * last sentence that has already started. Returns -1 when nothing has started
 * yet, or when there are no sentences.
 */
export function findActiveSentenceIndex(
  sentences: readonly TimeWindow[],
  timeInSeconds: number,
): number {
  const idx = sentences.findIndex(
    (s) => timeInSeconds >= s.start && timeInSeconds < s.end,
  );
  if (idx !== -1) return idx;
  for (let i = sentences.length - 1; i >= 0; i--) {
    if (timeInSeconds >= sentences[i].start) return i;
  }
  return -1;
}
