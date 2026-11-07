#!/bin/bash
# Installs dependencies in Claude Code cloud sessions so tests, lint and
# typecheck work immediately (scripts/check-all.sh).
#
# Each package (server, web, mobile) has its own yarn.lock. A package is
# reinstalled only when this script, its package.json or its yarn.lock changed
# since the last successful install. The hash file lives inside node_modules,
# so it disappears together with the packages.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}"
HOOK=.claude/hooks/session-start.sh

# Hasura metadata checker needs PyYAML in the system Python.
if ! python3 -I -c 'import yaml' >/dev/null 2>&1; then
  python3 -m pip install --quiet pyyaml
fi

install_pkg() { # install_pkg <dir> [extra yarn args...]
  local dir="$1"
  shift
  local hashes="$dir/node_modules/.session-start.sha256"
  if sha256sum --check --status "$hashes" 2>/dev/null; then
    echo "[session-start] $dir: dependencies up to date"
    return
  fi
  rm -f "$hashes"
  echo "[session-start] $dir: installing dependencies"
  (cd "$dir" && yarn install --frozen-lockfile --non-interactive "$@")
  sha256sum "$HOOK" "$dir/package.json" "$dir/yarn.lock" > "$hashes" || rm -f "$hashes"
}

install_pkg server
install_pkg web
# Native build scripts (pods/gradle/codegen) are not needed for lint/typecheck.
install_pkg mobile --ignore-scripts
