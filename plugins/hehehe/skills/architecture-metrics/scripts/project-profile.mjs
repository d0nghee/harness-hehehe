#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import {
  access,
  mkdir,
  readFile,
  readdir,
  rename,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PROFILE_ORDER = ["lite", "standard", "strict"];
const DIMENSIONS = [
  "security_data_risk",
  "domain_complexity",
  "integration_complexity",
  "operational_risk",
  "collaboration_pressure",
];
const PROFILE_THRESHOLDS = {
  lite: { pass_max: 4, improve_min: 5, improve_max: 6, fail_min: 7 },
  standard: { pass_max: 3, improve_min: 4, improve_max: 5, fail_min: 6 },
  strict: { pass_max: 2, improve_min: 3, improve_max: 4, fail_min: 5 },
};

async function exists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

function isInsideOrSame(parentPath, candidatePath) {
  const relative = path.relative(parentPath, candidatePath);
  return relative === ""
    || (relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}

function assertScore(value, label) {
  if (!Number.isInteger(value) || value < 0 || value > 2) {
    throw new Error(`${label} must be an integer from 0 to 2`);
  }
  return value;
}

function assertProfile(value, label) {
  if (!PROFILE_ORDER.includes(value)) {
    throw new Error(`${label} must be lite, standard, or strict`);
  }
  return value;
}

function profileForScore(score) {
  if (score <= 3) return "lite";
  if (score <= 6) return "standard";
  return "strict";
}

function profileRank(profile) {
  return PROFILE_ORDER.indexOf(profile);
}

function clampProfile(profile, minimum, maximum) {
  const rank = Math.max(
    profileRank(minimum),
    Math.min(profileRank(profile), profileRank(maximum)),
  );
  return PROFILE_ORDER[rank];
}

async function readJsonIfExists(filePath, label) {
  if (!(await exists(filePath))) return null;
  let value;
  try {
    value = JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    throw new Error(`${label} is invalid JSON: ${filePath}`, { cause: error });
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be a JSON object: ${filePath}`);
  }
  return value;
}

async function immediateDirectories(directoryPath) {
  if (!(await exists(directoryPath))) return [];
  return (await readdir(directoryPath, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort();
}

async function firstDomainRoot(projectDir) {
  const candidates = [
    "src/features",
    "features",
    "src/domains",
    "domains",
    "src/modules",
    "modules",
    "app/features",
  ];
  for (const relativePath of candidates) {
    const directoryPath = path.join(projectDir, relativePath);
    const directories = await immediateDirectories(directoryPath);
    if (directories.length > 0) {
      return { relativePath: relativePath.replaceAll("\\", "/"), directories };
    }
  }
  return { relativePath: null, directories: [] };
}

async function manifestSignals(projectDir) {
  const manifestNames = [
    "package.json",
    "pyproject.toml",
    "requirements.txt",
    "go.mod",
    "Cargo.toml",
  ];
  const signals = [];
  let packageJson = null;
  for (const name of manifestNames) {
    const filePath = path.join(projectDir, name);
    if (!(await exists(filePath))) continue;
    const content = await readFile(filePath, "utf8");
    signals.push({ name, content: content.toLowerCase() });
    if (name === "package.json") {
      try {
        packageJson = JSON.parse(content);
      } catch (error) {
        throw new Error(`package.json is invalid JSON: ${filePath}`, { cause: error });
      }
    }
  }
  return { signals, packageJson };
}

function matchingTokens(signals, patterns) {
  const hits = new Set();
  for (const { name, content } of signals) {
    for (const [label, pattern] of patterns) {
      if (pattern.test(content)) hits.add(`${label} (${name})`);
    }
  }
  return [...hits].sort();
}

async function pathHits(projectDir, relativePaths) {
  const hits = [];
  for (const relativePath of relativePaths) {
    if (await exists(path.join(projectDir, relativePath))) {
      hits.push(relativePath.replaceAll("\\", "/"));
    }
  }
  return hits;
}

async function scoreSecurityDataRisk(projectDir, signals) {
  const highManifestHits = matchingTokens(signals, [
    ["payments", /(?:stripe|paypal|adyen|braintree|squareup|payment|billing)/],
    ["regulated-data", /(?:hipaa|healthcare|medical|banking|financial)/],
  ]);
  const highPathHits = await pathHits(projectDir, [
    "src/features/payment",
    "src/features/payments",
    "features/payment",
    "features/payments",
    "src/billing",
    "billing",
  ]);
  if (highManifestHits.length > 0 || highPathHits.length > 0) {
    return {
      score: 2,
      evidence: [
        ...highManifestHits,
        ...highPathHits.map((item) => `sensitive path: ${item}`),
      ],
    };
  }

  const authManifestHits = matchingTokens(signals, [
    ["authentication", /(?:next-auth|better-auth|passport|clerk|auth0|keycloak|oauth|openid|jsonwebtoken|bcrypt)/],
  ]);
  const authPathHits = await pathHits(projectDir, [
    "src/features/auth",
    "features/auth",
    "src/auth",
    "auth",
    "src/identity",
    "identity",
  ]);
  if (authManifestHits.length > 0 || authPathHits.length > 0) {
    return {
      score: 1,
      evidence: [
        ...authManifestHits,
        ...authPathHits.map((item) => `authentication path: ${item}`),
      ],
    };
  }
  return { score: 0, evidence: ["no authentication, payment, or regulated-data signal detected"] };
}

async function scoreDomainComplexity(projectDir) {
  const root = await firstDomainRoot(projectDir);
  const count = root.directories.length;
  const score = count >= 6 ? 2 : count >= 3 ? 1 : 0;
  return {
    score,
    evidence: root.relativePath
      ? [`${count} domain directories under ${root.relativePath}: ${root.directories.join(", ")}`]
      : ["no conventional feature/domain/module root detected"],
  };
}

function integrationProviders(signals) {
  const providers = matchingTokens(signals, [
    ["AWS", /(?:@aws-sdk|aws-sdk|boto3)/],
    ["Azure", /(?:@azure\/|azure-sdk)/],
    ["Google Cloud", /(?:@google-cloud\/|google-cloud|googleapis)/],
    ["Stripe", /(?:stripe)/],
    ["PayPal", /(?:paypal)/],
    ["Twilio", /(?:twilio)/],
    ["SendGrid", /(?:sendgrid)/],
    ["Firebase", /(?:firebase)/],
    ["Supabase", /(?:supabase)/],
    ["OpenAI", /(?:\bopenai\b|@openai\/)/],
    ["Anthropic", /(?:anthropic)/],
  ]);
  return providers.map((item) => item.replace(/\s+\([^)]+\)$/, ""));
}

async function deployableCount(projectDir, packageJson) {
  const roots = ["apps", "services", "cmd"];
  const names = new Set();
  for (const root of roots) {
    for (const name of await immediateDirectories(path.join(projectDir, root))) {
      names.add(`${root}/${name}`);
    }
  }
  if (names.size > 0) return { count: names.size, names: [...names].sort() };
  if (packageJson || await exists(path.join(projectDir, "go.mod")) || await exists(path.join(projectDir, "pyproject.toml"))) {
    return { count: 1, names: ["project root"] };
  }
  return { count: 0, names: [] };
}

async function scoreIntegrationComplexity(projectDir, signals, packageJson) {
  const providers = [...new Set(integrationProviders(signals))];
  const deployables = await deployableCount(projectDir, packageJson);
  const collaborators = providers.length + Math.max(0, deployables.count - 1);
  const score = collaborators >= 4 ? 2 : collaborators >= 2 ? 1 : 0;
  return {
    score,
    evidence: [
      `${providers.length} external provider signals${providers.length ? `: ${providers.join(", ")}` : ""}`,
      `${deployables.count} deployable roots${deployables.names.length ? `: ${deployables.names.join(", ")}` : ""}`,
    ],
    details: { provider_count: providers.length, deployable_count: deployables.count },
  };
}

async function workflowDeploymentSignals(projectDir) {
  const workflowDir = path.join(projectDir, ".github", "workflows");
  const hits = [];
  if (await exists(workflowDir)) {
    for (const entry of await readdir(workflowDir, { withFileTypes: true })) {
      if (entry.isFile() && /(?:deploy|publish|release|production)/i.test(entry.name)) {
        hits.push(`.github/workflows/${entry.name}`);
      }
    }
  }
  return hits;
}

async function scoreOperationalRisk(projectDir, integrationDetails) {
  const migrationHits = await pathHits(projectDir, [
    "migrations",
    "db/migrations",
    "src/db/migrations",
    "prisma/migrations",
    "drizzle",
  ]);
  const infrastructureHits = [
    ...await pathHits(projectDir, [
      "Dockerfile",
      "docker-compose.yml",
      "docker-compose.yaml",
      "k8s",
      "kubernetes",
      "terraform",
      "infra",
    ]),
    ...await workflowDeploymentSignals(projectDir),
  ];
  let score = 0;
  if (migrationHits.length > 0 || infrastructureHits.length > 0) score = 1;
  if (
    migrationHits.length > 0
    && (infrastructureHits.length > 0 || integrationDetails.deployable_count >= 2)
  ) {
    score = 2;
  }
  return {
    score,
    evidence: [
      migrationHits.length
        ? `migration signals: ${migrationHits.join(", ")}`
        : "no migration directory detected",
      infrastructureHits.length
        ? `deployment/infrastructure signals: ${infrastructureHits.join(", ")}`
        : "no deployment or infrastructure signal detected",
    ],
  };
}

function gitContributorCount(projectDir) {
  const result = spawnSync(
    "git",
    ["-C", projectDir, "log", "--since=180 days ago", "--format=%ae"],
    { encoding: "utf8", windowsHide: true },
  );
  if (result.status !== 0) return null;
  const authors = new Set(
    result.stdout
      .split(/\r?\n/)
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  );
  return authors.size;
}

function scoreCollaborationPressure(projectDir) {
  const contributors = gitContributorCount(projectDir);
  if (contributors === null) {
    return { score: 0, evidence: ["git contributor history unavailable; defaulted to solo"] };
  }
  const score = contributors >= 4 ? 2 : contributors >= 2 ? 1 : 0;
  return {
    score,
    evidence: [`${contributors} distinct git contributor emails in the last 180 days`],
  };
}

function validatePolicy(policy, policyPath) {
  if (!policy) {
    return {
      schema_version: 1,
      profile: {
        mode: "auto",
        fixed: null,
        minimum: "lite",
        maximum: "strict",
        allow_automatic_downgrade: false,
      },
      declared_scores: {},
    };
  }
  if (policy.schema_version !== 1) {
    throw new Error(`architecture policy must declare schema_version=1: ${policyPath}`);
  }
  const profile = policy.profile ?? {};
  if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
    throw new Error(`profile must be an object: ${policyPath}`);
  }
  const mode = profile.mode ?? "auto";
  if (!["auto", "fixed"].includes(mode)) {
    throw new Error(`architecture policy profile.mode must be auto or fixed: ${policyPath}`);
  }
  const fixed = profile.fixed ?? null;
  if (fixed !== null) assertProfile(fixed, "profile.fixed");
  if (mode === "fixed" && fixed === null) {
    throw new Error(`profile.fixed is required when profile.mode is fixed: ${policyPath}`);
  }
  const minimum = assertProfile(profile.minimum ?? "lite", "profile.minimum");
  const maximum = assertProfile(profile.maximum ?? "strict", "profile.maximum");
  if (profileRank(minimum) > profileRank(maximum)) {
    throw new Error(`profile.minimum cannot exceed profile.maximum: ${policyPath}`);
  }
  if (
    profile.allow_automatic_downgrade !== undefined
    && typeof profile.allow_automatic_downgrade !== "boolean"
  ) {
    throw new Error(`profile.allow_automatic_downgrade must be boolean: ${policyPath}`);
  }
  const declaredScores = policy.declared_scores ?? {};
  if (!declaredScores || typeof declaredScores !== "object" || Array.isArray(declaredScores)) {
    throw new Error(`declared_scores must be an object: ${policyPath}`);
  }
  for (const [name, value] of Object.entries(declaredScores)) {
    if (!DIMENSIONS.includes(name)) {
      throw new Error(`unknown declared score "${name}" in ${policyPath}`);
    }
    assertScore(value, `declared_scores.${name}`);
  }
  return {
    schema_version: 1,
    profile: {
      mode,
      fixed,
      minimum,
      maximum,
      allow_automatic_downgrade: profile.allow_automatic_downgrade === true,
    },
    declared_scores: declaredScores,
  };
}

function applyDeclaredScores(detected, declaredScores) {
  const dimensions = {};
  for (const name of DIMENSIONS) {
    if (Object.hasOwn(declaredScores, name)) {
      dimensions[name] = {
        score: assertScore(declaredScores[name], `declared_scores.${name}`),
        source: "declared",
        evidence: [`project policy explicitly declared ${declaredScores[name]}/2`],
      };
    } else {
      dimensions[name] = { ...detected[name], source: "detected" };
    }
  }
  return dimensions;
}

async function writeJsonAtomic(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temporaryPath, filePath);
}

export async function scoreProject({
  projectDir = process.cwd(),
  configPath,
  write = false,
  allowDowngrade = false,
} = {}) {
  const project = path.resolve(projectDir);
  if (!(await exists(project))) throw new Error(`project directory does not exist: ${project}`);
  if (!(await stat(project)).isDirectory()) {
    throw new Error(`project path is not a directory: ${project}`);
  }

  const resolvedConfig = path.resolve(
    configPath ?? path.join(project, ".hehehe", "architecture-policy.json"),
  );
  if (!isInsideOrSame(project, resolvedConfig)) {
    throw new Error(`architecture policy must stay inside the project: ${resolvedConfig}`);
  }
  const reportPath = path.join(project, ".hehehe", "architecture-profile.json");
  const rawPolicy = await readJsonIfExists(resolvedConfig, "architecture policy");
  const policy = validatePolicy(rawPolicy, resolvedConfig);
  const { signals, packageJson } = await manifestSignals(project);
  const integration = await scoreIntegrationComplexity(project, signals, packageJson);
  const detected = {
    security_data_risk: await scoreSecurityDataRisk(project, signals),
    domain_complexity: await scoreDomainComplexity(project),
    integration_complexity: integration,
    operational_risk: await scoreOperationalRisk(project, integration.details),
    collaboration_pressure: scoreCollaborationPressure(project),
  };
  const dimensions = applyDeclaredScores(detected, policy.declared_scores);
  const score = Object.values(dimensions).reduce((sum, item) => sum + item.score, 0);
  const calculatedProfile = clampProfile(
    profileForScore(score),
    policy.profile.minimum,
    policy.profile.maximum,
  );

  let selectedProfile = policy.profile.mode === "fixed"
    ? policy.profile.fixed
    : calculatedProfile;
  let selectionReason = policy.profile.mode === "fixed"
    ? "fixed by project policy"
    : `automatic score ${score}/10`;

  const previous = await readJsonIfExists(reportPath, "previous architecture profile");
  const automaticDowngradeAllowed = allowDowngrade || policy.profile.allow_automatic_downgrade;
  if (
    policy.profile.mode === "auto"
    && !automaticDowngradeAllowed
    && previous?.selected_profile
    && PROFILE_ORDER.includes(previous.selected_profile)
    && profileRank(previous.selected_profile) > profileRank(selectedProfile)
  ) {
    selectedProfile = previous.selected_profile;
    selectionReason = `retained previous ${selectedProfile} profile; automatic downgrade is disabled`;
  }

  const report = {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    project,
    policy_path: path.relative(project, resolvedConfig).replaceAll("\\", "/"),
    policy_mode: policy.profile.mode,
    score,
    calculated_profile: calculatedProfile,
    selected_profile: selectedProfile,
    selection_reason: selectionReason,
    automatic_downgrade_allowed: automaticDowngradeAllowed,
    dimensions,
    coupling_thresholds: PROFILE_THRESHOLDS[selectedProfile],
    structural_hard_failures_profile_independent: true,
  };

  if (write) await writeJsonAtomic(reportPath, report);
  return { report, reportPath, wrote: write };
}

export function formatProfileReport(report) {
  const labels = {
    security_data_risk: "Security/data risk",
    domain_complexity: "Domain complexity",
    integration_complexity: "Integration complexity",
    operational_risk: "Operational risk",
    collaboration_pressure: "Collaboration pressure",
  };
  const lines = [
    `Project profile score: ${report.score}/10`,
    `Calculated profile: ${report.calculated_profile}`,
    `Selected profile: ${report.selected_profile}`,
    `Selection: ${report.selection_reason}`,
    "",
  ];
  for (const name of DIMENSIONS) {
    const dimension = report.dimensions[name];
    lines.push(`${labels[name]}: ${dimension.score}/2 (${dimension.source})`);
    for (const evidence of dimension.evidence) lines.push(`  - ${evidence}`);
  }
  const thresholds = report.coupling_thresholds;
  lines.push(
    "",
    `Coupling thresholds: pass 0-${thresholds.pass_max}; improve ${thresholds.improve_min}-${thresholds.improve_max}; fail ${thresholds.fail_min}-10`,
    "Structural hard failures: blocking in every profile",
  );
  return `${lines.join("\n")}\n`;
}

export function parseProfileArguments(argv) {
  const options = {
    projectDir: process.cwd(),
    json: false,
    write: false,
    allowDowngrade: false,
  };
  let projectWasSet = false;
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--json") {
      options.json = true;
    } else if (argument === "--write") {
      options.write = true;
    } else if (argument === "--allow-downgrade") {
      options.allowDowngrade = true;
    } else if (argument === "--project" || argument === "--config") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) throw new Error(`${argument} requires a value`);
      if (argument === "--project") {
        options.projectDir = value;
        projectWasSet = true;
      }
      else options.configPath = value;
      index += 1;
    } else if (argument.startsWith("--project=")) {
      const value = argument.slice("--project=".length);
      if (!value) throw new Error("--project requires a value");
      options.projectDir = value;
      projectWasSet = true;
    } else if (argument.startsWith("--config=")) {
      const value = argument.slice("--config=".length);
      if (!value) throw new Error("--config requires a value");
      options.configPath = value;
    } else if (!argument.startsWith("-") && !projectWasSet) {
      options.projectDir = argument;
      projectWasSet = true;
    } else {
      throw new Error(`unknown profile argument: ${argument}`);
    }
  }
  return options;
}

export async function runProfileCli(argv) {
  const options = parseProfileArguments(argv);
  const result = await scoreProject(options);
  process.stdout.write(
    options.json
      ? `${JSON.stringify(result.report, null, 2)}\n`
      : formatProfileReport(result.report),
  );
  if (result.wrote && !options.json) {
    process.stdout.write(`Profile report: ${result.reportPath}\n`);
  }
  return result;
}

const isMain = process.argv[1]
  && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  runProfileCli(process.argv.slice(2)).catch((error) => {
    process.stderr.write(`project-profile: ${error.message}\n`);
    process.exitCode = 2;
  });
}
