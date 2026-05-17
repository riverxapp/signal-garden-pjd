#!/usr/bin/env node

/**
 * Creates a .env.local file with sensible defaults if one doesn't exist.
 *
 * Usage:
 *   node scripts/setup-env.mjs
 */

import { existsSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env.local");

const template = `# Add environment variables here
# NEXT_PUBLIC_SITE_URL=http://localhost:3000
`;

if (existsSync(envPath)) {
  console.log(".env.local already exists — skipping.");
} else {
  writeFileSync(envPath, template, "utf-8");
  console.log("Created .env.local with defaults.");
}
