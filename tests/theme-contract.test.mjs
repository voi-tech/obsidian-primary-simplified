import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { test } from "node:test";
import { compileString } from "sass";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
const manifest = JSON.parse(read("manifest.json"));
const packageJson = JSON.parse(read("package.json"));
const settings = read("src/css/style-settings.css");
const lightPalette = read("src/scss/10_foundations/palettes/classic/_light.scss");
const scss = read("src/scss/index.scss") +
  read("src/scss/40_editor/_callout.scss") +
  read("src/scss/50_core-plugins/_bookmark.scss");

function filesBelow(path) {
  const directory = new URL(path, root);
  return readdirSync(directory).flatMap((name) => {
    const child = new URL(name, directory.href.endsWith("/") ? directory : new URL(`${directory.href}/`));
    return statSync(child).isDirectory()
      ? filesBelow(`${path.replace(/\/$/, "")}/${name}/`)
      : [child];
  });
}

function settingIds(source) {
  return [...source.matchAll(/^\s*-?\s*id:\s*([^\s#]+)\s*$/gm)].map((match) => match[1]);
}

function settingClassNames(source) {
  return new Set([
    ...settingIds(source),
    ...[...source.matchAll(/^\s+value:\s*([^\s#]+)\s*$/gm)].map((match) => match[1]),
  ]);
}

function styleSettingControls(source) {
  return [...source.matchAll(/^\s+type:\s*([^\s]+)\s*$/gm)]
    .map((match) => match[1])
    .filter((type) => !["heading", "info-text"].includes(type));
}

function classSelectValues(source) {
  return [...source.matchAll(/^\s+value:\s*([^\s#]+)\s*$/gm)].map((match) => match[1]);
}

function scssBodyClasses(source) {
  const bodySelectorClasses = [...source.matchAll(/body(?:\.[A-Za-z0-9_-]+)+/g)]
    .flatMap((match) => match[0].match(/\.([A-Za-z0-9_-]+)/g).map((value) => value.slice(1)));
  return [...new Set(bodySelectorClasses)].sort();
}

function allScssSource() {
  return filesBelow("src/scss/")
    .filter((file) => file.pathname.endsWith(".scss"))
    .map((file) => readFileSync(file, "utf8"))
    .join("\n");
}

function pngDimensions(path) {
  const data = readFileSync(new URL(path, root));
  assert.equal(data.toString("ascii", 1, 4), "PNG");
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
}

function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let rgb;
  if (h < 60) rgb = [c, x, 0];
  else if (h < 120) rgb = [x, c, 0];
  else if (h < 180) rgb = [0, c, x];
  else if (h < 240) rgb = [0, x, c];
  else if (h < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return rgb.map((value) => value + m);
}

function contrast(first, second) {
  const luminance = (rgb) => rgb
    .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
    .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
  const [a, b] = [luminance(first), luminance(second)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}

const lightVariables = new Map(
  [...lightPalette.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((match) => [match[1], match[2].trim()]),
);

function lightPaletteColor(variable) {
  let value = lightVariables.get(variable);
  assert.ok(value, `missing light color for --${variable}`);
  for (let hops = 0; hops < 5; hops += 1) {
    const ref = value.match(/^var\(--([\w-]+)\)$/);
    if (!ref) break;
    value = lightVariables.get(ref[1]);
    assert.ok(value, `unresolved var(--${ref[1]}) while tracing --${variable}`);
  }
  const match = value.match(/hsla?\((\d+)[,\s]+(\d+)%?[,\s]+(\d+)%?/);
  assert.ok(match, `--${variable} resolved to non-hsl value: ${value}`);
  return hslToRgb(...match.slice(1).map(Number));
}

test("release metadata targets Obsidian 1.13 and uses an exact SemVer tag", () => {
  assert.equal(manifest.name, "Primary Simplified");
  assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
  assert.equal(manifest.version, "26.6.1");
  assert.equal(manifest.minAppVersion, "1.13.0");
  assert.equal(manifest.author, "voitech");
  assert.equal(manifest.authorUrl, "https://github.com/voi-tech");
  assert.deepEqual(JSON.parse(read("versions.json")), { "26.6.0": "1.13.0", "26.6.1": "1.13.0" });

  const workflow = read(".github/workflows/release.yml");
  assert.doesNotMatch(workflow, /tags:\s*\n\s*-\s*["']v\*/);
  assert.doesNotMatch(workflow, /#v|#refs\/tags\/v/);
  assert.match(workflow, /tag_version=.*GITHUB_REF_NAME/);
});

test("Style Settings metadata is normalized and all ids are unique", () => {
  assert.doesNotMatch(settings, /\t/);
  assert.doesNotMatch(settings, /default:\s+(True|False)\b/);

  const ids = settingIds(settings);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  assert.deepEqual([...new Set(duplicates)], []);
  assert.doesNotMatch(settings, /id:\s*legacy-compatibility\b/);
  assert.doesNotMatch(settings, /id:\s*legacy-/);
  assert.doesNotMatch(settings, /id:\s*font-ui-/);
  assert.doesNotMatch(settings, /id:\s*h[1-6]-(?:font|line-height|letter-spacing|text-transform|border-(?:top|right|bottom|left)-color)\b/);
  assert.doesNotMatch(settings, /id:\s*h[1-6]-vt-align-center\b/);
  assert.doesNotMatch(settings, /id:\s*(?:zero-tab-anim|zero-popup-popdown|file-header-hover|file-header-title-hover)\b/);
  assert.doesNotMatch(settings, /id:\s*bookmark-folder-\d+-/);
  assert.doesNotMatch(settings, /id:\s*colorful-folders_/);
  assert.doesNotMatch(settings, /id:\s*(?:star|note|location|info|amount|quote|idea|pro|con|bookmark|up|down|law|language|clock|telephone)-chbx-/);

  // Style Settings is restricted to toggles, selects, and structural entries —
  // no free-text/number/color controls (manual color, size, and font values
  // are configured via CSS snippet instead). See [[style-settings-no-control-cap]].
  const controlTypes = [...settings.matchAll(/^\s+type:\s*([^\s]+)\s*$/gm)].map((match) => match[1]);
  for (const type of controlTypes) {
    assert.ok(["heading", "info-text", "class-toggle", "class-select"].includes(type),
      `Style Settings control type "${type}" requires manual entry; only toggles/selects are allowed`);
  }

  assert.ok(styleSettingControls(settings).length <= 22, "Style Settings should stay compact");
  assert.match(settings, /id:\s*essentials\b[\s\S]*title:\s*Theme settings/);
  assert.doesNotMatch(settings, /id:\s*readme-guide\b/);
  for (const category of ["Appearance", "Motion and performance", "Workspace", "Editor and notes", "Folders and bookmarks"]) {
    assert.match(settings, new RegExp(`title:\\s*${category}`));
  }
});

test("Style Settings exposes every theme-owned body class", () => {
  const exposedClasses = settingClassNames(settings);
  const appClasses = new Set(["is-mobile", "is-phone", "theme-dark", "theme-light"]);
  const allBodyClasses = scssBodyClasses(allScssSource());
  const orphanClasses = allBodyClasses
    .filter((className) => !exposedClasses.has(className) && !appClasses.has(className));

  assert.deepEqual(orphanClasses, []);

  const missingPresetClasses = classSelectValues(settings)
    .filter((className) => !className.endsWith("-default"))
    .filter((className) => !allBodyClasses.includes(className));

  assert.deepEqual(missingPresetClasses, []);
});

test("Obsidian 1.13 callout colors are valid CSS colors", () => {
  assert.doesNotMatch(scss, /rgba\(var\(--callout-color\)\)/);
  assert.match(scss, /--callout-color:\s*var\(--callout-(?:general|default)\)/);
  assert.doesNotMatch(scss, /--callout-rgb-[\w-]+:\s*\d+\s*,/);
});

test("essential light-theme text colors meet WCAG AA contrast", () => {
  const background = hslToRgb(35, 36, 96);
  for (const variable of ["link-ahref-color", "link-unresolved-color", "link-color", "link-external-color"]) {
    assert.ok(contrast(background, lightPaletteColor(variable)) >= 4.5, `--${variable} is below 4.5:1`);
  }
});

test("core theme avoids expensive and brittle optional integrations", () => {
  const allScss = allScssSource();
  assert.doesNotMatch(allScss, /:has\(/);
  assert.doesNotMatch(allScss, /url\(\s*["']?https?:\/\//i);
  assert.doesNotMatch(allScss, /--bookmark-folder-\d+-/);
  for (const line of allScss.split("\n").filter((value) => value.includes("!important"))) {
    assert.match(line, /\/\//, `unjustified !important: ${line.trim()}`);
  }
  assert.doesNotMatch(read("src/scss/index.scss"), /custom-icons/);
  assert.doesNotMatch(read("src/scss/index.scss"), /calendar-liam-cain|kanban-mgmeyers/);
});

test("Obsidian 1.13 core surfaces use documented theme variables", () => {
  const index = read("src/scss/index.scss");
  assert.match(index, /50_core-plugins\/bases/);
  const bases = read("src/scss/50_core-plugins/_bases.scss");
  for (const variable of ["--bases-view-padding", "--bases-embed-border-color", "--bases-table-container-border-radius"]) {
    assert.match(bases, new RegExp(variable));
  }
});

test("build uses a small Node and Sass toolchain", () => {
  assert.equal(packageJson.private, true);
  assert.match(packageJson.scripts.build, /node scripts\/build-theme\.mjs/);
  assert.match(packageJson.scripts.test, /node --test/);
  assert.ok(packageJson.devDependencies.sass);
  for (const dependency of ["grunt", "grunt-cli", "grunt-env", "dotenv"]) {
    assert.equal(packageJson.dependencies?.[dependency], undefined);
    assert.equal(packageJson.devDependencies?.[dependency], undefined);
  }
});

test("release repository contains only the supported compact asset set", () => {
  assert.ok(existsSync(new URL("screenshot.png", root)));
  assert.deepEqual(pngDimensions("screenshot.png"), { width: 512, height: 288 });
  assert.equal(existsSync(new URL("assets/archive", root)), false);
  assert.equal(existsSync(new URL("snippets/list-style_decimal.css", root)), false);
  for (const snippet of [
    "primary-calendar-plugin.css",
    "primary-callout-showcase.css",
    "primary-checkbox-icons.css",
    "primary-custom-icons-lite.css",
    "primary-decimal-lists.css",
    "primary-kanban-plugin.css",
  ]) {
    assert.ok(existsSync(new URL(`snippets/${snippet}`, root)), `${snippet} should exist`);
  }
  assert.ok(existsSync(new URL("licenses/OFL-Inter.txt", root)));
  assert.ok(existsSync(new URL("licenses/OFL-Cascadia-Code.txt", root)));
});

test("compiled theme stays offline and below the release size budget", () => {
  const theme = read("theme.css");
  assert.doesNotMatch(theme, /url\(\s*["']?https?:\/\//i);
  assert.ok(Buffer.byteLength(theme) < 1_000_000, "theme.css must be smaller than 1 MB");
});

test("optional snippets are static local CSS", () => {
  const snippets = filesBelow("snippets/").filter((file) => file.pathname.endsWith(".css"));
  assert.equal(snippets.length, 6);
  for (const file of snippets) {
    const source = readFileSync(file, "utf8");
    assert.doesNotMatch(source, /url\(\s*["']?https?:\/\//i);
    assert.doesNotMatch(source, /@import/i);
    compileString(source, { syntax: "css" });
  }
});
