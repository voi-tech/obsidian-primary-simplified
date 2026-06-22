# Contributing to Primary Simplified

Thanks for considering a contribution! This guide covers the developer workflow. For reporting bugs or suggesting features as a non-developer, see this fork's [Issues page](../../issues) and the README's [Contributing](./README.md#-contributing) section instead.

## Setup

```
npm install
```

See the README's [Build Instructions](./README.md#build-instructions) for `npm run build` (one-shot) vs `npm run watch` (live-reload into a local vault).

## Project structure

- `src/scss/**` — the only source of truth for styles. Organized in numbered layers (`10_foundations` → `60_community-plugins`); follow the existing layer when adding rules.
- `src/css/{readme,style-settings}.css`, `src/css/fonts/*.css` — hand-maintained CSS prepended/appended to the compiled output.
- `theme.css` — the generated, distributable artifact. **Never hand-edit it** — run `npm run build` instead.
- `src/css/main*.css` / `*.css.map` are build artifacts and are gitignored; don't commit them.

## Style guidelines

- **No hardcoded colors, spacing, or radii outside `src/scss/10_foundations/palettes/_classic-original.scss`.** All visual tokens live there as CSS custom properties on `body`, with `.theme-light` / `.theme-dark` overrides only where light/dark must differ.
- **Avoid `!important`.** If you must use it, leave a comment explaining why (see `_callout.scss` and `_prompt.scss` for existing examples).
- **Don't introduce SCSS variables (`$…`) or `@import`.** The codebase uses `@use` exclusively and keeps all theming in runtime CSS custom properties so Style Settings and user snippets keep working.
- Prefer the narrowest selector that solves the problem — avoid deep nesting and broad, fragile selectors on Obsidian's internal DOM.

## Definition of done for CSS/Sass changes

Before opening a PR:

- [ ] The change is scoped to one Issue or one clearly described problem.
- [ ] `npm run build` was run and the regenerated `theme.css` is included in the PR.
- [ ] Verified in **both** light and dark mode.
- [ ] Verified on **both** desktop and mobile (or noted as not applicable).
- [ ] Verified in **both** Live Preview and Reading View, where relevant.
- [ ] No new hardcoded colors/spacing outside the palette file, and no unexplained `!important`.
- [ ] If `src/css/style-settings.css` was touched, the Style Settings panel was reloaded in Obsidian to confirm it still parses.

## Pull requests

- Keep PRs small and focused on one change. Large PRs that mix unrelated fixes are harder to review and merge.
- Reference the Issue number the PR addresses (`Fixes #123`) where applicable.
- Fill out the PR template's checklist honestly — it's there to catch regressions before they reach users.

## License

By contributing, you agree your contribution is licensed under the project's [GPL-3.0 license](./LICENSE).
