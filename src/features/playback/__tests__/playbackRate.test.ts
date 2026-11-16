import {
  DEFAULT_PLAYBACK_RATE,
  PLAYBACK_RATES,
  formatPlaybackRate,
  nextPlaybackRate,
  parseStoredPlaybackRate,
} from "@/features/playback/playbackRate";

describe("nextPlaybackRate", () => {
  it("cycles 0.75 → 1 → 1.25 → 1.5 and wraps back to 0.75", () => {
    expect(nextPlaybackRate(0.75)).toBe(1);
    expect(nextPlaybackRate(1)).toBe(1.25);
    expect(nextPlaybackRate(1.25)).toBe(1.5);
    expect(nextPlaybackRate(1.5)).toBe(0.75);
  });

  it("visits every rate once before repeating", () => {
    const seen = new Set<number>();
    let rate = DEFAULT_PLAYBACK_RATE;
    for (let i = 0; i < PLAYBACK_RATES.length; i++) {
      seen.add(rate);
      rate = nextPlaybackRate(rate);
    }
    expect(seen.size).toBe(PLAYBACK_RATES.length);
    expect(rate).toBe(DEFAULT_PLAYBACK_RATE);
  });
});

describe("formatPlaybackRate", () => {
  it("drops trailing zeros", () => {
    expect(PLAYBACK_RATES.map(formatPlaybackRate)).toEqual([
      "0.75×",
      "1×",
      "1.25×",
      "1.5×",
    ]);
  });
});

describe("parseStoredPlaybackRate", () => {
  it("reads back each offered rate", () => {
    for (const rate of PLAYBACK_RATES) {
      expect(parseStoredPlaybackRate(JSON.stringify(rate))).toBe(rate);
    }
  });

  it.each([
    ["nothing stored", null],
    ["corrupt JSON", "{not json"],
    ["a rate that is not offered", "2"],
    ["a string", '"1.5"'],
    ["an object", '{"rate":1.5}'],
  ])("falls back to 1× for %s", (_label, raw) => {
    expect(parseStoredPlaybackRate(raw)).toBe(1);
  });
});
