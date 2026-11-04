#!/usr/bin/env node
/**
 * Generates the palette block in theme.css from tokens/palette.tokens.json.
 *
 *   node scripts/build-palette.mjs           # rewrites the block between the markers
 *   node scripts/build-palette.mjs --check   # exit 1 when the block is stale
 *                                            # or a colour outside it is not a palette step
 *
 * The block defines the --color-l-<hue>-<step> and --color-d-<hue>-<step> scales
 * (both modes on body, so callouts and other shared rules can use light steps
 * in dark mode too) and the named colours Obsidian expects (--color-red,
 * --color-red-rgb...) as fixed scale steps.
 *
 * Outside the block a colour may only be a var() of a step or a color-mix()
 * of one. Exceptions (ALLOWED): black and white with alpha in shadows and
 * bevels, transparent, and a palette step's hex inside a data URI, where var()
 * does not work.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { load } from "./palette.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const THEME = join(ROOT, "theme.css");
const BEGIN = "/* @generated palette: node scripts/build-palette.mjs (source: tokens/palette.tokens.json), do not edit by hand */";
const END = "/* @end palette */";
const HUES = ["red", "orange", "yellow", "green", "cyan", "blue", "purple", "pink"];
// Obsidian's named colours: one step for every hue in a mode.
const NAMED_STEP = { light: { hue: "90", gray: "70" }, dark: { hue: "40", gray: "40" } };

const triplet = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ");

export function generate(pal) {
  const lines = [BEGIN, "body {"];
  for (const [mode, p] of [["light", "l"], ["dark", "d"]]) {
    for (const [hue, steps] of Object.entries(pal[mode])) {
      for (const [step, v] of Object.entries(steps)) lines.push(`  --color-${p}-${hue}-${step}: ${v.hex};`);
    }
  }
  lines.push("}");
  for (const mode of ["light", "dark"]) {
    const p = mode[0];
    const { hue: hs, gray: gs } = NAMED_STEP[mode];
    lines.push(`.theme-${mode} {`);
    lines.push(`  --color-gray-rgb: ${triplet(pal[mode].gray[gs].hex)};`);
    for (const hue of HUES) {
      lines.push(`  --color-${hue}: var(--color-${p}-${hue}-${hs});`);
      lines.push(`  --color-${hue}-rgb: ${triplet(pal[mode][hue][hs].hex)};`);
    }
    lines.push("}");
  }
  lines.push(END);
  return lines.join("\n");
}

function split(css) {
  const a = css.indexOf(BEGIN), b = css.indexOf(END);
  if (a < 0 || b < a) throw new Error("theme.css: palette block markers not found");
  return [css.slice(0, a), css.slice(a, b + END.length), css.slice(b + END.length)];
}

// ── kolory poza blokiem ──
const LITERAL = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\([^()]*(?:\([^()]*\)[^()]*)*\)/g;
const ALLOWED = [
  /^rgba?\(\s*(?:0,\s*0,\s*0|255,\s*255,\s*255)\s*,\s*[\d.]+\s*\)$/, // black/white with alpha
  /^rgba?\(\s*(?:0 0 0|255 255 255)\s*\/\s*[\d.]+%?\s*\)$/,
];
const PARAM = /^(?:rgba?|hsla?)\(\s*(?:var|calc)\(/; // hsl(var(--accent-h), ...) built from numbers, not a literal

export function strayColors(css, pal) {
  const [pre, , post] = split(css);
  const paletteHex = new Set(Object.values(pal).flatMap((m) => Object.values(m).flatMap((s) => Object.values(s).map((v) => v.hex.slice(1).toUpperCase()))));
  const out = [];
  for (const part of [pre, post]) {
    const base = part === pre ? 0 : css.length - post.length;
    for (const m of part.matchAll(LITERAL)) {
      const v = m[0];
      const lineNo = css.slice(0, base + m.index).split("\n").length;
      const lineText = css.split("\n")[lineNo - 1];
      if (ALLOWED.some((r) => r.test(v)) || PARAM.test(v)) continue;
      if (/^#/.test(v) && /url\(|data:image/.test(lineText)) continue; // inside a data URI the hex is encoded as %23
      if (/^#/.test(v) && !/^#[0-9a-fA-F]{3,8}$/.test(v)) continue;
      if (/^#/.test(v) && /^\s*(\/\*|\*|-\s)/.test(lineText)) continue; // comments and @settings
      out.push(`${lineNo}: ${v}`);
    }
  }
  // %23RRGGBB in a data URI must be a palette step
  for (const m of css.matchAll(/%23([0-9a-fA-F]{6})/g)) {
    if (!paletteHex.has(m[1].toUpperCase())) out.push(`${css.slice(0, m.index).split("\n").length}: %23${m[1]} (data URI, not a palette step)`);
  }
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { pal } = load();
  const css = readFileSync(THEME, "utf8");
  const [pre, block, post] = split(css);
  const fresh = generate(pal);
  if (process.argv.includes("--check")) {
    const errors = [];
    if (block !== fresh) errors.push("palette block in theme.css differs from tokens/palette.tokens.json: run node scripts/build-palette.mjs");
    for (const s of strayColors(css, pal)) errors.push("colour outside the palette, line " + s);
    for (const e of errors) console.log("ERROR  " + e);
    console.log(errors.length ? `${errors.length} error(s)` : "palette block current, no colours outside the palette");
    process.exit(errors.length ? 1 : 0);
  }
  writeFileSync(THEME, pre + fresh + post);
  console.log(block === fresh ? "palette block unchanged" : "palette block written");
}
