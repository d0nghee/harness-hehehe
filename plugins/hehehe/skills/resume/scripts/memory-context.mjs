import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const skillsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const unavailable = (errorCode = "MEMORY_UNAVAILABLE") => ({
  status: "unavailable", authority: "advisory-only", error_code: errorCode,
  message: "Experience memory is unavailable; required verification and approval remain unchanged.",
  records: [],
});

async function memoryService() {
  for (const name of ["experience-memory", "hehehe-experience-memory"]) {
    const entry = path.join(skillsRoot, name, "scripts", "memory.mjs");
    if (fs.existsSync(entry)) return import(pathToFileURL(entry).href);
  }
  return null;
}

// Composition only: memory never receives or contributes verification/approval state.
export async function recallRunMemory(project, goal, synchronize) {
  try {
    const service = await memoryService();
    if (!service) return unavailable("MEMORY_SKILL_UNAVAILABLE");
    return service.memoryContext(project, goal, { sync: synchronize });
  } catch {
    return unavailable();
  }
}

export async function captureRunMemory(project) {
  try {
    const service = await memoryService();
    if (!service) return unavailable("MEMORY_SKILL_UNAVAILABLE");
    return service.syncExperiences(project);
  } catch {
    return unavailable();
  }
}
