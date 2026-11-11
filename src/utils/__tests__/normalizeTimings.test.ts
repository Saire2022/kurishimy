import { normalizeTimings } from "@/utils/normalizeTimings";

describe("normalizeTimings", () => {
  it("returns an empty array for empty input", () => {
    expect(normalizeTimings([])).toEqual([]);
  });

  it("leaves timings already in seconds untouched", () => {
    const timings = [
      { word: "a", start: 0, end: 2.5 },
      { word: "b", start: 2.5, end: 12 },
    ];
    expect(normalizeTimings(timings)).toEqual(timings);
  });

  it("converts millisecond timings to seconds", () => {
    const timings = [
      { word: "a", start: 0, end: 2500 },
      { word: "b", start: 2500, end: 12_000 },
    ];
    expect(normalizeTimings(timings)).toEqual([
      { word: "a", start: 0, end: 2.5 },
      { word: "b", start: 2.5, end: 12 },
    ]);
  });

  it("decides the unit from the largest end, not per entry", () => {
    // The first entry alone looks like seconds; the track as a whole is ms.
    const timings = [
      { word: "a", start: 0, end: 800 },
      { word: "b", start: 800, end: 1600 },
    ];
    expect(normalizeTimings(timings)).toEqual([
      { word: "a", start: 0, end: 0.8 },
      { word: "b", start: 0.8, end: 1.6 },
    ]);
  });

  it("treats a max end of exactly 1000 as seconds", () => {
    const timings = [{ word: "a", start: 0, end: 1000 }];
    expect(normalizeTimings(timings)).toEqual(timings);
  });

  it("treats a max end just above 1000 as milliseconds", () => {
    expect(normalizeTimings([{ word: "a", start: 0, end: 1001 }])).toEqual([
      { word: "a", start: 0, end: 1.001 },
    ]);
  });

  it("preserves the other fields and does not mutate the input", () => {
    const timings = [
      { word: "a", start: 1000, end: 2000, segment: 3, key: "k1" },
    ];
    const snapshot = JSON.parse(JSON.stringify(timings));
    expect(normalizeTimings(timings)).toEqual([
      { word: "a", start: 1, end: 2, segment: 3, key: "k1" },
    ]);
    expect(timings).toEqual(snapshot);
  });
});
