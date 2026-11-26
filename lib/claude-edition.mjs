// Builds the Claude Code edition of the hehehe plugin from the Codex source.
// The Codex source stays the single authoring location; this module copies it
// and inverts the roles (Claude leads, Codex is the optional read-only reviewer).

import fs from "node:fs";
import path from "node:path";

// Skills that only make sense inside Codex. `doctor` diagnoses the Codex plugin
// installation and its caches.
const excludedSkills = new Set(["doctor"]);
// Per-skill Codex agent metadata has no Claude Code equivalent.
const excludedDirectories = new Set(["agents"]);
// Third-party design references mention product names as subject matter, not
// as agent roles, so they are copied byte for byte.
const verbatimPrefix = "skills/design-ui/references/design-ai/";

function swapRoles(text) {
  return text
    .replace(/\bCodex\b/g, "\u0000LEAD\u0000")
    .replace(/\bClaude\b/g, "Codex")
    .replace(/\u0000LEAD\u0000/g, "Claude");
}

// Sentences whose meaning does not survive a plain role swap. Each `from` is
// matched after the swap and must be present, so a change to the Codex source
// fails the build instead of silently producing wrong Claude instructions.
const rewrites = {
  "skills/hehehe/SKILL.md": [
    {
      from: "| Plugin or project setup problems | `hehehe:doctor` |\n",
      to: "",
    },
    {
      from: "- Keep edits scoped, prefer existing project patterns, avoid unrelated refactors, and preserve user changes already present in the worktree.\n",
      to: "- Keep edits scoped, prefer existing project patterns, avoid unrelated refactors, and preserve user changes already present in the worktree.\n- Treat a repository's `AGENTS.md` as project instructions with the same authority as `CLAUDE.md`. hehehe skills name `AGENTS.md` because it is the file shared across agents.\n",
    },
    { from: "`claude-review.md`", to: "`codex-review.md`" },
  ],
  "skills/subagent-resolve/SKILL.md": [
    {
      from: "Run Codex CLI reviews with `--permission-mode plan` and without write-capable allowed tools.",
      to: "Run Codex reviews read-only: use a connected Codex review tool, or `codex exec --sandbox read-only`, and never give the reviewer write access.",
    },
  ],
  "skills/browser-validate/SKILL.md": [
    {
      from: "Inspect the current session's tool and skill inventory first. When `computer-use:computer-use` and `mcp__cua_repl` are supplied, read that provider's skill and follow its documented browser entry points. If only the legacy `browser:control-in-app-browser` provider is present, use its instructions instead. A cached directory is evidence of an installed skill, not evidence that live tools are attached to this chat.\n\nUse the available provider to open routes, interact with the page, inspect browser evidence, and capture screenshots. Do not reinstall a legacy browser plugin merely because its old cache path is absent. If the session offers no supported live browser tools, report that specific capability gap.",
      to: "Inspect the current session's tools first. Use whichever live browser tools are attached: the built-in browser pane, Claude in Chrome, or a browser automation MCP server such as Playwright or Chrome DevTools. An installed skill or configuration entry is not evidence that live tools are attached to this session.\n\nUse the available tools to open routes, interact with the page, inspect browser evidence, and capture screenshots. If the session offers no live browser tools, report that specific capability gap instead of substituting code reading for browser validation.",
    },
  ],
};

function transform(relativePath, raw) {
  const usesCrlf = raw.includes("\r\n");
  let text = swapRoles(raw.replace(/\r\n/g, "\n"));
  for (const { from, to } of rewrites[relativePath] ?? []) {
    if (!text.includes(from)) {
      throw new Error(`${relativePath}: expected source sentence not found: ${from.slice(0, 80)}`);
    }
    text = text.replace(from, () => to);
  }
  return usesCrlf ? text.replace(/\n/g, "\r\n") : text;
}

function walk(directory, relative) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const next = `${relative}/${entry.name}`;
    const target = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`refusing to copy a link: ${next}`);
    if (entry.isDirectory()) {
      if (excludedDirectories.has(entry.name)) return [];
      if (relative === "skills" && excludedSkills.has(entry.name)) return [];
      return walk(target, next);
    }
    return entry.isFile() ? [{ relative: next, source: target }] : [];
  });
}

/**
 * Returns every file of the Claude Code plugin as `{ relative, content }`, with
 * POSIX relative paths. Nothing is written.
 */
export function buildClaudeEdition({ sourcePluginDir, version }) {
  if (typeof version !== "string" || !/^\d+\.\d+\.\d+$/.test(version)) throw new Error("a stable package version is required");
  const outputs = [];
  for (const top of ["skills", "templates"]) {
    for (const file of walk(path.join(sourcePluginDir, top), top)) {
      const verbatim = !file.relative.endsWith(".md") || file.relative.startsWith(verbatimPrefix);
      outputs.push({
        relative: file.relative,
        content: verbatim ? fs.readFileSync(file.source) : transform(file.relative, fs.readFileSync(file.source, "utf8")),
      });
    }
  }

  const produced = new Set(outputs.map((item) => item.relative));
  for (const key of Object.keys(rewrites)) {
    if (!produced.has(key)) throw new Error(`rewrite target is not part of the source: ${key}`);
  }

  const manifest = {
    name: "hehehe",
    version,
    description: "Claude-first development workflow: Claude plans, implements and verifies; Codex is an optional read-only reviewer. Generated from the Codex edition of hehehe.",
    author: { name: "d0nghee" },
    homepage: "https://github.com/d0nghee/harness-hehehe",
    repository: "https://github.com/d0nghee/harness-hehehe",
    license: "MIT",
  };
  outputs.push({ relative: ".claude-plugin/plugin.json", content: `${JSON.stringify(manifest, null, 2)}\n` });
  return outputs;
}

export function claudeSkillCount(outputs) {
  return new Set(outputs.filter((item) => item.relative.endsWith("/SKILL.md")).map((item) => item.relative.split("/")[1])).size;
}

export function writeOutputs(targetDir, outputs) {
  for (const item of outputs) {
    const target = path.join(targetDir, ...item.relative.split("/"));
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, item.content);
  }
}
