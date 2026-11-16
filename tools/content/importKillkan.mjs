/**
 * Imports chapters from a local checkout of the Killkan dataset
 * (https://github.com/ctaguchi/killkan, CC-BY 4.0) into the app.
 *
 * For each chapter it reads data/ChapterN/ChapterN.eaf — the sentence tier
 * ("default") carries the Kichwa text and the time windows, and the "Spanish"
 * tier carries one translation per sentence — and writes:
 *
 *   src/content/chapters/ChapterN.json   (the shape buildChapter.ts checks)
 *   assets/audio/capN.m4a                (48 kbps mono AAC, see README)
 *
 * It does not touch manifest.ts: add the entry by hand, the requires must be
 * literal strings.
 *
 * Usage:
 *   node tools/content/importKillkan.mjs <killkan-checkout> [chapters] [--no-audio]
 *   node tools/content/importKillkan.mjs ~/src/killkan 2-20
 *   node tools/content/importKillkan.mjs ~/src/killkan 5,7 --no-audio
 *
 * Requires ffmpeg on the PATH unless --no-audio is given.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const JSON_OUT = path.join(ROOT, "src/content/chapters");
const AUDIO_OUT = path.join(ROOT, "assets/audio");

/** Used when a chapter's own episode title cannot be found in the transcript. */
const SERIES_TITLE = "En el Barrio del Jabonero / Jaboneropak ayllullaktapi";

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

function decodeXml(text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (match, name) => {
    if (name[0] === "#") {
      const code =
        name[1].toLowerCase() === "x"
          ? parseInt(name.slice(2), 16)
          : parseInt(name.slice(1), 10);
      return String.fromCodePoint(code);
    }
    return ENTITIES[name] ?? match;
  });
}

function attrs(tag) {
  const out = {};
  for (const [, key, value] of tag.matchAll(/([\w:]+)="([^"]*)"/g)) {
    out[key] = decodeXml(value);
  }
  return out;
}

/** Annotation text with XML entities decoded and whitespace collapsed. */
function annotationValue(body) {
  const match = body.match(/<ANNOTATION_VALUE>([\s\S]*?)<\/ANNOTATION_VALUE>/);
  return match ? decodeXml(match[1]).replace(/\s+/g, " ").trim() : "";
}

/** The body of the tier with the given TIER_ID, or null. */
function tierBody(xml, tierId) {
  for (const [, open, body] of xml.matchAll(
    /<TIER\b([^>]*[^/])>([\s\S]*?)<\/TIER>/g,
  )) {
    if (attrs(open).TIER_ID === tierId) return body;
  }
  return null;
}

/**
 * The sentences of an ELAN file, in playback order:
 * [{ start, end, kichwa, spanish }] with times in milliseconds.
 */
function readSentences(eafPath) {
  const xml = readFileSync(eafPath, "utf8");
  if (!/TIME_UNITS="milliseconds"/.test(xml)) {
    throw new Error("expected TIME_UNITS to be milliseconds");
  }

  const slots = new Map();
  for (const [, tag] of xml.matchAll(/<TIME_SLOT\b([^>]*)\/>/g)) {
    const { TIME_SLOT_ID, TIME_VALUE } = attrs(tag);
    slots.set(TIME_SLOT_ID, Number(TIME_VALUE));
  }

  const kichwaTier = tierBody(xml, "default");
  const spanishTier = tierBody(xml, "Spanish");
  if (!kichwaTier) throw new Error('no "default" (Kichwa sentence) tier');
  if (!spanishTier) throw new Error('no "Spanish" tier');

  const spanishBySentence = new Map();
  for (const [, open, body] of spanishTier.matchAll(
    /<REF_ANNOTATION\b([^>]*)>([\s\S]*?)<\/REF_ANNOTATION>/g,
  )) {
    const ref = attrs(open).ANNOTATION_REF;
    if (spanishBySentence.has(ref)) {
      throw new Error(`sentence ${ref} has two Spanish translations`);
    }
    spanishBySentence.set(ref, annotationValue(body));
  }

  const sentences = [];
  for (const [, open, body] of kichwaTier.matchAll(
    /<ALIGNABLE_ANNOTATION\b([^>]*)>([\s\S]*?)<\/ALIGNABLE_ANNOTATION>/g,
  )) {
    const a = attrs(open);
    sentences.push({
      id: a.ANNOTATION_ID,
      start: slots.get(a.TIME_SLOT_REF1),
      end: slots.get(a.TIME_SLOT_REF2),
      kichwa: annotationValue(body),
      spanish: spanishBySentence.get(a.ANNOTATION_ID) ?? "",
    });
  }
  sentences.sort((x, y) => x.start - y.start || x.end - y.end);

  const lastSlot = Math.max(...slots.values());
  return { sentences, lastSlot };
}

/**
 * Every episode announces itself as "<number> capítulo" and then gives its
 * own title in the next sentence. Returns "Spanish / Kichwa", like chapter 1.
 */
function episodeTitle(sentences) {
  const tidy = (text) => text.replace(/[.\s]+$/, "");
  const i = sentences.findIndex(
    (s) => /cap[ií]tulo/i.test(s.kichwa) && s.kichwa.split(" ").length <= 3,
  );
  const next = i === -1 ? undefined : sentences[i + 1];
  if (!next || !next.kichwa || !next.spanish) return null;
  return `${tidy(next.spanish)} / ${tidy(next.kichwa)}`;
}

/** Problems that make a chapter unshippable, and ones a human should look at. */
function check(sentences) {
  const errors = [];
  const warnings = [];
  if (sentences.length === 0) errors.push("no sentences");
  sentences.forEach((s, i) => {
    const where = `sentence ${i} (${s.id}, ${s.start}ms)`;
    if (!Number.isFinite(s.start) || !Number.isFinite(s.end)) {
      errors.push(`${where}: missing time slot`);
    } else if (s.start < 0 || s.end < s.start) {
      errors.push(`${where}: invalid window ${s.start}–${s.end}`);
    }
    if (!s.kichwa) errors.push(`${where}: empty Kichwa text`);
    if (!s.spanish) errors.push(`${where}: no Spanish translation`);
    if (/\[MISSING\]/i.test(s.spanish)) {
      warnings.push(`${where}: Spanish is a [MISSING] placeholder`);
    }
    const prev = sentences[i - 1];
    if (prev && s.start < prev.end) {
      warnings.push(
        `${where}: starts ${prev.end - s.start}ms before the previous sentence ends`,
      );
    }
  });
  return { errors, warnings };
}

function findMaster(chapterDir) {
  const files = readdirSync(chapterDir).filter((f) => /MASTER/i.test(f));
  // Prefer the mp3 master; a few chapters only ship the mp4.
  return (
    files.find((f) => f.toLowerCase().endsWith(".mp3")) ??
    files.find((f) => f.toLowerCase().endsWith(".mp4")) ??
    null
  );
}

function audioDurationMs(file) {
  const out = execFileSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file],
    { encoding: "utf8" },
  );
  return Math.round(Number(out.trim()) * 1000);
}

function parseChapters(spec) {
  const numbers = new Set();
  for (const part of spec.split(",")) {
    const [from, to = from] = part.split("-").map(Number);
    if (!Number.isInteger(from) || !Number.isInteger(to) || from > to) {
      throw new Error(`Bad chapter list "${spec}" (try 2-20 or 3,5,8)`);
    }
    for (let n = from; n <= to; n++) numbers.add(n);
  }
  return [...numbers].sort((a, b) => a - b);
}

function importChapter(dataDir, n, withAudio) {
  const chapterDir = path.join(dataDir, `Chapter${n}`);
  const { sentences, lastSlot } = readSentences(
    path.join(chapterDir, `Chapter${n}.eaf`),
  );
  const { errors, warnings } = check(sentences);
  if (errors.length > 0) {
    throw new Error(`\n  ${errors.join("\n  ")}`);
  }

  let title = episodeTitle(sentences);
  if (!title) {
    warnings.push("episode title not found, using the series title");
    title = SERIES_TITLE;
  }

  if (withAudio) {
    const master = findMaster(chapterDir);
    if (!master) throw new Error("no MASTER audio file in the chapter folder");
    const out = path.join(AUDIO_OUT, `cap${n}.m4a`);
    // Same encode as the README: 48 kbps mono AAC. -vn drops any video/cover.
    execFileSync(
      "ffmpeg",
      ["-y", "-v", "error", "-i", path.join(chapterDir, master), "-vn",
       "-c:a", "aac", "-b:a", "48k", "-ac", "1", "-ar", "44100", out],
      { stdio: ["ignore", "inherit", "inherit"] },
    );
    const audioMs = audioDurationMs(out);
    if (lastSlot > audioMs) {
      throw new Error(
        `timings run to ${lastSlot}ms but the audio is only ${audioMs}ms`,
      );
    }
  }

  const track = (key) => ({
    words: sentences.map((s) => ({ word: s[key], start: s.start, end: s.end })),
  });
  const chapter = {
    title,
    metadata: { chapter: n, duration: lastSlot },
    kichwa: track("kichwa"),
    spanish: track("spanish"),
  };
  writeFileSync(
    path.join(JSON_OUT, `Chapter${n}.json`),
    JSON.stringify(chapter, null, 2) + "\n",
  );

  console.log(`Chapter ${n}: ${sentences.length} sentences — ${title}`);
  for (const w of warnings) console.log(`  warning: ${w}`);
}

function main() {
  const args = process.argv.slice(2);
  const withAudio = !args.includes("--no-audio");
  const [checkout, spec = "1-20"] = args.filter((a) => !a.startsWith("--"));
  if (!checkout) {
    console.error(
      "Usage: node tools/content/importKillkan.mjs <killkan-checkout> [chapters] [--no-audio]",
    );
    process.exit(1);
  }
  const dataDir = path.join(path.resolve(checkout), "data");
  if (!existsSync(dataDir)) {
    console.error(`${dataDir} does not exist — is that a killkan checkout?`);
    process.exit(1);
  }

  let failed = 0;
  for (const n of parseChapters(spec)) {
    try {
      importChapter(dataDir, n, withAudio);
    } catch (err) {
      failed++;
      console.error(`Chapter ${n}: FAILED — ${err.message}`);
    }
  }
  if (failed > 0) process.exit(1);
}

main();
