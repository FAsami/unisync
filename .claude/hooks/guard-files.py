#!/usr/bin/env python3
"""
PreToolUse guard for Edit/Write/MultiEdit/NotebookEdit.

Blocks (exit 2, reason on stderr) edits that are almost always a mistake in
this repo. Each message says what to do instead.
"""
import json
import os
import subprocess
import sys
from pathlib import Path

try:
    payload = json.load(sys.stdin)
except Exception:
    sys.exit(0)  # never break the session on malformed input

tool_input = payload.get("tool_input") or {}
raw = tool_input.get("file_path") or tool_input.get("notebook_path")
if not raw:
    sys.exit(0)

root = Path(os.environ.get("CLAUDE_PROJECT_DIR") or payload.get("cwd") or ".").resolve()
path = Path(raw)
if not path.is_absolute():
    path = (Path(payload.get("cwd") or root) / path)
path = path.resolve()
try:
    rel = path.relative_to(root).as_posix()
except ValueError:
    sys.exit(0)  # outside the repo: not our business

name = path.name


def block(reason: str) -> None:
    print(f"Blocked by .claude/hooks/guard-files.py: {rel}\n{reason}", file=sys.stderr)
    sys.exit(2)


def tracked(p: str) -> bool:
    r = subprocess.run(
        ["git", "-C", str(root), "ls-files", "--error-unmatch", p],
        capture_output=True,
    )
    return r.returncode == 0


# 1. Applied migrations are immutable.
if rel.startswith("hasura/migrations/") and name == "up.sql" and tracked(rel):
    block(
        "Committed migrations may already be applied in some environment; editing "
        "them desynchronises databases. Create a new migration instead:\n"
        "  cd hasura && hasura migrate create <name> --database-name default\n"
        "(see the hasura-change skill)."
    )

# 2. Generated code.
if name in {"generated.ts", "generated.tsx"} or "/__generated__/" in rel:
    block(
        "This file is GraphQL codegen output. Change the .graphql/.ts documents or "
        "Hasura metadata, then regenerate: `cd server && yarn codegen` or "
        "`cd mobile && yarn generate-types` (needs a running Hasura)."
    )

# 3. Secrets.
if (name == ".env" or name.startswith(".env.")) and name != ".env.example":
    block(
        "Never write real secrets. Update the committed template instead "
        "(server/env.example, web/.env.example, mobile/.env.example)."
    )
if name in {"service-account.json", "google-services.json", "GoogleService-Info.plist"}:
    block("Credential/config files from Firebase are managed outside Claude. Ask the user.")

# 4. Lockfiles.
if name in {"yarn.lock", "package-lock.json", "pnpm-lock.yaml"}:
    block(
        "Lockfiles are generated. Use `yarn add <pkg>` / `yarn remove <pkg>` in the "
        "package directory instead of editing by hand."
    )

# 5. Build output.
for prefix in ("mobile/build-android/", "mobile/build-ios/", "server/dist/", "web/.next/"):
    if rel.startswith(prefix):
        block("This is build output. Change the source and rebuild.")
if rel.startswith("api/") and ("/bin/" in rel or "/obj/" in rel):
    block("This is .NET build output. Change the source and rebuild.")

# 6. Applied API migrations are immutable too.
if rel.startswith("api/db/migrations/") and rel.endswith(".sql") and tracked(rel):
    block(
        "This API migration is committed and may already be applied. Add a new file "
        "with the next number instead (see api/CLAUDE.md)."
    )

sys.exit(0)
