#!/usr/bin/env bash
# Run every project guardrail locally - the same checks CI runs.
#
#   scripts/check-all.sh            # everything
#   scripts/check-all.sh server web # only some packages (api|server|web|mobile|hasura)
#
# api: database tests run when UNISYNC_TEST_DB is set (see api/CLAUDE.md),
# otherwise they are reported as skipped.
#
# Packages without node_modules are skipped with a hint instead of failing,
# so this is usable on a fresh clone.
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGETS=("$@")
[ ${#TARGETS[@]} -eq 0 ] && TARGETS=(hasura api server web mobile)

failed=()
skipped=()

run() { # run <label> <dir> <cmd...>
  local label="$1" dir="$2"
  shift 2
  echo "▶ ${label}"
  if (cd "$ROOT/$dir" && "$@"); then
    echo "✔ ${label}"
  else
    echo "✘ ${label}"
    failed+=("$label")
  fi
}

need_modules() { # need_modules <dir>
  if [ ! -d "$ROOT/$1/node_modules" ]; then
    echo "⚠ $1: node_modules missing, skipping (run: cd $1 && yarn install)"
    skipped+=("$1")
    return 1
  fi
}

for t in "${TARGETS[@]}"; do
  case "$t" in
    hasura)
      run "hasura: metadata guardrails" . python3 scripts/check-hasura-metadata.py
      ;;
    api)
      if ! command -v dotnet >/dev/null 2>&1 && [ ! -x "$HOME/.dotnet/dotnet" ]; then
        echo "⚠ api: .NET SDK missing, skipping (install: https://dot.net/v1/dotnet-install.sh --channel 10.0)"
        skipped+=("api")
        continue
      fi
      DOTNET="$(command -v dotnet || echo "$HOME/.dotnet/dotnet")"
      run "api: build" api "$DOTNET" build --nologo -v q
      run "api: test" api "$DOTNET" test --nologo --no-build
      ;;
    server)
      need_modules server || continue
      run "server: typecheck" server yarn -s typecheck
      run "server: test" server yarn -s test
      ;;
    web)
      need_modules web || continue
      run "web: lint" web yarn -s lint
      run "web: typecheck" web yarn -s typecheck
      run "web: format" web yarn -s format:check
      ;;
    mobile)
      need_modules mobile || continue
      run "mobile: lint" mobile yarn -s lint
      run "mobile: typecheck" mobile yarn -s typecheck
      ;;
    *)
      echo "unknown target: $t (expected api|server|web|mobile|hasura)"
      exit 2
      ;;
  esac
done

echo
[ ${#skipped[@]} -gt 0 ] && echo "Skipped (missing toolchain or node_modules): ${skipped[*]}"
if [ ${#failed[@]} -gt 0 ]; then
  echo "FAILED: ${failed[*]}"
  exit 1
fi
echo "All checks passed."
