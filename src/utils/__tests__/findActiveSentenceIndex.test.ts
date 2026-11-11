import { findActiveSentenceIndex } from "@/utils/findActiveSentenceIndex";

// Gaps: 0–1 before the first sentence, 3–4 and 6–7 between sentences.
const sentences = [
  { start: 1, end: 3 },
  { start: 4, end: 6 },
  { start: 7, end: 9 },
];

describe("findActiveSentenceIndex", () => {
  it("returns the sentence whose window contains the time", () => {
    expect(findActiveSentenceIndex(sentences, 2)).toBe(0);
    expect(findActiveSentenceIndex(sentences, 5)).toBe(1);
    expect(findActiveSentenceIndex(sentences, 8.5)).toBe(2);
  });

  it("treats start as inclusive and end as exclusive", () => {
    expect(findActiveSentenceIndex(sentences, 4)).toBe(1);
    const contiguous = [
      { start: 0, end: 2 },
      { start: 2, end: 4 },
    ];
    expect(findActiveSentenceIndex(contiguous, 2)).toBe(1);
  });

  it("holds the last started sentence during a silence gap", () => {
    expect(findActiveSentenceIndex(sentences, 3)).toBe(0);
    expect(findActiveSentenceIndex(sentences, 3.5)).toBe(0);
    expect(findActiveSentenceIndex(sentences, 6.9)).toBe(1);
  });

  it("holds the last sentence after the audio has passed its end", () => {
    expect(findActiveSentenceIndex(sentences, 9)).toBe(2);
    expect(findActiveSentenceIndex(sentences, 100)).toBe(2);
  });

  it("returns -1 before the first sentence has started", () => {
    expect(findActiveSentenceIndex(sentences, 0)).toBe(-1);
    expect(findActiveSentenceIndex(sentences, 0.99)).toBe(-1);
  });

  it("returns -1 for an empty list", () => {
    expect(findActiveSentenceIndex([], 5)).toBe(-1);
  });
});
