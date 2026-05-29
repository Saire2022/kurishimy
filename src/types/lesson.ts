export type ViewMode = "kichwa" | "spanish" | "dual";

export interface WordTiming {
  word: string;
  start: number;
  end: number;
  segment?: number;
  key?: string;
}

export interface ChapterMeta {
  id: string;
  title: string;
  chapterNumber: number;
  durationMs: number;
}

export interface ChapterContent {
  meta: ChapterMeta;
  kichwaWords: WordTiming[];
  spanishWords: WordTiming[];
  audio: number;
}

export interface WordChunk {
  words: (WordTiming & { wordIndex: number; displayText: string })[];
  start: number;
  end: number;
}
