#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const KNOWLEDGE_DIR = path.join(ROOT, "knowledge");
const PROFILES_DIR = path.join(ROOT, "profiles");
const TARGETS = new Set(["cursor", "copilot", "cli"]);
const COPILOT_WARN_CHARS = 20000;
const REQUIRED_KEYS = ["id", "description", "tags", "file_patterns", "global"];

function fail(message) {
  console.error(`compile-context: ${message}`);
  process.exit(1);
}

function usage() {
  console.error(
    "Usage: compile-context.js --profile=<fintech|exchange|saas> --target=<cursor|copilot|cli> [--out=<dir>]",
  );
  process.exit(1);
}

function parseArgs(argv) {
  const args = { out: process.cwd() };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--help" || token === "-h") usage();
    const [flag, inline] = token.includes("=") ? token.split(/=(.*)/s) : [token, undefined];
    const value = inline === undefined ? argv[++i] : inline;
    if (!flag.startsWith("--") || value === undefined) usage();
    const key = flag.slice(2);
    if (key === "profile" || key === "target" || key === "out") args[key] = value;
    else fail(`unknown argument ${flag}`);
  }
  if (!args.profile || !args.target) usage();
  if (!TARGETS.has(args.target)) fail(`unknown target ${args.target}`);
  return args;
}

function parseScalar(raw, key) {
  const value = raw.trim();
  if (key === "global") {
    if (value !== "true" && value !== "false") fail(`${key} must be true or false`);
    return value === "true";
  }
  if (key === "tags" || key === "file_patterns") {
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== "string")) {
        fail(`${key} must be a one-line JSON array of strings`);
      }
      return parsed;
    } catch {
      fail(`${key} must be a one-line JSON array of strings`);
    }
  }
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function parseModule(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  if (!raw.startsWith("---\n")) fail(`${filePath} must start with frontmatter`);
  const end = raw.indexOf("\n---\n", 4);
  if (end === -1) fail(`${filePath} is missing a closing frontmatter marker`);
  const frontmatter = {};
  for (const line of raw.slice(4, end).split("\n")) {
    if (line.trim() === "") continue;
    const splitAt = line.indexOf(":");
    if (splitAt === -1) fail(`${filePath} has an unreadable frontmatter line`);
    const key = line.slice(0, splitAt).trim();
    if (!REQUIRED_KEYS.includes(key)) fail(`${filePath} has unsupported key ${key}`);
    frontmatter[key] = parseScalar(line.slice(splitAt + 1), key);
  }
  for (const key of REQUIRED_KEYS) {
    if (frontmatter[key] === undefined) fail(`${filePath} is missing ${key}`);
  }
  if (frontmatter.global && frontmatter.file_patterns.length > 0) {
    fail(`${filePath} is global and must use an empty file_patterns array`);
  }
  if (!frontmatter.global && frontmatter.file_patterns.length === 0) {
    fail(`${filePath} must list file_patterns or set global: true`);
  }
  return {
    stem: path.basename(filePath, ".md"),
    meta: frontmatter,
    body: raw.slice(end + 5).replace(/^\n/, "").replace(/\s*$/, ""),
  };
}

function loadProfile(name) {
  const profilePath = path.join(PROFILES_DIR, `${name}.json`);
  if (!fs.existsSync(profilePath)) fail(`unknown profile ${name}`);
  let profile;
  try {
    profile = JSON.parse(fs.readFileSync(profilePath, "utf8"));
  } catch {
    fail(`${profilePath} is not valid JSON`);
  }
  if (!profile || typeof profile.name !== "string" || !Array.isArray(profile.modules)) {
    fail(`${profilePath} must contain name and modules`);
  }
  const seenIds = new Set();
  const modules = profile.modules.map((stem) => {
    if (typeof stem !== "string" || stem.includes("/") || stem.includes("..")) {
      fail(`invalid module name ${stem}`);
    }
    const filePath = path.join(KNOWLEDGE_DIR, `${stem}.md`);
    if (!fs.existsSync(filePath)) fail(`profile ${name} names missing module ${stem}`);
    const module = parseModule(filePath);
    if (seenIds.has(module.meta.id)) fail(`duplicate module id ${module.meta.id}`);
    seenIds.add(module.meta.id);
    return module;
  });
  return { name: profile.name, modules };
}

function yamlString(value) {
  return JSON.stringify(value);
}

function renderCursor(module) {
  const lines = [
    "---",
    `description: ${yamlString(module.meta.description)}`,
    `alwaysApply: ${module.meta.global ? "true" : "false"}`,
  ];
  if (!module.meta.global) {
    lines.push(`globs: ${JSON.stringify(module.meta.file_patterns)}`);
  }
  lines.push("---", "", module.body, "");
  return lines.join("\n");
}

function sectionScope(module) {
  if (module.meta.global) return "Applies to every task.";
  return `Applies when editing: ${module.meta.file_patterns.join(", ")}.`;
}

function renderFlat(profileName, modules, preamble) {
  const parts = [
    `<!-- compile-context profile=${profileName} -->`,
    "",
    `# ${profileName}`,
    "",
    preamble,
    "",
  ];
  for (const module of modules) {
    parts.push(
      `## ${module.meta.description}`,
      "",
      sectionScope(module),
      "",
      module.body,
      "",
    );
  }
  return parts.join("\n");
}

function writeCursor(outDir, profile) {
  const rulesDir = path.join(outDir, ".cursor", "rules");
  fs.mkdirSync(rulesDir, { recursive: true });
  const manifestPath = path.join(rulesDir, ".compile-context.json");
  if (fs.existsSync(manifestPath)) {
    const previous = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    for (const fileName of previous.files || []) {
      if (fileName.includes("/") || fileName.includes("..")) continue;
      const owned = path.join(rulesDir, fileName);
      if (fs.existsSync(owned)) fs.unlinkSync(owned);
    }
  }
  const files = [];
  for (const module of profile.modules) {
    const fileName = `${module.stem}.mdc`;
    fs.writeFileSync(path.join(rulesDir, fileName), renderCursor(module));
    files.push(fileName);
  }
  fs.writeFileSync(
    manifestPath,
    `${JSON.stringify({ profile: profile.name, files }, null, 2)}\n`,
  );
}

function writeFlat(outDir, relativePath, contents) {
  const destination = path.join(outDir, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, contents);
  if (contents.length > COPILOT_WARN_CHARS && relativePath.endsWith("copilot-instructions.md")) {
    console.error(
      `compile-context: warning: ${relativePath} is ${contents.length} characters. Copilot may truncate instruction files.`,
    );
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const profile = loadProfile(args.profile);
  const outDir = path.resolve(args.out);
  if (args.target === "cursor") {
    writeCursor(outDir, profile);
    return;
  }
  if (args.target === "copilot") {
    writeFlat(
      outDir,
      path.join(".github", "copilot-instructions.md"),
      renderFlat(
        profile.name,
        profile.modules,
        "Copilot cannot route instructions by file. A section applies only when the files you are editing match its paths. Sections that apply to every task always apply.",
      ),
    );
    return;
  }
  writeFlat(
    outDir,
    ".ai-context.md",
    renderFlat(
      profile.name,
      profile.modules,
      "Follow every section that applies to every task. Ignore a section when none of the files in this task match its paths.",
    ),
  );
}

main();
