#!/usr/bin/env node
/**
 * Structural and accessibility checks for theme.css.
 *
 *   node scripts/validate-theme.mjs
 *
 * Runs with no dependencies and no browser. Every check here exists because
 * the corresponding defect actually shipped at least once:
 *
 *   1. braces          - the file parses as a whole
 *   2. bad-selector    - a pseudo-element inside :not()/:is()/:where() makes
 *                        the browser drop the entire rule, silently
 *   3. duplicate-decl  - a second declaration of the same property in one
 *                        block overrides the first, usually by accident
 *   4. empty-var       - "--x: ;" is defined-but-empty, which suppresses the
 *                        fallback in every var(--x, fallback) downstream
 *   5. unknown-var     - var() with no fallback pointing at a name neither
 *                        the theme nor Obsidian defines
 *   6. theme-symmetry  - a token set in .theme-dark but not .theme-light
 *                        (or the reverse) silently falls back in one mode
 *   7. settings-class  - a class offered in @settings that no rule implements
 *   8. unknown-class   - a selector targeting a class Obsidian no longer ships
 *   9. contrast        - foreground/background pairs below WCAG thresholds
 *  10. manifest        - CalVer shape and required fields
 *  11. redundant-block - a modifier block that only repeats its base
 *  12. unused-var      - a variable nothing reads, which is either a
 *                        leftover or a rule that was never written
 *
 * Checks 5, 8 and 12 need scripts/obsidian-api.json, produced locally by
 * ./scripts/snapshot-obsidian-api.sh. When it is absent - as in CI, which has
 * no Obsidian install - those two checks are skipped and the rest still run.
 */

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(root, "theme.css"), "utf8");

const problems = [];
const notes = [];
const fail = (check, message, line) =>
  problems.push({ check, message, line });
const warn = (check, message, line) => notes.push({ check, message, line });

/* ------------------------------------------------------------------ parse */

const stripComments = (text) => text.replace(/\/\*[\s\S]*?\*\//g, (m) =>
  m.replace(/[^\n]/g, " "),
);
const bare = stripComments(css);
const lineOf = (index) => bare.slice(0, index).split("\n").length;

/** Top-level and one-level-nested rules: { selector, body, line }. */
function readRules(text) {
  const rules = [];
  let i = 0;
  let depth = 0;
  let start = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === '"' || ch === "'") {
      const quote = ch;
      i += 1;
      while (i < text.length && text[i] !== quote) {
        if (text[i] === "\\") i += 1;
        i += 1;
      }
      i += 1;
      continue;
    }
    if (ch === "{") {
      if (depth <= 1) {
        const selector = text.slice(start, i).trim().replace(/\s+/g, " ");
        let d = 1;
        let j = i + 1;
        while (j < text.length && d > 0) {
          if (text[j] === "{") d += 1;
          if (text[j] === "}") d -= 1;
          j += 1;
        }
        if (selector && !selector.startsWith("@")) {
          rules.push({
            selector,
            body: text.slice(i + 1, j - 1),
            line: lineOf(start),
          });
        }
      }
      depth += 1;
      i += 1;
      start = i;
      continue;
    }
    if (ch === "}") {
      depth -= 1;
      i += 1;
      start = i;
      continue;
    }
    i += 1;
  }
  return rules;
}

/** Declarations of one rule body, split on top-level semicolons. */
function readDeclarations(body) {
  const out = [];
  let depth = 0;
  let current = "";
  for (const ch of body) {
    if (ch === "(") depth += 1;
    if (ch === ")") depth -= 1;
    if (ch === ";" && depth === 0) {
      out.push(current);
      current = "";
    } else current += ch;
  }
  if (current.trim()) out.push(current);
  return out
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => {
      const colon = d.indexOf(":");
      if (colon < 0) return null;
      return {
        property: d.slice(0, colon).trim(),
        value: d.slice(colon + 1).trim().replace(/\s+/g, " "),
      };
    })
    .filter((d) => d && /^(--[\w-]+|[a-z-]+)$/.test(d.property));
}

/* -------------------------------------------------------------- 1. braces */

const opens = (bare.match(/{/g) || []).length;
const closes = (bare.match(/}/g) || []).length;
if (opens !== closes) {
  fail("braces", `unbalanced braces: ${opens} "{" vs ${closes} "}"`);
}

const rules = readRules(bare);

/* -------------------------------------------------------- 2. bad-selector */

// A pseudo-element is never valid inside :not(), :is() or :where(). One such
// compound invalidates the whole selector list, taking every other selector
// in the rule down with it.
for (const rule of rules) {
  const match = rule.selector.match(
    /:(?:not|is|where)\([^)]*::[a-z-]+[^)]*\)/i,
  );
  if (match) {
    fail(
      "bad-selector",
      `pseudo-element inside ${match[0]} drops the whole rule: ${rule.selector.slice(0, 90)}`,
      rule.line,
    );
  }
}

// Text that is not a selector at all, which happens when an edit lands
// inside a comment and leaves its closing delimiter stranded in the rule
// stream. The browser silently drops the rule that inherits the garbage.
for (const rule of rules) {
  // Quoted attribute values legitimately contain punctuation, as in
  // [data-callout="tl;dr"], so they are not part of the search.
  const unquoted = rule.selector.replace(/"[^"]*"|'[^']*'/g, '""');
  const stray = unquoted.match(/\*\/|\/\*|;/);
  if (stray) {
    fail(
      "bad-selector",
      `stray "${stray[0]}" in a selector - a comment is probably unbalanced: ` +
        rule.selector.slice(0, 90),
      rule.line,
    );
  }
}

/* ------------------------------------------------------ 3. duplicate-decl */

for (const rule of rules) {
  const seen = new Map();
  for (const { property, value } of readDeclarations(rule.body)) {
    if (seen.has(property)) {
      fail(
        "duplicate-decl",
        `"${property}" declared twice in "${rule.selector.slice(0, 60)}" ` +
          `(the later "${value.slice(0, 40)}" wins)`,
        rule.line,
      );
    }
    seen.set(property, value);
  }
}

/* ------------------------------------------------------------ 4. empty-var */

for (const match of bare.matchAll(/(--[\w-]+)\s*:\s*(?=;)/g)) {
  fail(
    "empty-var",
    `"${match[1]}" is defined with an empty value, which suppresses every ` +
      `var(${match[1]}, fallback) downstream`,
    lineOf(match.index),
  );
}

/* ------------------------------------------------------------- variable maps */

const themeVariables = new Set();
for (const match of bare.matchAll(/(^|[;{\s])(--[\w-]+)\s*:/g)) {
  themeVariables.add(match[2]);
}

const apiPath = join(root, "scripts", "obsidian-api.json");
const api = existsSync(apiPath)
  ? JSON.parse(readFileSync(apiPath, "utf8"))
  : null;

/* ---------------------------------------------------------- 5. unknown-var */

if (api) {
  const known = new Set([...themeVariables, ...api.variables]);
  for (const match of bare.matchAll(/var\(\s*(--[\w-]+)\s*\)/g)) {
    if (!known.has(match[1])) {
      fail(
        "unknown-var",
        `var(${match[1]}) has no fallback and neither the theme nor ` +
          `Obsidian ${api.obsidianVersion} defines it`,
        lineOf(match.index),
      );
    }
  }
} else {
  warn("unknown-var", "skipped: scripts/obsidian-api.json not present");
}

/* ------------------------------------------------------- 6. theme-symmetry */

function tokensOf(selector) {
  const found = new Set();
  for (const rule of rules) {
    if (rule.selector !== selector) continue;
    for (const { property } of readDeclarations(rule.body)) {
      if (property.startsWith("--")) found.add(property);
    }
  }
  return found;
}
const light = tokensOf(".theme-light");
const dark = tokensOf(".theme-dark");
// The per-mode palettes are meant to be one-sided.
const palette = (name) => /^--color-[ld]-/.test(name);
for (const name of light) {
  if (!palette(name) && !dark.has(name)) {
    fail(
      "theme-symmetry",
      `"${name}" is set in .theme-light but not .theme-dark`,
    );
  }
}
for (const name of dark) {
  if (!palette(name) && !light.has(name)) {
    fail(
      "theme-symmetry",
      `"${name}" is set in .theme-dark but not .theme-light`,
    );
  }
}

/* ------------------------------------------------------- 7. settings-class */

const settingsBlock = css.match(/\/\*\s*@settings([\s\S]*?)\*\//);
const settingsClasses = new Set();
if (settingsBlock) {
  const yaml = settingsBlock[1];
  // Only two things name a class: the id of a class-toggle, and the value of
  // an option. The id of a class-select is a setting name, not a class, and
  // its "-default" option is the deliberate no-op that turns the preset off.
  for (const entry of yaml.split(/^\s*-\s+(?=id:)/m)) {
    const id = entry.match(/^id:\s*([\w-]+)/m)?.[1];
    const type = entry.match(/^\s*type:\s*([\w-]+)/m)?.[1];
    if (id && type === "class-toggle") settingsClasses.add(id);
    for (const match of entry.matchAll(/^\s*value:\s*([\w-]+)\s*$/gm)) {
      if (!match[1].endsWith("-default")) settingsClasses.add(match[1]);
    }
  }
  for (const name of settingsClasses) {
    if (!new RegExp(`\\.${name}\\b`).test(bare)) {
      fail(
        "settings-class",
        `@settings offers "${name}" but no rule implements it`,
      );
    }
  }
} else {
  fail("settings-class", "no @settings block found");
}

/* -------------------------------------------------------- 8. unknown-class */

// Classes the theme owns: Style Settings switches and the per-note helper
// classes from Minimal's cssclasses contract. They are ours by design and
// will never appear in Obsidian's own stylesheets.
const ownClasses = new Set([
  ...settingsClasses,
  "cards", "list-cards", "cards-cover", "cards-align-bottom",
  "cards-16-9", "cards-1-1", "cards-2-1", "cards-2-3",
  ...Array.from({ length: 8 }, (_, i) => `cards-cols-${i + 1}`),
  "img-grid", "embed-strict",
  "wide", "max",
  "table-wide", "table-max", "table-100",
  "img-wide", "img-max", "img-100",
  "iframe-wide", "iframe-max", "iframe-100",
  "table-nowrap", "table-wrap", "table-center", "table-numbers",
  "table-tabular", "table-small", "table-tiny", "table-lines",
  "row-lines", "col-lines", "row-alt", "col-alt", "row-highlight",
  // Third-party surfaces the theme deliberately touches.
  "dataview", "style-settings-container", "style-settings-heading",
  "plugin-word-count",
]);

if (api) {
  const knownClasses = new Set(api.classes);
  const seen = new Set();
  const selectorSource = bare.slice(
    0,
    settingsBlock ? css.indexOf("/* @settings") : bare.length,
  );
  for (const match of selectorSource.matchAll(/\.([a-z][a-z0-9_-]{2,})/g)) {
    const name = match[1];
    if (seen.has(name)) continue;
    seen.add(name);
    if (knownClasses.has(name) || ownClasses.has(name)) continue;
    if (name.startsWith("cm-")) continue; // generated by CodeMirror
    fail(
      "unknown-class",
      `".${name}" is not a class Obsidian ${api.obsidianVersion} ships ` +
        `and is not one of the theme's own`,
      lineOf(match.index),
    );
  }
} else {
  warn("unknown-class", "skipped: scripts/obsidian-api.json not present");
}

/* ------------------------------------------------------------- 9. contrast */

function mapFor(selector) {
  const map = new Map();
  for (const rule of rules) {
    if (rule.selector !== selector) continue;
    for (const { property, value } of readDeclarations(rule.body)) {
      if (property.startsWith("--")) map.set(property, value);
    }
  }
  return map;
}
const baseMap = mapFor("body");
const lightMap = mapFor(".theme-light");
const darkMap = mapFor(".theme-dark");

function resolve(value, map, depth = 0) {
  if (depth > 24) return value;
  const replaced = value.replace(
    /var\(\s*(--[\w-]+)\s*(?:,([^]*?))?\)/g,
    (whole, name, fallback) => {
      const found = map.get(name) ?? baseMap.get(name);
      if (found !== undefined) return resolve(found, map, depth + 1);
      if (fallback !== undefined) return resolve(fallback.trim(), map, depth + 1);
      return whole;
    },
  );
  return replaced === value ? value : resolve(replaced, map, depth + 1);
}

const percent = (text) => Number.parseFloat(text);
function evalMinMax(value) {
  return value.replace(
    /\b(min|max)\(\s*([\d.]+%?)\s*,\s*([\d.]+%?)\s*\)/g,
    (_, fn, a, b) => {
      const unit = a.includes("%") || b.includes("%") ? "%" : "";
      const n = fn === "min"
        ? Math.min(percent(a), percent(b))
        : Math.max(percent(a), percent(b));
      return `${n}${unit}`;
    },
  );
}

function toRgb(value) {
  const text = evalMinMax(value.trim());
  if (/color-mix\(/.test(text) || /var\(/.test(text)) return null;
  const alphaOf = (t) => {
    const a = t.match(/[,/]\s*([\d.]+)\s*\)\s*$/);
    return a ? Number.parseFloat(a[1]) : 1;
  };
  let m = text.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
  if (m) return [+m[1], +m[2], +m[3], alphaOf(text)];
  m = text.match(/^hsla?\(\s*([\d.]+)(?:deg)?[,\s]+([\d.]+)%[,\s]+([\d.]+)%/i);
  if (m) {
    const [h, s, l] = [+m[1] / 360, +m[2] / 100, +m[3] / 100];
    const alpha = alphaOf(text);
    if (s === 0) return [l * 255, l * 255, l * 255, alpha];
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const channel = (t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    return [
      channel(h + 1 / 3) * 255,
      channel(h) * 255,
      channel(h - 1 / 3) * 255,
      alpha,
    ];
  }
  m = text.match(/^#([0-9a-f]{6})$/i);
  if (m) {
    const n = Number.parseInt(m[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1];
  }
  return null;
}

/** Flattens a translucent colour onto an opaque one. */
const compose = (top, bottom) => {
  const a = top[3] ?? 1;
  return [0, 1, 2].map((i) => top[i] * a + bottom[i] * (1 - a));
};

const luminance = (rgb) => {
  const f = (c) => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]);
};
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// Body text needs 4.5:1, standalone UI text and icons need 3:1.
// Some foregrounds do not sit directly on --background-primary. A tag renders
// on --tag-background, which is translucent, so the honest comparison is
// against that colour composited onto the page.
const foregrounds = [
  ["--text-normal", 4.5],
  ["--text-muted", 4.5],
  ["--text-faint", 3],
  ["--text-accent", 4.5],
  ["--text-accent-hover", 4.5],
  ["--link-color", 4.5],
  ["--link-external-color", 4.5],
  ["--link-unresolved-color", 3],
  ["--tag-color", 4.5, "var(--tag-background)"],
  ["--status-bar-item-color", 3],
  ["--checklist-done-color", 3],
  ["--text-error", 3],
  ["--text-warning", 3],
  ["--text-success", 3],
];

let contrastSkipped = 0;
for (const [mode, map] of [["light", lightMap], ["dark", darkMap]]) {
  const background = toRgb(resolve("var(--background-primary)", map));
  if (!background) {
    warn("contrast", `${mode}: could not resolve --background-primary`);
    continue;
  }
  for (const [name, threshold, over] of foregrounds) {
    const rgb = toRgb(resolve(`var(${name})`, map));
    if (!rgb) {
      contrastSkipped += 1;
      continue;
    }
    let against = background;
    let againstName = "--background-primary";
    if (over) {
      const layer = toRgb(resolve(over, map));
      if (!layer) {
        contrastSkipped += 1;
        continue;
      }
      against = compose(layer, background);
      againstName = over.replace(/^var\(|\)$/g, "");
    }
    const ratio = contrast(compose(rgb, against), against);
    if (ratio < threshold) {
      const message =
        `${mode}: ${name} is ${ratio.toFixed(2)}:1 against ` +
        `${againstName}, below the ${threshold}:1 it needs`;
      if (ratio < 3) fail("contrast", message);
      else warn("contrast", message);
    }
  }
}
if (contrastSkipped) {
  warn(
    "contrast",
    `${contrastSkipped} pair(s) skipped: value resolves through color-mix(), ` +
      `which this checker does not evaluate`,
  );
}

/* ------------------------------------------------------ 11. redundant-block */

// A modifier block such as ".theme-dark.is-tablet" that only repeats what its
// base ".theme-dark" already says is dead weight, and it reads as an
// intentional difference that does not exist.
for (const rule of rules) {
  const match = rule.selector.match(/^(\.theme-(?:light|dark))(\.[\w-]+)$/);
  if (!match) continue;
  const base = mapFor(match[1]);
  const own = readDeclarations(rule.body);
  if (!own.length) continue;
  const redundant = own.every(
    ({ property, value }) =>
      base.get(property)?.replace(/\s+/g, " ") === value.replace(/\s+/g, " "),
  );
  if (redundant) {
    fail(
      "redundant-block",
      `every declaration in "${rule.selector}" repeats "${match[1]}"`,
      rule.line,
    );
  }
}

/* ---------------------------------------------------------- 12. unused-var */

// Variables the theme defines that nothing reads: not the theme itself, and
// not Obsidian. Usually a leftover, but sometimes the tell that a rule which
// was meant to consume it was never written.
if (api) {
  const read = new Set(
    [...bare.matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1]),
  );
  const obsidian = new Set(api.variables);
  const orphans = [...themeVariables]
    .filter((name) => !read.has(name) && !obsidian.has(name))
    .sort();
  if (orphans.length) {
    warn(
      "unused-var",
      `${orphans.length} variable(s) defined but read by neither the theme ` +
        `nor Obsidian: ${orphans.join(", ")}`,
    );
  }
}

/* ------------------------------------------------------------- 10. manifest */

const manifest = JSON.parse(readFileSync(join(root, "manifest.json"), "utf8"));
for (const field of ["name", "version", "minAppVersion", "author"]) {
  if (!manifest[field]) fail("manifest", `missing required field "${field}"`);
}
if (!/^\d{2}\.([1-9]|1[0-2])\.\d+$/.test(manifest.version ?? "")) {
  fail(
    "manifest",
    `version "${manifest.version}" is not CalVer YY.M.PATCH ` +
      `(month without a leading zero)`,
  );
}

/* --------------------------------------------------------------- reporting */

const label = (entry) =>
  `  ${entry.check.padEnd(16)} ${entry.line ? `theme.css:${entry.line}` : ""}` +
  `\n    ${entry.message}`;

if (notes.length) {
  console.log(`\n${notes.length} warning(s):`);
  for (const note of notes) console.log(label(note));
}
if (problems.length) {
  console.log(`\n${problems.length} problem(s):`);
  for (const problem of problems) console.log(label(problem));
  console.log("");
  process.exit(1);
}
console.log(
  `\ntheme.css: ${rules.length} rules, ${themeVariables.size} variables - all checks passed` +
    (api ? ` (against Obsidian ${api.obsidianVersion})` : " (Obsidian snapshot absent)"),
);
