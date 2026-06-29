# Primary Simplified release checklist

## Policy and artifacts

- [ ] Publicly verifiable approval from Cecilia May, or qualifying evidence of an unsuccessful contact attempt, is linked from the release notes.
- [ ] `manifest.json`, `versions.json`, package version, tag, and release title use the same `x.y.z` version without a `v` prefix.
- [ ] The GitHub release contains `manifest.json` and `theme.css` as binary attachments.
- [ ] `screenshot.png` is current, legible, 512 × 288, and represents the released theme.
- [ ] README, changelog, attribution, GPL license, and both OFL notices are current.
- [ ] README clearly explains that Primary Simplified is a fork, why it exists, how it differs from Primary, and whether the fork policy gate is satisfied.
- [ ] Optional snippets in `snippets/` are documented as manual CSS snippets and are not implied to be bundled into `theme.css`.
- [ ] A clean install from the GitHub release and an update from the previous version both succeed.

## Platform matrix

- [ ] Obsidian 1.13.0 and the newest public Obsidian release use the newest installer.
- [ ] macOS, Windows, and Linux pass desktop smoke tests.
- [ ] iOS phone/tablet and Android phone/tablet pass touch tests in portrait and landscape.
- [ ] Light, dark, and system appearance switching render without stale colors.
- [ ] Main window, pop-out windows, fullscreen, normal tabs, pinned tabs, stacked tabs, ribbon, sidebars, and status bar render correctly.
- [ ] The Obsidian 1.13 Settings window and Style Settings work when settings open in a separate window.

## Editor fixture

- [ ] Reading View, Live Preview, and Source Mode match for H1–H6, emphasis combinations, highlights, resolved/unresolved/external links, blockquotes, nested lists, tables, tags, properties, footnotes, math, Mermaid, inline/fenced code, and selections.
- [ ] Standard, semantic, and custom checkboxes remain legible in checked, unchecked, hover, active, and disabled states.
- [ ] Every standard callout alias, nested callouts, custom callouts, collapsed callouts, and callout icons use the intended semantic color.
- [ ] Images, resized images, audio, video, PDFs, note embeds, block embeds, and Bases embeds do not overflow.
- [ ] Files, Search, Bookmarks, Outline, Backlinks, Graph, Canvas, Bases, Tags, and Properties pass their primary interactions.

## Interaction and accessibility

- [ ] Keyboard focus is visible on buttons, inputs, tabs, menus, toggles, sliders, links, and Style Settings controls.
- [ ] Hover, active, selected, drag-and-drop, context menu, modal, prompt, notice, tooltip, dropdown, and loading states are distinct.
- [ ] Text contrast is at least 4.5:1 and non-text UI contrast is at least 3:1 in both themes.
- [ ] 200% zoom, reduced motion, forced colors, RTL, Polish, and a language with long labels remain usable.
- [ ] Mobile keyboard, safe areas, touch targets, tab reordering, split panes, and pinned sidebars do not cover content.

## Style Settings and performance

- [ ] Fresh settings, migrated settings after removed legacy IDs, each core toggle/select, themed colors, individual reset, and full reset work.
- [ ] The Style Settings surface contains only the supported core controls; removed legacy IDs do not reappear.
- [ ] Style Settings reports no parse errors and applies the same values in main and pop-out windows.
- [ ] Optional snippets are checked for parse errors, remote URLs, and regressions in the surfaces they target.
- [ ] A large vault and large Canvas remain responsive while scrolling, switching themes, and idling.
- [ ] Developer tools show no theme-caused errors, repeated layout warnings, remote requests, or missing resources.
- [ ] `npm ci`, `npm test`, `npm run build`, and the clean-tree artifact check all pass.
