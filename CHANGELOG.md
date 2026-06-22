# Changelog

All notable changes to Primary Simplified will be documented in this file.

The project plans to use a SemVer-compatible CalVer scheme: `YY.M.MICRO`, where `MICRO` starts at `0` each month. The first release number will be selected from its actual publication date.

## [Unreleased]

### Added

- Independent **Primary Simplified** fork identity, attribution, and dated modification notice.
- Accessibility fallbacks for reduced motion and forced-colors environments.
- CI checks that rebuild `theme.css` on pushes and pull requests and fail when the committed artifact is stale.

### Changed

- Reworked installation, contribution, issue, and pull request documentation for the independently maintained fork.
- Removed fork funding links while retaining clearly labeled attribution and support links for the original author.
- Hardened the draft-release workflow with an LTS Node.js build, artifact verification, explicit permissions, and tag-to-manifest version validation.
- Preserved the existing `primary-theme` Style Settings namespace and all setting IDs to avoid resetting user configuration.

### Fixed

- Carried forward the fork baseline's Obsidian UI compatibility corrections.
- Added unique stateful Style Settings IDs where duplicate IDs previously coupled controls or collapsed sections.
- Added an opt-out toggle for alternative checkbox styling while retaining the existing appearance by default.

### Release gate

- `manifest.json` remains at version `2.10.0` with `minAppVersion` `1.4.0` during preparation.
- The first Primary Simplified version and `minAppVersion` `1.13.0` will be set only after Obsidian 1.13 is publicly available and the theme passes the planned desktop, mobile, light, dark, Live Preview, Reading View, and Style Settings smoke tests.
