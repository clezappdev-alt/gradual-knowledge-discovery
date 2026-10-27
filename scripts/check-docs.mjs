#!/usr/bin/env node
// Repository verification.
//
// Today every claim this repo makes is a documentation claim, so this is the real
// verification: required files exist, relative links resolve, no absolute paths from
// a developer's machine leak into tracked files, and the house author rule holds.
//
// It grows with the repo. When source exists, `pnpm verify` adds typecheck and tests
// to the same command, so CONTRIBUTING and CI never diverge (one command, verbatim).

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const TEXT_EXTENSIONS = [".md", ".json", ".yml", ".yaml", ".mjs", ".ts", ".txt", ".gitignore"];

const REQUIRED_FILES = [
  "AGENTS.md",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "LICENSE",
  "README.md",
  "SECURITY.md",
  "package.json",
];

const PACKAGE_FIELDS = ["name", "description", "license", "author", "repository", "engines"];

// Built from parts so this file does not match itself.
const LEAK_PATTERNS = [
  { name: "home directory", re: new RegExp("/" + "home/") },
  { name: "macOS home directory", re: new RegExp("/" + "Users/") },
  { name: "Windows drive path", re: new RegExp("[A-Z]:\\\\\\\\") },
  { name: "container workspace", re: new RegExp("AI_" + "projects") },
];

const AUTHOR_FORBIDDEN = "cle" + "ceta";
// The house rule is about author *fields*, not prose: the contract itself has to be
// able to name the forbidden value when it states the rule.
const AUTHOR_FIELD_PATTERN = /("?author"?\s*[:=])|copyright \(c\)/i;

function trackedFiles() {
  // Tracked files plus untracked-but-not-ignored ones: verification must mean the
  // same thing before and after `git add`, and .gitignore stays the single source
  // of what is local-only.
  const out = execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], {
    cwd: ROOT,
    encoding: "utf8",
  });
  return [...new Set(out.split("\0").filter(Boolean))].sort();
}

function readText(relPath) {
  const abs = resolve(ROOT, relPath);
  return existsSync(abs) && statSync(abs).isFile() ? readFileSync(abs, "utf8") : null;
}

function checkRequired(files) {
  for (const required of REQUIRED_FILES) {
    if (!files.includes(required)) failures.push(`missing required file: ${required}`);
  }
}

function checkPackageJson(files) {
  if (!files.includes("package.json")) return;
  let pkg;
  try {
    pkg = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8"));
  } catch (error) {
    failures.push(`package.json is not valid JSON: ${error.message}`);
    return;
  }
  for (const field of PACKAGE_FIELDS) {
    if (pkg[field] === undefined || pkg[field] === "") failures.push(`package.json: missing "${field}"`);
  }
  if (pkg.license !== "MIT") failures.push(`package.json: license must be MIT, found ${pkg.license}`);
  if (pkg.author !== "clezapp") failures.push(`package.json: author must be clezapp, found ${pkg.author}`);
  if (pkg.private !== true) failures.push("package.json: must stay private until the publish gate");
  if (!pkg.scripts || typeof pkg.scripts.verify !== "string") failures.push('package.json: missing "verify" script');
}

function checkLinks(files) {
  const linkPattern = /\[[^\]]*\]\(([^)\s]+)\)/g;
  for (const relPath of files.filter((f) => f.endsWith(".md"))) {
    const text = readText(relPath);
    if (text === null) continue;
    for (const match of text.matchAll(linkPattern)) {
      const target = match[1];
      if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith("#")) continue;
      const withoutFragment = target.split("#")[0];
      if (!withoutFragment) continue;
      const abs = resolve(ROOT, dirname(relPath), decodeURIComponent(withoutFragment));
      if (!existsSync(abs)) failures.push(`broken link in ${relPath}: ${target}`);
    }
  }
}

function checkLeaks(files) {
  for (const relPath of files) {
    if (!TEXT_EXTENSIONS.some((ext) => relPath.endsWith(ext))) continue;
    const text = readText(relPath);
    if (text === null) continue;
    const lines = text.split("\n");
    lines.forEach((line, index) => {
      for (const pattern of LEAK_PATTERNS) {
        if (pattern.re.test(line)) {
          failures.push(`machine-specific path (${pattern.name}) in ${relPath}:${index + 1}`);
        }
      }
      if (AUTHOR_FIELD_PATTERN.test(line) && line.includes(AUTHOR_FORBIDDEN)) {
        failures.push(`forbidden author name in ${relPath}:${index + 1} (author is clezapp)`);
      }
    });
  }
}

function main() {
  const files = trackedFiles();
  checkRequired(files);
  checkPackageJson(files);
  checkLinks(files);
  checkLeaks(files);

  if (failures.length > 0) {
    failures.sort();
    for (const failure of failures) process.stderr.write(`FAIL ${failure}\n`);
    process.stderr.write(`\n${failures.length} verification failure(s)\n`);
    process.exit(1);
  }
  process.stdout.write(`ok: ${files.length} tracked files verified\n`);
}

main();
