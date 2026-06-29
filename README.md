![Primary Simplified for Obsidian Overview](./assets/obsidian-overview-header.png)

<h1 align="center">Primary Simplified for <a href="https://obsidian.md">Obsidian</a></h1>

<p align="center"><strong>A smaller, Obsidian 1.13+ fork of Primary with local assets, fewer settings, and optional CSS snippets.</strong></p>

Primary Simplified is an independently maintained fork of [Primary](https://github.com/primary-theme/obsidian), originally created by Cecilia May. It keeps Primary's warm color language and friendly interface details, but narrows the theme around maintainability, offline use, and modern Obsidian surfaces.

The goal of this fork is not to replace every feature from Primary. It is to keep the parts that still fit a current Obsidian workflow, remove broad legacy customization from the core theme, and move fragile or plugin-specific extras into optional snippets.

## Community Themes Status

Primary Simplified is technically structured for Obsidian's Community Themes workflow:

- `README.md`, `LICENSE`, `manifest.json`, `theme.css`, and `screenshot.png` live in the repository root.
- `screenshot.png` is 512 x 288 pixels, matching the recommended community store preview size.
- `manifest.json` uses an exact `x.y.z` version and targets Obsidian `1.13.0`.
- Release automation is configured to attach `manifest.json` and `theme.css` to GitHub releases.
- The built `theme.css` embeds local font assets and does not load remote resources.

There is one policy gate before this fork can be submitted to the official Community directory: Obsidian's developer policies only allow forks if the fork has public written approval from the original author, or if the fork author can show the original author is unreachable and the original project has not been updated for at least six months. Primary Simplified must document one of those cases before submission.

## Preview

### Light Mode

![Primary Simplified on Desktop - Light Mode](./assets/desktop-1_light-mode.png)

<p align="center">
  <img alt="Primary Simplified on Mobile - Light Mode" src="./assets/mobile-1_light-mode.png" width="320px">
</p>

### Dark Mode

![Primary Simplified on Desktop - Dark Mode](./assets/desktop-1_dark-mode.png)

<p align="center">
  <img alt="Primary Simplified on Mobile - Dark Mode" src="./assets/mobile-1_dark-mode.png" width="320px">
</p>

## Why This Fork Exists

Primary is expressive, polished, and highly customizable. Over time, that also made it large: the upstream theme includes hundreds of Style Settings entries, broad community-plugin skins, custom icon replacements, and a legacy Grunt build pipeline.

Primary Simplified was created for a narrower target:

- keep the recognizable Primary palette and soft interface style
- support Obsidian 1.13+ surfaces such as Bases
- keep the distributed theme self-contained and offline
- reduce the Style Settings surface to a small set of high-value choices
- avoid plugin-specific CSS in the core theme
- preserve optional advanced styling as snippets instead of always-on code

This makes the theme easier to audit, release, and maintain while still feeling related to Primary.

## Differences From Primary

Compared with upstream `primary-theme/obsidian@main`, Primary Simplified removes or relocates several areas from the core theme:

| Area | Original Primary | Primary Simplified |
| --- | --- | --- |
| Style Settings | Broad surface with hundreds of IDs and many low-level controls | Compact toggle/select surface focused on common theme choices |
| Build system | Grunt-based build with generated CSS artifacts | Small Node + Sass build script |
| Fonts | CSS font declarations under `src/css/fonts` | Local WOFF2 subsets embedded into `theme.css` |
| Community plugins | Calendar and Kanban styling in core | Optional snippets in `snippets/` |
| Custom icons | Large custom icon replacement module | Optional lightweight icon polish snippet |
| Bases | Not present in the compared upstream snapshot | Core Obsidian 1.13 Bases variables supported |
| Accessibility | No dedicated reduced-motion or forced-colors layer in the compared snapshot | Dedicated reduced-motion and forced-colors overrides |
| Release shape | Larger generated theme CSS | Smaller offline `theme.css` with contract tests |

The current comparison found `25` Style Settings IDs in Primary Simplified and `518` in upstream Primary. It also found the local `theme.css` at about `762 KB`, compared with about `1.72 MB` upstream.

## Install

### Manual Install

1. Download `manifest.json` and `theme.css` from this repository or from a GitHub release.
2. Create `<vault>/.obsidian/themes/Primary Simplified/`.
3. Copy both files into that folder.
4. Reload Obsidian.
5. Select **Primary Simplified** in **Settings > Appearance > Themes**.

The original **Primary** theme by Cecilia May remains available from Obsidian's Community Themes directory.

### Optional Snippets

Optional snippets live in [`snippets/`](./snippets/). They are not bundled into `theme.css`.

To use one:

1. Copy the `.css` file into `<vault>/.obsidian/snippets/`.
2. Open **Settings > Appearance > CSS snippets**.
3. Enable the snippet.

Available snippets:

- [`primary-decimal-lists.css`](./snippets/primary-decimal-lists.css): nested ordered lists using `1.`, `1.1`, `1.1.1` style numbering.
- [`primary-checkbox-icons.css`](./snippets/primary-checkbox-icons.css): semantic checkbox icons for task states such as in-progress, important, question, cancelled, idea, and blocked.
- [`primary-callout-showcase.css`](./snippets/primary-callout-showcase.css): expressive custom callout aliases such as `help`, `decision`, `source`, `method`, `risk`, and `ship`.
- [`primary-calendar-plugin.css`](./snippets/primary-calendar-plugin.css): optional polish for the Calendar community plugin.
- [`primary-kanban-plugin.css`](./snippets/primary-kanban-plugin.css): optional polish for the Kanban community plugin.
- [`primary-custom-icons-lite.css`](./snippets/primary-custom-icons-lite.css): small icon refinements without the full upstream custom-icon replacement set.

For a quick visual check, copy [`help-vault-preview.md`](./snippets/help-vault-preview.md) into a test vault and enable the snippets you want to inspect.

## Customization

Primary Simplified intentionally keeps Style Settings focused. Use Obsidian's built-in **Settings > Appearance** controls for:

- interface font
- text font
- monospace font
- accent color
- editor font size

Use the optional Style Settings plugin for theme-specific controls such as curated accent palettes, density, heading scale, system-font fallback, reduced motion, popup blur, ribbon and status bar layout, editor background, active-line highlighting, link underlines, alternative checkboxes, embeds, and folder/bookmark color presets.

This release removes the previous collapsed legacy section and many low-level color, border, animation, heading-alignment, and folder-color controls. Existing saved Style Settings values for removed IDs will no longer apply.

## Release Readiness

Current assessment: the theme is close to technically release-ready, but not yet ready for official Community Themes submission until the fork policy gate is documented.

Ready or largely ready:

- root release files are present
- release version is synchronized across `manifest.json`, `versions.json`, and `package.json`
- release workflow avoids `v`-prefixed tags
- tests cover Style Settings normalization, removed legacy IDs, Obsidian 1.13 callout compatibility, Bases variables, offline CSS, release size, and screenshot dimensions
- optional plugin-specific styling is outside the core theme

Still required before official submission:

- publicly verifiable original-author approval, or qualifying unreachable-author evidence
- a real GitHub release whose tag exactly matches `manifest.json`
- release assets attached as binary files: `manifest.json` and `theme.css`
- fresh screenshot review in a real vault
- Obsidian smoke testing on current desktop and mobile versions
- manual QA for optional snippets if they are mentioned in release notes

## Development

Primary Simplified is built with Sass and a small Node.js script using Dart Sass.

Prerequisite: a current LTS [Node.js](https://nodejs.org/) release.

```bash
npm install
npm run build
npm test
```

For active development:

```bash
npm run watch
```

The build compiles `src/scss/index.scss`, embeds the local WOFF2 font subsets from `src/fonts`, prepends the license and attribution banner from `src/css/readme.css`, appends Style Settings metadata from `src/css/style-settings.css`, and writes the distributable root [`theme.css`](./theme.css).

Before publishing, run the checks above and complete [`RELEASE_CHECKLIST.md`](./RELEASE_CHECKLIST.md) in a real Obsidian vault.

## Attribution

Primary Simplified is an independent fork and is not affiliated with or endorsed by Cecilia May or the original Primary project.

This fork retains the original copyright and license notices and is distributed under the [GNU General Public License v3.0](./LICENSE). The repository began as an imported snapshot of Primary and does not contain the complete upstream Git history.

If you want to support Cecilia May's original work, visit the original author's [Ko-fi page](https://ko-fi.com/ceciliamay).

## License

Primary Simplified is licensed under the **GNU General Public License v3.0**. See [LICENSE](./LICENSE) for the full license text and [`src/css/readme.css`](./src/css/readme.css) for fork and upstream notices.
