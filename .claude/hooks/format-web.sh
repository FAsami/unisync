#!/bin/bash
# PostToolUse: run Prettier on web/ files Claude just edited, so `yarn
# format:check` in CI never fails on Claude's changes. Silent no-op otherwise.
set -uo pipefail

root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
file="$(python3 -c 'import json,sys; d=json.load(sys.stdin); print((d.get("tool_input") or {}).get("file_path") or "")' 2>/dev/null)"

case "$file" in
  "$root"/web/*.ts|"$root"/web/*.tsx|"$root"/web/*.js|"$root"/web/*.jsx|"$root"/web/*.json|"$root"/web/*.css|"$root"/web/*.md) ;;
  *) exit 0 ;;
esac
case "$file" in
  */node_modules/*|*/.next/*) exit 0 ;;
esac

prettier="$root/web/node_modules/.bin/prettier"
[ -x "$prettier" ] || exit 0
(cd "$root/web" && "$prettier" --write --log-level warn "$file") >&2 || true
exit 0
