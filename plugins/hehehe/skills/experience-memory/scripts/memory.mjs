#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { recordExperience, syncExperiences, recallExperiences, memoryContext, memoryStatus } from "./experience.mjs";
import { MemoryError, readJson } from "./source-evidence.mjs";

export { recordExperience, syncExperiences, recallExperiences, memoryContext, memoryStatus };

export function main(argv = process.argv.slice(2)) {
  const options = { project: process.cwd(), json: false };
  const allowed = { record: ["project", "input", "json"], sync: ["project", "json"], recall: ["project", "query", "limit", "json"],
    context: ["project", "query", "json"], status: ["project", "json"] };
  try {
    if (!Array.isArray(argv) || !Array.from(argv).every((argument) => typeof argument === "string")) throw new MemoryError("MEMORY_INVALID_INPUT");
    const command = argv[0];
    if (!Object.hasOwn(allowed, command)) throw new MemoryError("MEMORY_INVALID_INPUT");
    for (let index = 1; index < argv.length; index += 1) {
      if (argv[index] === "--json") { options.json = true; continue; }
      const name = argv[index].startsWith("--") ? argv[index].slice(2) : "";
      if (!allowed[command].includes(name) || name === "json" || options[name] !== undefined && name !== "project"
        || !argv[index + 1] || argv[index + 1].startsWith("--")) throw new MemoryError("MEMORY_INVALID_INPUT");
      options[name] = argv[++index];
    }
    if (Object.keys(options).some((key) => !allowed[command].includes(key))) throw new MemoryError("MEMORY_INVALID_INPUT");
    const project = path.resolve(options.project);
    let result;
    if (command === "record") {
      if (!options.input) throw new MemoryError("MEMORY_INVALID_INPUT");
      const input = path.resolve(options.input);
      result = recordExperience(project, readJson(path.dirname(input), path.basename(input)));
    } else if (command === "sync") result = syncExperiences(project);
    else if (command === "recall") {
      const limit = options.limit === undefined ? 3 : /^\d+$/.test(options.limit) ? Number(options.limit) : NaN;
      result = recallExperiences(project, options.query, { limit });
    } else if (command === "context") result = memoryContext(project, options.query);
    else result = memoryStatus(project);
    process.stdout.write(`${JSON.stringify(result, null, options.json ? 2 : 0)}\n`);
    return result.status === "unavailable" ? 1 : 0;
  } catch (error) {
    const code = /^MEMORY_[A-Z_]+$/.test(error?.code ?? "") ? error.code : "MEMORY_INVALID_SOURCE";
    process.stderr.write(`${JSON.stringify({ status: "error", authority: "advisory-only", code, message: "Experience memory operation failed; no approval or verification state was changed." })}\n`);
    return 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main();
