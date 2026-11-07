/**
 * Static guard over every GraphQL document embedded in the server source.
 * Hasura rejects an operation that declares a variable it doesn't use, uses
 * one it doesn't declare, or is malformed, and none of that shows up in tsc.
 */
import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "fs";
import path from "path";
import { parse, visit } from "graphql";

const SRC = path.resolve(__dirname, "../src");
// Codegen output is a type file, not hand-written operations.
const SKIP = new Set([path.join(SRC, "types", "generated.ts")]);

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return full.endsWith(".ts") && !SKIP.has(full) ? [full] : [];
  });

interface Doc { file: string; source: string }

const documents: Doc[] = walk(SRC).flatMap((file) => {
  const text = readFileSync(file, "utf8");
  const found: Doc[] = [];
  for (const m of text.matchAll(/`([^`]*)`/g)) {
    const body = m[1].trim();
    if (/^(query|mutation|subscription)\b/.test(body) && !body.includes("${")) {
      found.push({ file: path.relative(SRC, file), source: body });
    }
  }
  return found;
});

describe("embedded GraphQL documents", () => {
  it("finds the server's documents", () => {
    expect(documents.length).toBeGreaterThan(25);
  });

  it.each(documents.map((d) => [`${d.file}: ${d.source.split("\n")[0].slice(0, 60)}`, d]))(
    "%s",
    (_name, doc) => {
      const ast = parse((doc as Doc).source);
      for (const def of ast.definitions) {
        if (def.kind !== "OperationDefinition") continue;
        expect(def.name, "operations must be named").toBeTruthy();

        const declared = new Set(def.variableDefinitions?.map((v) => v.variable.name.value));
        const used = new Set<string>();
        visit(def.selectionSet, {
          Variable(node) {
            used.add(node.name.value);
          },
        });
        expect([...declared].filter((v) => !used.has(v)), "declared but unused").toEqual([]);
        expect([...used].filter((v) => !declared.has(v)), "used but undeclared").toEqual([]);
      }
    }
  );
});
