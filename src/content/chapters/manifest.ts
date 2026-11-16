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
  {
    id: "2",
    chapterNumber: 2,
    level: "A1",
    data: require("./Chapter2.json"),
    audio: require("../../../assets/audio/cap2.m4a"),
  },
  {
    id: "3",
    chapterNumber: 3,
    level: "A1",
    data: require("./Chapter3.json"),
    audio: require("../../../assets/audio/cap3.m4a"),
  },
  {
    id: "4",
    chapterNumber: 4,
    level: "A1",
    data: require("./Chapter4.json"),
    audio: require("../../../assets/audio/cap4.m4a"),
  },
  {
    id: "5",
    chapterNumber: 5,
    level: "A1",
    data: require("./Chapter5.json"),
    audio: require("../../../assets/audio/cap5.m4a"),
  },
  {
    id: "6",
    chapterNumber: 6,
    level: "A1",
    data: require("./Chapter6.json"),
    audio: require("../../../assets/audio/cap6.m4a"),
  },
  {
    id: "7",
    chapterNumber: 7,
    level: "A1",
    data: require("./Chapter7.json"),
    audio: require("../../../assets/audio/cap7.m4a"),
  },
  {
    id: "8",
    chapterNumber: 8,
    level: "A1",
    data: require("./Chapter8.json"),
    audio: require("../../../assets/audio/cap8.m4a"),
  },
  {
    id: "9",
    chapterNumber: 9,
    level: "A1",
    data: require("./Chapter9.json"),
    audio: require("../../../assets/audio/cap9.m4a"),
  },
  {
    id: "10",
    chapterNumber: 10,
    level: "A1",
    data: require("./Chapter10.json"),
    audio: require("../../../assets/audio/cap10.m4a"),
  },
  {
    id: "11",
    chapterNumber: 11,
    level: "A1",
    data: require("./Chapter11.json"),
    audio: require("../../../assets/audio/cap11.m4a"),
  },
  {
    id: "12",
    chapterNumber: 12,
    level: "A1",
    data: require("./Chapter12.json"),
    audio: require("../../../assets/audio/cap12.m4a"),
  },
  {
    id: "13",
    chapterNumber: 13,
    level: "A1",
    data: require("./Chapter13.json"),
    audio: require("../../../assets/audio/cap13.m4a"),
  },
  {
    id: "14",
    chapterNumber: 14,
    level: "A1",
    data: require("./Chapter14.json"),
    audio: require("../../../assets/audio/cap14.m4a"),
  },
  {
    id: "15",
    chapterNumber: 15,
    level: "A1",
    data: require("./Chapter15.json"),
    audio: require("../../../assets/audio/cap15.m4a"),
  },
  {
    id: "16",
    chapterNumber: 16,
    level: "A1",
    data: require("./Chapter16.json"),
    audio: require("../../../assets/audio/cap16.m4a"),
  },
  {
    id: "17",
    chapterNumber: 17,
    level: "A1",
    data: require("./Chapter17.json"),
    audio: require("../../../assets/audio/cap17.m4a"),
  },
  {
    id: "18",
    chapterNumber: 18,
    level: "A1",
    data: require("./Chapter18.json"),
    audio: require("../../../assets/audio/cap18.m4a"),
  },
  {
    id: "19",
    chapterNumber: 19,
    level: "A1",
    data: require("./Chapter19.json"),
    audio: require("../../../assets/audio/cap19.m4a"),
  },
  {
    id: "20",
    chapterNumber: 20,
    level: "A1",
    data: require("./Chapter20.json"),
    audio: require("../../../assets/audio/cap20.m4a"),
  },
];
