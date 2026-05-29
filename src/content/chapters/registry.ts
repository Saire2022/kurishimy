import type { ChapterContent } from "@/types/lesson";
import { normalizeTimings } from "@/utils/normalizeTimings";

import chapter1Data from "../../../lessons/Chapter1.json";
import kichwaAlignment from "../../../lessons/alignment_output.json";

const chapter1Audio = require("../../../assets/audio/cap1.mp3");

function loadChapter1(): ChapterContent {
  const data = chapter1Data as {
    title: string;
    metadata: { chapter: number; duration: number };
    spanish: { words: { word: string; start: number; end: number }[] };
  };

  return {
    meta: {
      id: "1",
      title: data.title,
      chapterNumber: data.metadata.chapter,
      durationMs: data.metadata.duration,
    },
    kichwaWords: normalizeTimings(kichwaAlignment),
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
  return loader ? loader() : null;
}
