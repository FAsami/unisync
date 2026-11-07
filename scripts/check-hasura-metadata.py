#!/usr/bin/env python3
"""
Static guardrails for hasura/metadata. Run: python3 scripts/check-hasura-metadata.py

Checks
  1. Every `!include` target exists and every table file is included (catches a
     deleted table file still referenced from tables.yaml, which breaks
     `hasura metadata apply`).
  2. Every YAML file parses.
  3. No role may SELECT secret columns (tokens, password hashes, OTP hashes).
     The `admin` role is Hasura's built-in superuser and is not listed in
     metadata, so any role that appears here is a non-admin role.
  4. Roles that anyone can obtain without logging in (guest-consumer) get no
     insert/update/delete permissions at all.
  5. Event-trigger and action webhooks send the SERVER-AUTH-SECRET header the
     API server checks.
"""
import re
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
META = ROOT / "hasura" / "metadata"
TABLES_DIR = META / "databases" / "default" / "tables"

SECRET_COLUMNS = {
    "password",
    "access_token",
    "refresh_token",
    "otp_hash",
    "token_hash",
}
PUBLIC_ROLES = {"guest-consumer"}
SECRET_HEADER = "SERVER-AUTH-SECRET"

errors: list[str] = []


class IncludeLoader(yaml.SafeLoader):
    """Treat `"!include x"` strings as plain strings (Hasura resolves them)."""


def load(path: Path):
    try:
        return yaml.load(path.read_text(), Loader=IncludeLoader)
    except yaml.YAMLError as exc:
        errors.append(f"{path.relative_to(ROOT)}: invalid YAML: {exc}")
        return None


def check_includes():
    index = TABLES_DIR / "tables.yaml"
    entries = load(index) or []
    included = set()
    for entry in entries:
        m = re.fullmatch(r"!include (.+)", str(entry))
        if not m:
            errors.append(f"tables.yaml: unexpected entry {entry!r}")
            continue
        name = m.group(1)
        included.add(name)
        if not (TABLES_DIR / name).is_file():
            errors.append(
                f"tables.yaml includes {name}, which does not exist "
                f"(hasura metadata apply will fail)"
            )
    for f in TABLES_DIR.glob("*.yaml"):
        if f.name != "tables.yaml" and f.name not in included:
            errors.append(f"{f.name} exists but is not included from tables.yaml")


def check_table(path: Path):
    doc = load(path)
    if not isinstance(doc, dict):
        return
    table = doc.get("table", {})
    label = f"{table.get('schema')}.{table.get('name')} ({path.name})"

    for perm in doc.get("select_permissions", []) or []:
        role = perm.get("role")
        cols = set((perm.get("permission") or {}).get("columns") or [])
        leaked = cols & SECRET_COLUMNS
        if leaked:
            errors.append(
                f"{label}: role '{role}' can select secret column(s) {sorted(leaked)}"
            )

    for kind in ("insert_permissions", "update_permissions", "delete_permissions"):
        for perm in doc.get(kind, []) or []:
            if perm.get("role") in PUBLIC_ROLES:
                errors.append(
                    f"{label}: public role '{perm.get('role')}' has {kind.replace('_permissions', '')} permission"
                )

    for trigger in doc.get("event_triggers", []) or []:
        headers = {h.get("name") for h in trigger.get("headers", []) or []}
        if SECRET_HEADER not in headers:
            errors.append(
                f"{label}: event trigger '{trigger.get('name')}' does not send {SECRET_HEADER}"
            )


def check_actions():
    doc = load(META / "actions.yaml") or {}
    for action in doc.get("actions", []) or []:
        definition = action.get("definition") or {}
        headers = {h.get("name") for h in definition.get("headers", []) or []}
        if SECRET_HEADER not in headers:
            errors.append(
                f"actions.yaml: action '{action.get('name')}' does not send {SECRET_HEADER}"
            )


def main() -> int:
    for f in sorted(META.rglob("*.yaml")):
        load(f)
    check_includes()
    for f in sorted(TABLES_DIR.glob("*.yaml")):
        if f.name != "tables.yaml":
            check_table(f)
    check_actions()

    if errors:
        print("Hasura metadata check FAILED:\n")
        for e in errors:
            print(f"  - {e}")
        return 1
    print("Hasura metadata check passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
