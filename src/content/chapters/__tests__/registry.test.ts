import { MANIFEST } from "@/content/chapters/manifest";
import {
  createRegistry,
  getChapterIds,
  loadChapter,
} from "@/content/chapters/registry";
import type { ChapterManifestEntry } from "@/types/lesson";

const entry = (id: string, data?: unknown): ChapterManifestEntry => ({
  id,
  chapterNumber: Number(id),
  level: "A1",
  data: data ?? {
    title: `Capítulo ${id}`,
    metadata: { duration: 1000 },
    kichwa: { words: [{ word: "Ari.", start: 0, end: 1 }] },
    spanish: { words: [{ word: "Sí.", start: 0, end: 1 }] },
  },
  audio: 1,
});

describe("createRegistry", () => {
  it("lists ids in manifest order, not sorted", () => {
    const registry = createRegistry([entry("10"), entry("2"), entry("1")]);
    expect(registry.getChapterIds()).toEqual(["10", "2", "1"]);
  });

  it("returns null for an id that is not in the manifest", () => {
    expect(createRegistry([entry("1")]).loadChapter("99")).toBeNull();
  });

  it("returns the same object on repeated loads", () => {
    const registry = createRegistry([entry("1")]);
    expect(registry.loadChapter("1")).toBe(registry.loadChapter("1"));
  });

  it("rejects a manifest with a duplicate id", () => {
    expect(() => createRegistry([entry("1"), entry("1")])).toThrow(
      'Duplicate chapter id "1"',
    );
  });

  describe("with a malformed chapter", () => {
    const globals = globalThis as { __DEV__?: boolean };
    const originalDev = globals.__DEV__;
    afterEach(() => {
      globals.__DEV__ = originalDev;
      jest.restoreAllMocks();
    });

    it("throws in development", () => {
      globals.__DEV__ = true;
      const registry = createRegistry([entry("1", { title: "" })]);
      expect(() => registry.loadChapter("1")).toThrow('Invalid chapter "1"');
    });

    it("logs and returns null in a release build", () => {
      globals.__DEV__ = false;
      const logged = jest.spyOn(console, "error").mockImplementation(() => {});
      const registry = createRegistry([entry("1", { title: "" })]);

      expect(registry.loadChapter("1")).toBeNull();
      expect(registry.loadChapter("1")).toBeNull();
      expect(logged).toHaveBeenCalledTimes(1);
    });
  });
});

// Runs the real content through the loader, so a malformed chapter file or
// manifest entry fails CI instead of reaching a device.
describe("the app manifest", () => {
  it("has at least one chapter", () => {
    expect(getChapterIds().length).toBeGreaterThan(0);
  });

  it.each(MANIFEST.map((e) => e.id))("chapter %s loads", (id) => {
    const chapter = loadChapter(id);
    expect(chapter).not.toBeNull();
    expect(chapter?.meta.id).toBe(id);
  });

  it("has unique chapter numbers", () => {
    const numbers = MANIFEST.map((e) => e.chapterNumber);
    expect(new Set(numbers).size).toBe(numbers.length);
  });
});
