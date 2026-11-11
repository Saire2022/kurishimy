import { buildChapter } from "@/content/chapters/buildChapter";
import type { ChapterManifestEntry } from "@/types/lesson";

const validData = () => ({
  title: "Título",
  metadata: { chapter: 1, duration: 5000 },
  kichwa: {
    words: [
      { word: "Ari.", start: 0, end: 2000 },
      { word: "Kayman.", start: 2000, end: 5000 },
    ],
  },
  spanish: {
    words: [
      { word: "Sí.", start: 0, end: 2000 },
      { word: "Por acá.", start: 2000, end: 5000 },
    ],
  },
});

const entryWith = (data: unknown): ChapterManifestEntry => ({
  id: "7",
  chapterNumber: 7,
  level: "B1",
  data,
  audio: 42,
});

/** A valid chapter with one change applied, for the failure cases. */
const broken = (change: (data: any) => void) => {
  const data = validData();
  change(data);
  return entryWith(data);
};

describe("buildChapter", () => {
  it("builds the chapter from the manifest entry and its JSON", () => {
    const chapter = buildChapter(entryWith(validData()));

    expect(chapter.meta).toEqual({
      id: "7",
      title: "Título",
      chapterNumber: 7,
      level: "B1",
      durationMs: 5000,
    });
    expect(chapter.audio).toBe(42);
    expect(chapter.kichwaWords.map((w) => w.word)).toEqual(["Ari.", "Kayman."]);
    expect(chapter.spanishWords.map((w) => w.word)).toEqual([
      "Sí.",
      "Por acá.",
    ]);
  });

  it("converts millisecond timings to seconds", () => {
    const chapter = buildChapter(entryWith(validData()));
    expect(chapter.kichwaWords[1]).toMatchObject({ start: 2, end: 5 });
    expect(chapter.spanishWords[1]).toMatchObject({ start: 2, end: 5 });
  });

  it.each<[string, unknown]>([
    ["null", null],
    ["a string", "chapter"],
    ["an array", []],
  ])("rejects data that is %s", (_label, data) => {
    expect(() => buildChapter(entryWith(data))).toThrow(
      'Invalid chapter "7": chapter data must be an object',
    );
  });

  it.each<[string, (data: any) => void, string]>([
    ["a missing title", (d) => delete d.title, '"title"'],
    ["a blank title", (d) => (d.title = "  "), '"title"'],
    ["missing metadata", (d) => delete d.metadata, '"metadata.duration"'],
    [
      "a zero duration",
      (d) => (d.metadata.duration = 0),
      '"metadata.duration"',
    ],
    [
      "a non-numeric duration",
      (d) => (d.metadata.duration = "5000"),
      '"metadata.duration"',
    ],
    ["a missing track", (d) => delete d.spanish, '"spanish.words"'],
    ["a track without words", (d) => delete d.kichwa.words, '"kichwa.words"'],
    ["an empty track", (d) => (d.kichwa.words = []), '"kichwa.words" is empty'],
    [
      "an entry that is not an object",
      (d) => (d.kichwa.words[1] = "Kayman."),
      '"kichwa.words[1]"',
    ],
    [
      "an entry with an empty word",
      (d) => (d.spanish.words[0].word = ""),
      '"spanish.words[0]"',
    ],
    [
      "an entry with a non-numeric time",
      (d) => (d.spanish.words[1].start = "2000"),
      '"spanish.words[1]"',
    ],
    [
      "an entry with a NaN time",
      (d) => (d.kichwa.words[0].end = NaN),
      '"kichwa.words[0]"',
    ],
    [
      "an entry that ends before it starts",
      (d) => (d.kichwa.words[0].end = -1),
      "invalid time window",
    ],
    [
      "tracks of different lengths",
      (d) => d.spanish.words.pop(),
      "kichwa has 2 sentences but spanish has 1",
    ],
    [
      "tracks whose timings disagree",
      (d) => (d.spanish.words[1].start = 2500),
      "sentence 1 has different timings",
    ],
  ])("rejects %s", (_label, change, message) => {
    const build = () => buildChapter(broken(change));
    expect(build).toThrow('Invalid chapter "7"');
    expect(build).toThrow(message);
  });
});
