import type { ChapterContent, ChapterManifestEntry } from "@/types/lesson";
import { buildChapter } from "./buildChapter";
import { MANIFEST } from "./manifest";

/**
 * Looks chapters up in a manifest and builds each one at most once, so
 * callers get the same object (and the same timing arrays) on every call.
 */
export function createRegistry(manifest: readonly ChapterManifestEntry[]) {
  const entries = new Map<string, ChapterManifestEntry>();
  for (const entry of manifest) {
    if (entries.has(entry.id)) {
      throw new Error(`Duplicate chapter id "${entry.id}" in the manifest`);
    }
    entries.set(entry.id, entry);
  }
  const cache = new Map<string, ChapterContent | null>();

  return {
    /** Chapter ids in manifest order. */
    getChapterIds(): string[] {
      return manifest.map((entry) => entry.id);
    },

    /**
     * The chapter, or null if the id is not in the manifest. A chapter whose
     * JSON is malformed throws in development; in a release build it is
     * logged and treated as missing rather than crashing the app.
     */
    loadChapter(chapterId: string): ChapterContent | null {
      const cached = cache.get(chapterId);
      if (cached !== undefined) return cached;

      const entry = entries.get(chapterId);
      if (!entry) return null;

      let chapter: ChapterContent | null = null;
      try {
        chapter = buildChapter(entry);
      } catch (err) {
        if (__DEV__) throw err;
        console.error(err);
      }
      cache.set(chapterId, chapter);
      return chapter;
    },
  };
}

export const { getChapterIds, loadChapter } = createRegistry(MANIFEST);
