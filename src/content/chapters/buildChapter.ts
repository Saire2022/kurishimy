import type {
  ChapterContent,
  ChapterManifestEntry,
  WordTiming,
} from "@/types/lesson";
import { normalizeTimings } from "@/utils/normalizeTimings";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function parseTrack(
  data: Record<string, unknown>,
  track: string,
): WordTiming[] {
  const section = data[track];
  if (!isRecord(section) || !Array.isArray(section.words)) {
    throw new Error(`"${track}.words" must be an array`);
  }
  if (section.words.length === 0) {
    throw new Error(`"${track}.words" is empty`);
  }
  return section.words.map((entry: unknown, i) => {
    const where = `"${track}.words[${i}]"`;
    if (!isRecord(entry)) throw new Error(`${where} must be an object`);
    const { word, start, end } = entry;
    if (typeof word !== "string" || word.length === 0) {
      throw new Error(`${where} needs a non-empty "word" string`);
    }
    if (!isFiniteNumber(start) || !isFiniteNumber(end)) {
      throw new Error(`${where} needs numeric "start" and "end"`);
    }
    if (start < 0 || end < start) {
      throw new Error(`${where} has an invalid time window (${start}–${end})`);
    }
    return { word, start, end };
  });
}

/**
 * Turns a manifest entry into the chapter the app renders, checking the JSON
 * shape on the way. Throws an Error naming the chapter and the first problem
 * found, so a malformed file can never reach the reader as an empty screen.
 */
export function buildChapter(entry: ChapterManifestEntry): ChapterContent {
  try {
    const { data } = entry;
    if (!isRecord(data)) throw new Error("chapter data must be an object");

    if (typeof data.title !== "string" || data.title.trim() === "") {
      throw new Error('"title" must be a non-empty string');
    }
    const duration = isRecord(data.metadata)
      ? data.metadata.duration
      : undefined;
    if (!isFiniteNumber(duration) || duration <= 0) {
      throw new Error('"metadata.duration" must be a positive number (ms)');
    }

    const kichwa = parseTrack(data, "kichwa");
    const spanish = parseTrack(data, "spanish");

    // The player navigates by one track and highlights both, so the two must
    // describe the same sentences over the same time windows.
    if (kichwa.length !== spanish.length) {
      throw new Error(
        `kichwa has ${kichwa.length} sentences but spanish has ${spanish.length}`,
      );
    }
    const mismatch = kichwa.findIndex(
      (k, i) => k.start !== spanish[i].start || k.end !== spanish[i].end,
    );
    if (mismatch !== -1) {
      throw new Error(
        `sentence ${mismatch} has different timings in kichwa and spanish`,
      );
    }

    return {
      meta: {
        id: entry.id,
        title: data.title,
        chapterNumber: entry.chapterNumber,
        level: entry.level,
        durationMs: duration,
      },
      kichwaWords: normalizeTimings(kichwa),
      spanishWords: normalizeTimings(spanish),
      audio: entry.audio,
    };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    throw new Error(`Invalid chapter "${entry.id}": ${reason}`);
  }
}
