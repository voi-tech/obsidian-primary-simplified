import { readFile, writeFile } from "node:fs/promises";
import { watch } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as sass from "sass";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const fontFaces = [
  {
    family: "Inter",
    style: "normal",
    weight: "100 900",
    file: "inter-latin-wght-normal.woff2",
    range: "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD",
  },
  {
    family: "Inter",
    style: "normal",
    weight: "100 900",
    file: "inter-latin-ext-wght-normal.woff2",
    range: "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF",
  },
  {
    family: "Inter",
    style: "italic",
    weight: "100 900",
    file: "inter-latin-wght-italic.woff2",
    range: "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD",
  },
  {
    family: "Inter",
    style: "italic",
    weight: "100 900",
    file: "inter-latin-ext-wght-italic.woff2",
    range: "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF",
  },
  {
    family: "Cascadia Code",
    style: "normal",
    weight: "200 700",
    file: "cascadia-code-latin-wght-normal.woff2",
    range: "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD",
  },
  {
    family: "Cascadia Code",
    style: "normal",
    weight: "200 700",
    file: "cascadia-code-latin-ext-wght-normal.woff2",
    range: "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF",
  },
];

async function buildFontCss() {
  const faces = await Promise.all(fontFaces.map(async (font) => {
    const data = await readFile(resolve(root, "src/fonts", font.file));
    return `@font-face{font-family:"${font.family}";font-style:${font.style};font-display:swap;font-weight:${font.weight};src:url("data:font/woff2;base64,${data.toString("base64")}") format("woff2-variations");unicode-range:${font.range}}`;
  }));
  return faces.join("");
}

export async function buildTheme() {
  const [{ css }, banner, settings, fonts] = await Promise.all([
    Promise.resolve(sass.compile(resolve(root, "src/scss/index.scss"), { style: "compressed" })),
    readFile(resolve(root, "src/css/readme.css"), "utf8"),
    readFile(resolve(root, "src/css/style-settings.css"), "utf8"),
    buildFontCss(),
  ]);
  const output = `${banner.trim()}\n${fonts}\n${css.trim()}\n${settings.trim()}\n`;
  await writeFile(resolve(root, "theme.css"), output);
  return Buffer.byteLength(output);
}

async function main() {
  const size = await buildTheme();
  console.log(`Built theme.css (${size} bytes)`);

  if (!process.argv.includes("--watch")) return;
  let timer;
  watch(resolve(root, "src"), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      try {
        console.log(`Rebuilt theme.css (${await buildTheme()} bytes)`);
      } catch (error) {
        console.error(error);
      }
    }, 100);
  });
  console.log("Watching src for changes…");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
