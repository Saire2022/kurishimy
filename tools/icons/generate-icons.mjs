/**
 * Exports the launcher, adaptive, splash, and favicon assets from the brand
 * logo (assets/images/logo.svg) — the same sun/quipu mark rendered in-app by
 * src/components/ui/Logo.tsx.
 *
 * Run with: npm run icons
 *
 * The mark is trimmed to its own bounding box before scaling, so the framing
 * below is measured against the artwork itself rather than the SVG viewBox
 * (which carries whitespace on all four sides).
 */
import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SRC = path.join(ROOT, "assets/images/logo.svg");
const OUT = path.join(ROOT, "assets/images");

/** Launcher background. Keep in sync with colors.brandDeep and app.json. */
const BRAND_DEEP = "#4A2C1A";

/**
 * Android masks the outer ~33% of an adaptive icon. Only the central 66dp
 * circle of the 108dp canvas is guaranteed visible, so the mark's tallest
 * points (the vertical sun rays) have to sit inside that radius.
 */
const ANDROID_SAFE_FRACTION = 66 / 108;

/** Oversample before downscaling so the gradients resample cleanly. */
const RENDER_WIDTH = 3000;

/** Render the SVG large, then trim to the artwork's true bounding box. */
async function renderMark() {
  const density = Math.round((96 * RENDER_WIDTH) / 595.3);
  const full = await sharp(SRC, { density }).png().toBuffer();
  return sharp(full).trim({ threshold: 1 }).png().toBuffer();
}

/** Scale the trimmed mark so its longest edge measures `height` pixels. */
async function markAtHeight(mark, height) {
  return sharp(mark).resize({ height: Math.round(height) }).png().toBuffer();
}

/** Center the mark on a square canvas of `size`, over `background`. */
async function square(mark, size, background) {
  const canvas = sharp({
    create: { width: size, height: size, channels: 4, background },
  }).composite([{ input: mark, gravity: "center" }]);

  // iOS rejects icons with an alpha channel. flatten() composites onto the
  // background but leaves the (now fully opaque) channel in place, so it has
  // to be dropped explicitly for the PNG to encode as RGB.
  return background === "transparent"
    ? canvas.png().toBuffer()
    : canvas.flatten({ background }).removeAlpha().png().toBuffer();
}

const TRANSPARENT = "transparent";

const targets = [
  {
    file: "icon.png",
    size: 1024,
    // Square canvas: iOS rounds the corners, and the mark's extremes are on
    // the axes rather than the corners, so it can sit fairly large.
    markFraction: 0.74,
    background: BRAND_DEEP,
  },
  {
    file: "adaptive-icon.png",
    size: 1024,
    markFraction: ANDROID_SAFE_FRACTION,
    // Foreground layer only — Android paints adaptiveIcon.backgroundColor behind it.
    background: TRANSPARENT,
  },
  {
    file: "splash-icon.png",
    size: 1024,
    // expo-splash-screen scales this to imageWidth, so the padding here would
    // only shrink the mark on screen. Near-full-bleed, sized via app.json.
    markFraction: 0.92,
    background: TRANSPARENT,
  },
  {
    file: "favicon.png",
    size: 196,
    markFraction: 0.78,
    background: BRAND_DEEP,
  },
];

const mark = await renderMark();

for (const { file, size, markFraction, background } of targets) {
  const scaled = await markAtHeight(mark, size * markFraction);
  const out = await square(scaled, size, background);
  const dest = path.join(OUT, file);
  await writeFile(dest, out);

  const { width, height, channels } = await sharp(dest).metadata();
  console.log(
    `${file.padEnd(18)} ${width}x${height}  ${channels === 4 ? "RGBA" : "RGB (no alpha)"}`,
  );
}
