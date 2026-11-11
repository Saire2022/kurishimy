import type { ChapterManifestEntry } from "@/types/lesson";

/**
 * Every chapter in the app, in the order the home screen lists them.
 *
 * Adding a chapter is one entry here plus its two asset files (the JSON next
 * to this file, the audio under assets/audio). The requires must stay literal
 * strings: Metro resolves them at build time and cannot follow a variable.
 */
export const MANIFEST: ChapterManifestEntry[] = [
  {
    id: "1",
    chapterNumber: 1,
    level: "A1",
    data: require("./Chapter1.json"),
    audio: require("../../../assets/audio/cap1.m4a"),
  },
];
