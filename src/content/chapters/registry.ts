import type { ChapterContent } from "@/types/lesson";
import { normalizeTimings } from "@/utils/normalizeTimings";

import chapter1Data from "./Chapter1.json";
const chapter1Audio = require("../../../assets/audio/cap1.mp3") as number;

function loadChapter1(): ChapterContent {
  const data = chapter1Data as {
    title: string;
    metadata: { chapter: number; duration: number };
    kichwa: { words: { word: string; start: number; end: number }[] };
    spanish: { words: { word: string; start: number; end: number }[] };
  };

  return {
    meta: {
      id: "1",
      title: data.title,
      chapterNumber: data.metadata.chapter,
      durationMs: data.metadata.duration,
    },
    // Both tracks are sentence-level with identical timing boundaries, so the
    // two panels stay in sync and behave the same way.
    kichwaWords: normalizeTimings(data.kichwa.words),
    spanishWords: normalizeTimings(data.spanish.words),
    audio: chapter1Audio,
  };
}

const chapters: Record<string, () => ChapterContent> = {
  "1": loadChapter1,
};

export function getChapterIds(): string[] {
  return Object.keys(chapters);
}

export function loadChapter(chapterId: string): ChapterContent | null {
  const loader = chapters[chapterId];
  if (!loader) return null;
  try {
    return loader();
  } catch (err) {
    console.error(`Failed to load chapter "${chapterId}":`, err);
    return null;
  }
}
