import {
  END_THRESHOLD_MS,
  parseStoredProgress,
  progressFraction,
  resumePositionMs,
  toStoredProgress,
} from "@/features/progress/progress";

const DURATION = 800_000;

describe("parseStoredProgress", () => {
  it("returns an empty map when nothing is stored", () => {
    expect(parseStoredProgress(null)).toEqual({});
    expect(parseStoredProgress("")).toEqual({});
  });

  it("reads back what was stored", () => {
    const stored = {
      "1": { positionMs: 660_000, completed: false, lastOpenedAt: 1000 },
      "2": { positionMs: 0, completed: true, lastOpenedAt: 2000 },
    };
    expect(parseStoredProgress(JSON.stringify(stored))).toEqual(stored);
  });

  it.each(["not json", "[]", "null", '"text"', "42"])(
    "returns an empty map for unusable data: %s",
    (raw) => {
      expect(parseStoredProgress(raw)).toEqual({});
    },
  );

  it("drops entries without a usable position and keeps the rest", () => {
    const raw = JSON.stringify({
      good: { positionMs: 5000, completed: false, lastOpenedAt: 1 },
      noPosition: { completed: true, lastOpenedAt: 1 },
      negative: { positionMs: -5, completed: false, lastOpenedAt: 1 },
      text: { positionMs: "5000", completed: false, lastOpenedAt: 1 },
      notAnObject: 12,
      nothing: null,
    });
    expect(Object.keys(parseStoredProgress(raw))).toEqual(["good"]);
  });

  it("defaults a missing completed flag and timestamp", () => {
    const raw = JSON.stringify({ "1": { positionMs: 5000 } });
    expect(parseStoredProgress(raw)).toEqual({
      "1": { positionMs: 5000, completed: false, lastOpenedAt: 0 },
    });
  });
});

describe("toStoredProgress", () => {
  it("stores the position mid-chapter", () => {
    expect(
      toStoredProgress({
        positionMs: 660_000.4,
        durationMs: DURATION,
        previous: undefined,
        now: 123,
      }),
    ).toEqual({ positionMs: 660_000, completed: false, lastOpenedAt: 123 });
  });

  it("marks the chapter completed and rewinds at the end", () => {
    expect(
      toStoredProgress({
        positionMs: DURATION,
        durationMs: DURATION,
        previous: undefined,
        now: 123,
      }),
    ).toEqual({ positionMs: 0, completed: true, lastOpenedAt: 123 });
  });

  it("treats the last moments of the chapter as the end", () => {
    const justInside = toStoredProgress({
      positionMs: DURATION - END_THRESHOLD_MS,
      durationMs: DURATION,
      previous: undefined,
      now: 1,
    });
    const justOutside = toStoredProgress({
      positionMs: DURATION - END_THRESHOLD_MS - 1,
      durationMs: DURATION,
      previous: undefined,
      now: 1,
    });
    expect(justInside).toMatchObject({ positionMs: 0, completed: true });
    expect(justOutside).toMatchObject({ completed: false });
    expect(justOutside.positionMs).toBeGreaterThan(0);
  });

  it("keeps a chapter completed while it is being replayed", () => {
    expect(
      toStoredProgress({
        positionMs: 30_000,
        durationMs: DURATION,
        previous: { positionMs: 0, completed: true, lastOpenedAt: 1 },
        now: 2,
      }),
    ).toEqual({ positionMs: 30_000, completed: true, lastOpenedAt: 2 });
  });

  it("does not call a chapter finished while the duration is unknown", () => {
    expect(
      toStoredProgress({
        positionMs: 0,
        durationMs: 0,
        previous: undefined,
        now: 1,
      }),
    ).toEqual({ positionMs: 0, completed: false, lastOpenedAt: 1 });
  });

  it("never stores a negative position", () => {
    expect(
      toStoredProgress({
        positionMs: -50,
        durationMs: DURATION,
        previous: undefined,
        now: 1,
      }).positionMs,
    ).toBe(0);
  });
});

describe("resumePositionMs", () => {
  const at = (positionMs: number, completed = false) => ({
    positionMs,
    completed,
    lastOpenedAt: 1,
  });

  it("starts at 0 without saved progress", () => {
    expect(resumePositionMs(undefined, DURATION)).toBe(0);
  });

  it("resumes at the saved position", () => {
    expect(resumePositionMs(at(660_000), DURATION)).toBe(660_000);
  });

  it("starts a finished chapter from the beginning", () => {
    const finished = toStoredProgress({
      positionMs: DURATION,
      durationMs: DURATION,
      previous: at(660_000),
      now: 2,
    });
    expect(resumePositionMs(finished, DURATION)).toBe(0);
  });

  it("resumes a completed chapter that is being replayed", () => {
    expect(resumePositionMs(at(30_000, true), DURATION)).toBe(30_000);
  });

  it("starts at 0 when the bookmark is at or past the end", () => {
    expect(resumePositionMs(at(DURATION - 500), DURATION)).toBe(0);
    expect(resumePositionMs(at(DURATION + 60_000), DURATION)).toBe(0);
  });
});

describe("progressFraction", () => {
  it("is the share of the chapter already played", () => {
    expect(
      progressFraction(
        { positionMs: 200_000, completed: false, lastOpenedAt: 1 },
        DURATION,
      ),
    ).toBe(0.25);
  });

  it("is 0 without progress or without a duration", () => {
    expect(progressFraction(undefined, DURATION)).toBe(0);
    expect(
      progressFraction(
        { positionMs: 5000, completed: false, lastOpenedAt: 1 },
        0,
      ),
    ).toBe(0);
  });

  it("never exceeds 1", () => {
    expect(
      progressFraction(
        { positionMs: DURATION * 2, completed: false, lastOpenedAt: 1 },
        DURATION,
      ),
    ).toBe(1);
  });
});
