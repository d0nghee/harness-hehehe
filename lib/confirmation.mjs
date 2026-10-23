import path from "node:path";
import { createInterface } from "node:readline";

// A path is an operator's one-invocation approval, never a blanket --yes flag.
export async function confirmLegacyRemoval(plan, {
  approvedPath,
  input = process.stdin,
  output = process.stderr,
} = {}) {
  if (approvedPath !== undefined) {
    const normalize = (value) => process.platform === "win32" ? value.toLowerCase() : value;
    if (typeof approvedPath !== "string" || !path.isAbsolute(approvedPath)
      || normalize(path.resolve(approvedPath)) !== normalize(path.resolve(plan.target))) {
      throw new Error(`Legacy removal approval must match the exact absolute target: ${plan.target}`);
    }
    return true;
  }
  if (!input.isTTY || !output.isTTY) {
    throw new Error(`Legacy plugin removal needs user confirmation: ${plan.target}. `
      + "Use an interactive terminal, or after user approval pass --confirm-legacy-removal with that exact absolute path.");
  }
  const reader = createInterface({ input, output, terminal: false });
  try {
    const answer = await new Promise((resolve, reject) => {
      reader.once("line", resolve);
      reader.once("close", () => resolve(""));
      reader.once("error", reject);
      output.write(`Delete the entire legacy hehehe plugin folder for ${plan.operation}?\n`
        + `Target: ${plan.target}\n`
        + "All contents, including Git history and uncommitted or personal files, will be deleted.\n"
        + "Continue? [y/N] ");
    });
    return /^(y|yes)$/i.test(answer.trim());
  } finally {
    reader.close();
  }
}
