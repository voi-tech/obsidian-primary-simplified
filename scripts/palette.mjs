#!/usr/bin/env node
/**
 * Primary Simplified palette: rule checks and a preview sheet.
 *
 *   node scripts/palette.mjs check            # palette rules, exit 1 on failure
 *   node scripts/palette.mjs sheet out.html   # sheet of every scale with contrast
 *
 * Source: tokens/palette.tokens.json (DTCG 2025.10 format). Every hue has the
 * 14 steps of the gray in the same mode, with the same names and OKLCH
 * lightness, so a step means the same thing in every hue. No dependencies.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "tokens/palette.tokens.json");
const STEPS = ["10", "20", "30", "40", "50", "60", "70", "80", "90", "100", "110", "120", "130", "140"];
const HUES = ["red", "orange", "yellow", "green", "cyan", "blue", "purple", "pink"];
const MODES = ["light", "dark"];

// ── Colour ──────────────────────────────────────────────────────
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
const luminance = (hex) => {
  const [r, g, b] = rgb(hex).map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const oklch = (hex) => {
  const [r, g, b] = rgb(hex).map(lin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { L, C: Math.hypot(A, B), H: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360 };
};

// ── Loading ───────────────────────────────────────────────────
export function load(path = SRC) {
  const doc = JSON.parse(readFileSync(path, "utf8"));
  const pal = {};
  for (const mode of MODES) {
    pal[mode] = {};
    for (const [hue, steps] of Object.entries(doc.color[mode])) {
      if (hue.startsWith("$")) continue;
      pal[mode][hue] = {};
      for (const [step, tok] of Object.entries(steps)) {
        if (!step.startsWith("$")) pal[mode][hue][step] = tok.$value;
      }
    }
  }
  return { doc, pal, roles: doc.$extensions["primary-simplified"].roles };
}

// ── Rules ──────────────────────────────────────────────────────
// Contrast: [mode, text step, background hue ("gray" or "own"), background steps, minimum]
const CONTRAST_RULES = [
  ["light", "110", "gray", ["10", "20", "30"], 4.5],
  ["light", "120", "own", ["10", "20", "30", "40", "50", "60"], 4.5],
  ["light", "130", "gray", ["10", "20", "30", "40"], 7],
  ["light", "100", "gray", ["10", "20", "30"], 3],
  ["dark", "20", "gray", ["90", "100", "110", "120"], 7],
  ["dark", "30", "gray", ["90", "100", "110", "120"], 4.5],
  ["dark", "40", "gray", ["100", "110", "120"], 4.5],
];
const L_TOLERANCE = 0.02; // a hue step may differ from the gray of its number by 2 L points

export function check(pal) {
  const errors = [];
  for (const mode of MODES) {
    for (const hue of ["gray", ...HUES]) {
      const scale = pal[mode][hue];
      if (!scale) { errors.push(`${mode}: hue ${hue} missing`); continue; }
      const missing = STEPS.filter((s) => !scale[s]);
      if (missing.length) errors.push(`${mode}-${hue}: steps missing: ${missing.join(", ")}`);
      for (const s of STEPS) {
        const v = scale[s];
        if (!v) continue;
        if (!/^#[0-9A-F]{6}$/.test(v.hex)) errors.push(`${mode}-${hue}-${s}: hex ${v.hex} is not #RRGGBB`);
        const fromComp = "#" + v.components.map((c) => Math.round(c * 255).toString(16).padStart(2, "0")).join("").toUpperCase();
        if (fromComp !== v.hex) errors.push(`${mode}-${hue}-${s}: components ${fromComp} differ from hex ${v.hex}`);
        if (v.colorSpace !== "srgb") errors.push(`${mode}-${hue}-${s}: colorSpace ${v.colorSpace}, oczekiwane srgb`);
      }
      // lightness falls with the step and matches the gray
      for (let i = 1; i < STEPS.length; i++) {
        const a = scale[STEPS[i - 1]], b = scale[STEPS[i]];
        if (a && b && oklch(b.hex).L >= oklch(a.hex).L) errors.push(`${mode}-${hue}: step ${STEPS[i]} is not darker than ${STEPS[i - 1]}`);
      }
      if (hue !== "gray") {
        for (const s of STEPS) {
          const d = Math.abs(oklch(scale[s].hex).L - oklch(pal[mode].gray[s].hex).L);
          if (d > L_TOLERANCE) errors.push(`${mode}-${hue}-${s}: lightness is ${(d * 100).toFixed(1)} L away from gray-${s}`);
        }
      }
    }
    for (const [m, fg, bgHue, bgSteps, min] of CONTRAST_RULES) {
      if (m !== mode) continue;
      for (const hue of ["gray", ...HUES]) {
        for (const bs of bgSteps) {
          const bg = pal[mode][bgHue === "own" ? hue : "gray"][bs].hex;
          const c = contrast(pal[mode][hue][fg].hex, bg);
          if (c < min) errors.push(`${mode}-${hue}-${fg} na ${bgHue === "own" ? hue : "gray"}-${bs}: ${c.toFixed(2)}:1 < ${min}:1`);
        }
      }
    }
  }
  return errors;
}

// ── Sheet ──────────────────────────────────────────────────────
export function sheet(pal, roles) {
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const block = (mode) => {
    const bg = pal[mode].gray[mode === "light" ? "20" : "100"].hex;
    const fg = pal[mode].gray[mode === "light" ? "130" : "20"].hex;
    const head = STEPS.map((s) => `<th title="${esc(roles[mode][s])}">${s}</th>`).join("");
    const rows = ["gray", ...HUES].map((hue) => {
      const cells = STEPS.map((s) => {
        const hex = pal[mode][hue][s].hex;
        const c = contrast(hex, bg);
        const ink = contrast(hex, "#000000") > contrast(hex, "#FFFFFF") ? "#000" : "#FFF";
        const flag = c >= 4.5 ? "AA" : c >= 3 ? "3:1" : "";
        return `<td style="background:${hex};color:${ink}"><b>${hex}</b><span>${c.toFixed(2)} ${flag}</span></td>`;
      }).join("");
      return `<tr><th>${hue}</th>${cells}</tr>`;
    }).join("");
    const roleRow = STEPS.map((s) => `<td class="role">${esc(roles[mode][s])}</td>`).join("");
    return `<section style="background:${bg};color:${fg}"><h2>${mode === "light" ? "Light mode" : "Dark mode"} <small>contrast against ${bg} (page background)</small></h2>
<table><tr><th></th>${head}</tr>${rows}<tr><th>role</th>${roleRow}</tr></table></section>`;
  };
  return `<!doctype html><html lang="en"><meta charset="utf-8"><title>Primary Simplified palette</title>
<style>
body{margin:0;font:13px/1.3 Geist,-apple-system,system-ui,sans-serif}
section{padding:24px 28px}
h2{margin:0 0 14px;font-size:18px}h2 small{font-weight:400;opacity:.7;font-size:13px}
table{border-collapse:separate;border-spacing:3px;table-layout:fixed}
th{font-weight:600;text-align:left;padding:0 6px 0 0;white-space:nowrap}
td{width:88px;height:52px;padding:5px 6px;border-radius:6px;vertical-align:bottom;font-size:11px}
td b{display:block;font-weight:600;font-family:ui-monospace,Menlo,monospace}
td span{opacity:.85}
td.role{height:auto;vertical-align:top;font-size:10.5px;opacity:.8;padding:4px 2px}
</style>${block("light")}${block("dark")}</html>`;
}

// ── CLI ────────────────────────────────────────────────────────
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [cmd, out] = process.argv.slice(2);
  const { pal, roles } = load();
  if (cmd === "check") {
    const errors = check(pal);
    for (const e of errors) console.log("ERROR  " + e);
    const n = MODES.reduce((a, m) => a + Object.values(pal[m]).reduce((b, s) => b + Object.keys(s).length, 0), 0);
    console.log(errors.length ? `${errors.length} error(s)` : `palette OK: ${n} colours, ${HUES.length + 1} scales x ${STEPS.length} steps x ${MODES.length} modes`);
    process.exit(errors.length ? 1 : 0);
  } else if (cmd === "sheet" && out) {
    writeFileSync(out, sheet(pal, roles));
    console.log(out);
  } else {
    console.log("usage: node scripts/palette.mjs check | sheet <file.html>");
    process.exit(2);
  }
}
