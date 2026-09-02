import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

const required = ["SENTRY_AUTH_TOKEN", "SENTRY_ORG", "SENTRY_PROJECT"];
const missing = required.filter((key) => !process.env[key]);
const release = process.env.VITE_SENTRY_RELEASE || `release-health-monitor@${process.env.npm_package_version || "1.1.1"}`;
const cli = "2.53.0";

if (missing.length) {
  console.error(`Missing required Sentry release variables: ${missing.join(", ")}`);
  process.exit(1);
}
if (!existsSync("dist")) throw new Error("dist/ does not exist. Run npm run build first.");

const run = (args) => execFileSync("npx", ["--yes", `@sentry/cli@${cli}`, ...args], { stdio: "inherit", env: process.env });
run(["releases", "files", release, "upload-sourcemaps", "dist", "--rewrite", "--validate"]);
run(["releases", "finalize", release]);
console.log(`Sentry release finalized: ${release}`);
