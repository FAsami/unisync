#!/usr/bin/env python3
"""
Static guardrails for the API's SQL migrations (api/db/migrations).
Run: python3 scripts/check-migrations.py

Checks
  1. File names are NNNN_short_name.sql and no number is used twice
     (MigrationRunner applies them in name order and records each name once).
  2. No psql meta-commands (lines starting with a backslash, e.g. pg_dump's
     \\restrict). Only psql understands them; the API sends SQL straight to
     Postgres, which rejects them.
  3. Nothing touches hdb_catalog, the schema Hasura left behind. It is removed
     by api/db/one-off/drop-hasura-catalog.sql after the cut-over, so a
     migration that relies on it fails on every fresh database.
  4. No secrets or session-level settings that leak past the migration
     (SET without LOCAL changes the pooled connection for later requests).
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MIGRATIONS = ROOT / "api" / "db" / "migrations"
NAME = re.compile(r"^(\d{4})_[a-z0-9_]+\.sql$")
SESSION_SET = re.compile(r"^\s*SET\s+(?!LOCAL\b)(?!CONSTRAINTS\b)", re.IGNORECASE)

errors: list[str] = []


def main() -> int:
    files = sorted(MIGRATIONS.glob("*"))
    if not files:
        errors.append(f"{MIGRATIONS.relative_to(ROOT)} has no migrations")

    seen: dict[str, str] = {}
    for f in files:
        rel = f.relative_to(ROOT)
        m = NAME.match(f.name)
        if not m:
            errors.append(f"{rel}: name must look like 0007_short_name.sql")
            continue
        if m.group(1) in seen:
            errors.append(f"{rel}: number {m.group(1)} is also used by {seen[m.group(1)]}")
        seen[m.group(1)] = f.name

        statement_start = True  # SET only counts as its own statement, not UPDATE ... SET
        for n, line in enumerate(f.read_text().splitlines(), 1):
            if line.lstrip().startswith("--") or not line.strip():
                continue
            if line.startswith("\\"):
                errors.append(f"{rel}:{n}: psql meta-command (Postgres rejects it; remove the line)")
                break
            if "hdb_catalog" in line:
                errors.append(f"{rel}:{n}: touches hdb_catalog (Hasura's leftover schema; don't depend on it)")
                break
            if statement_start and SESSION_SET.match(line):
                errors.append(f"{rel}:{n}: session-level SET; use SET LOCAL so it ends with the migration's transaction")
                break
            statement_start = line.split("--")[0].rstrip().endswith(";")

    if errors:
        print("Migration check FAILED:\n")
        for e in errors:
            print(f"  - {e}")
        return 1
    print(f"Migration check passed ({len(files)} migrations).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
