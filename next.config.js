/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

import "./src/env.js";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import("next").NextConfig} */
const config = {
  transpilePackages: ["@react-pdf/renderer"],
  // Keep this app as the workspace root when a parent repo lockfile exists (git worktrees).
  outputFileTracingRoot: projectRoot,
};

export default config;
