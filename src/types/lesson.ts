export type ViewMode = "kichwa" | "spanish" | "dual";

export interface WordTiming {
  word: string;
  start: number;
  end: number;
  segment?: number;
  key?: string;
}

/** CEFR difficulty level of a chapter. */
export type ChapterLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface ChapterMeta {
  id: string;
  title: string;
  chapterNumber: number;
  level: ChapterLevel;
  durationMs: number;
}

/**
 * One chapter in the static manifest. Metro cannot resolve dynamic
 * `require()`, so `data` and `audio` must be literal `require(...)` calls.
 */
export interface ChapterManifestEntry {
  id: string;
  chapterNumber: number;
  level: ChapterLevel;
  /** The chapter JSON; its shape is checked when the chapter is loaded. */
  data: unknown;
  /** Asset module id of the chapter audio. */
  audio: number;
}

export interface ChapterContent {
  meta: ChapterMeta;
  kichwaWords: WordTiming[];
  spanishWords: WordTiming[];
  audio: number;
}
