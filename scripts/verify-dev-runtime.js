import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function fail(message) {
  console.error(`[verify:dev-runtime] FAIL: ${message}`);
  process.exit(1);
}

function readText(relPath) {
  const fullPath = path.join(root, relPath);
  if (!fs.existsSync(fullPath)) {
    fail(`Missing required file: ${relPath}`);
  }
  return fs.readFileSync(fullPath, "utf8");
}

const pkg = JSON.parse(readText("package.json"));
const scripts = pkg.scripts || {};

if (!scripts.dev) fail("package.json missing scripts.dev");
if (!scripts.start) fail("package.json missing scripts.start");
if (!scripts["verify:dev-runtime"]) fail("package.json missing scripts.verify:dev-runtime");

if (!scripts.dev.includes("scripts/dev-supervisor.js")) {
  fail("scripts.dev must run scripts/dev-supervisor.js for runtime parity");
}
if (!scripts.start.includes("--hostname 0.0.0.0")) {
  fail("scripts.start must include '--hostname 0.0.0.0'");
}
if (!scripts.start.includes("--port ${PORT:-3000}")) {
  fail("scripts.start must include explicit '--port ${PORT:-3000}'");
}

const supervisor = readText("scripts/dev-supervisor.js");

if (!supervisor.includes('const PORT = resolvePort(cli.port || process.env.PORT);')) {
  fail("Supervisor must resolve PORT from CLI/env and fallback to default");
}
if (!supervisor.includes('return "3000";')) {
  fail("Supervisor must default PORT to 3000");
}
if (!supervisor.includes(': "/";')) {
  fail("Supervisor must default HEALTHCHECK_PATH to '/'");
}
if (!supervisor.includes('"--hostname", HOST')) {
  fail("Supervisor must launch Next with explicit host");
}
if (!supervisor.includes('"--port", PORT')) {
  fail("Supervisor must launch Next with explicit port");
}
if (!supervisor.includes('const NEXT_DEV = parseBoolean(process.env.NEXT_DEV, true);')) {
  fail("Supervisor must support NEXT_DEV env-driven mode");
}
if (!supervisor.includes('const GIT_POLL = parseBoolean(process.env.GIT_POLL, true);')) {
  fail("Supervisor must support GIT_POLL env override");
}
if (!supervisor.includes('const GIT_BOOTSTRAP = parseBoolean(process.env.GIT_BOOTSTRAP, false);')) {
  fail("Supervisor must support GIT_BOOTSTRAP env override");
}
if (!supervisor.includes('token === "--host" || token === "--hostname"')) {
  fail("Supervisor must support forwarded --host/--hostname args");
}
if (!supervisor.includes('token === "--port" || token === "-p"')) {
  fail("Supervisor must support forwarded --port/-p args");
}

console.log("[verify:dev-runtime] PASS: runtime invariants satisfied");
