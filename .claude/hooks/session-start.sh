#!/bin/bash
# Installs dependencies in Claude Code cloud sessions so tests, lint and
# typecheck work immediately (scripts/check-all.sh).
#
# Each package (web, mobile) has its own yarn.lock. A package is
# reinstalled only when this script, its package.json or its yarn.lock changed
# since the last successful install. The hash file lives inside node_modules,
# so it disappears together with the packages.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}"
HOOK=.claude/hooks/session-start.sh

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

# .NET SDK for api/ (global tool: installed only when missing).
if ! command -v dotnet >/dev/null 2>&1 && [ ! -x "$HOME/.dotnet/dotnet" ]; then
  echo "[session-start] installing .NET 10 SDK"
  curl -sSL https://dot.net/v1/dotnet-install.sh -o /tmp/dotnet-install.sh
  bash /tmp/dotnet-install.sh --channel 10.0 --install-dir "$HOME/.dotnet" >/dev/null
fi
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  {
    echo "export PATH=\"$HOME/.dotnet:\$PATH\""
    echo "export DOTNET_CLI_TELEMETRY_OPTOUT=1 DOTNET_NOLOGO=1"
  } >> "$CLAUDE_ENV_FILE"
fi

install_pkg web
# Native build scripts (pods/gradle/codegen) are not needed for lint/typecheck.
install_pkg mobile --ignore-scripts

# NuGet restore for api/, skipped when no project or package file changed.
api_hashes=api/obj/.session-start.sha256
if ! sha256sum --check --status "$api_hashes" 2>/dev/null; then
  rm -f "$api_hashes"
  echo "[session-start] api: restoring NuGet packages"
  (cd api && "$HOME/.dotnet/dotnet" restore --nologo -v q)
  mkdir -p api/obj
  sha256sum "$HOOK" api/Directory.Packages.props api/*/*/*.csproj > "$api_hashes" || rm -f "$api_hashes"
else
  echo "[session-start] api: packages up to date"
fi
