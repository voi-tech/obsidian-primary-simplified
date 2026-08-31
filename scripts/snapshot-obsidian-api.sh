#!/usr/bin/env bash
# Extracts the CSS variable names and CSS class names that the installed
# Obsidian build actually ships, into scripts/obsidian-api.json.
#
# Run this locally after every Obsidian update, then commit the result. The
# diff shows exactly which variables and classes appeared or disappeared, and
# validate-theme.mjs uses the snapshot to flag references the app no longer
# recognises. It cannot run in CI: it reads the locally installed app.
#
#   ./scripts/snapshot-obsidian-api.sh [/path/to/obsidian.asar]

set -euo pipefail

ASAR="${1:-/Applications/Obsidian.app/Contents/Resources/obsidian.asar}"
OUT="$(cd "$(dirname "$0")" && pwd)/obsidian-api.json"

if [ ! -f "$ASAR" ]; then
  echo "obsidian.asar not found at: $ASAR" >&2
  echo "Pass the path to it as the first argument." >&2
  exit 1
fi

VERSION=unknown
INFO="$(dirname "$(dirname "$ASAR")")/Info.plist"
if [ -f "$INFO" ] && command -v /usr/libexec/PlistBuddy >/dev/null 2>&1; then
  VERSION="$(/usr/libexec/PlistBuddy -c 'Print :CFBundleShortVersionString' "$INFO" 2>/dev/null || echo unknown)"
fi

# Variables: every --custom-property the app defines or reads.
strings "$ASAR" | grep -o -- '--[a-z][a-z0-9-]\{2,\}' | sort -u > "$OUT.vars.tmp"
# Classes: the union of two sources, because Obsidian names elements in both
# places. Stylesheets give class names in selector position (".foo"); the
# JavaScript bundle creates many more through createDiv({cls: "foo"}), where
# they appear bare. Restricting the second source to lowercase-hyphenated
# tokens keeps out camelCase JavaScript identifiers. The result is a local
# artifact, not committed.
{
  strings "$ASAR" | grep -o '\.[a-z][a-zA-Z0-9_-]\{2,\}' | sed 's/^\.//' \
    | grep -E '^[a-z][a-z0-9_-]*$'
  strings "$ASAR" | grep -oE '\b[a-z][a-z0-9]*(-[a-z0-9]+)+\b'
} | sort -u > "$OUT.cls.tmp"

python3 - "$OUT" "$VERSION" <<'PY'
import json, sys
out, version = sys.argv[1], sys.argv[2]
variables = [l.strip() for l in open(out + ".vars.tmp") if l.strip()]
classes = [l.strip() for l in open(out + ".cls.tmp") if l.strip()]
json.dump({"obsidianVersion": version, "variables": variables, "classes": classes},
          open(out, "w"), indent=0)
print(f"{out}: Obsidian {version}, {len(variables)} variables, {len(classes)} classes")
PY

rm -f "$OUT.vars.tmp" "$OUT.cls.tmp"
