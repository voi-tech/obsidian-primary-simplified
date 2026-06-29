# Changelog

All notable changes to Primary Simplified will be documented in this file.

The project plans to use a SemVer-compatible CalVer scheme: `YY.M.MICRO`, where `MICRO` starts at `0` each month. The first release number will be selected from its actual publication date.

## [Unreleased]

### Added

- Independent **Primary Simplified** fork identity, attribution, and dated modification notice.
- Accessibility fallbacks for reduced motion and forced-colors environments.
- CI checks that rebuild `theme.css` on pushes and pull requests and fail when the committed artifact is stale.
- Obsidian 1.13 Bases tokens, a compact release contract test suite, `versions.json`, and a complete manual release checklist.
- Locally embedded Latin and Latin Extended WOFF2 subsets for Inter and Cascadia Code, including their OFL licenses.

### Changed

- Reworked installation, contribution, issue, and pull request documentation for the independently maintained fork.
- Removed fork funding links while retaining clearly labeled attribution and support links for the original author.
- Hardened the draft-release workflow with an LTS Node.js build, artifact verification, explicit permissions, and tag-to-manifest version validation.
- Preserved the existing `primary-theme` Style Settings namespace while reducing the visible settings surface to one compact `Theme settings` section with 17 core controls.
- Removed the collapsed legacy Style Settings section and many low-level IDs for typography, heading borders, bookmark folders, checkbox icon colors, hover-only color variants, granular motion toggles, file-header hiding, per-heading vertical alignment, and individual folder-color toggles.
- Replaced individual folder and bookmark color toggles with one folder color preset and added a system-font fallback toggle.
- Rewrote the README around manual installation, core customization, Community Themes readiness, and the current fork approval gate.
- Replaced Grunt with a deterministic Node.js and Dart Sass build.
- Split the classic palette into shared, light, and dark token partials.

### Fixed

- Carried forward the fork baseline's Obsidian UI compatibility corrections.
- Added unique stateful Style Settings IDs where duplicate IDs previously coupled controls or collapsed sections.
- Added an opt-out toggle for alternative checkbox styling while retaining the existing appearance by default.
- Updated callout colors to the valid CSS color format required by Obsidian 1.13.
- Corrected non-markdown link settings, removed duplicate ids, and raised essential light-theme link contrast to WCAG AA.
- Removed obsolete mobile drawer selectors, expensive `:has()` selectors, global Lucide replacements, and deep Calendar/Kanban skins.

### Release gate

- The release candidate is `26.6.0` with `minAppVersion` `1.13.0`.
- Publication remains gated on the manual test matrix and Obsidian's documented fork-eligibility requirement.
