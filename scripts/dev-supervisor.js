import { spawn, exec } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BRANCH = process.env.PREVIEW_BRANCH || "main";
const REPO_URL = process.env.REPO_URL;
const scriptDir = path.dirname(fileURLToPath(import.meta.url));

function resolvePort(value) {
  const raw = String(value ?? "").trim();
  const normalized = raw.replace(/^['\"]|['\"]$/g, "");
  const port = Number.parseInt(normalized, 10);
  if (!Number.isFinite(port) || port <= 0) return "3000";
  return String(port);
}

function parseBoolean(value, defaultValue) {
  if (value === undefined) return defaultValue;
  return !["false", "0", "no", "off"].includes(String(value).toLowerCase());
}

function parseCliArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if ((token === "--host" || token === "--hostname") && argv[i + 1]) {
      parsed.host = argv[++i];
      continue;
    }
    if ((token === "--port" || token === "-p") && argv[i + 1]) {
      parsed.port = argv[++i];
      continue;
    }
  }
  return parsed;
}

const cli = parseCliArgs(process.argv.slice(2));
const HOST = cli.host || process.env.HOST || "0.0.0.0";
const PORT = resolvePort(cli.port || process.env.PORT);
const NEXT_DEV = parseBoolean(process.env.NEXT_DEV, true);
const GIT_BOOTSTRAP = parseBoolean(process.env.GIT_BOOTSTRAP, false);
const GIT_POLL = parseBoolean(process.env.GIT_POLL, true);
const GIT_POLL_DELAY_MS = 30_000;
const HEALTHCHECK_PATH =
  typeof process.env.HEALTHCHECK_PATH === "string" && process.env.HEALTHCHECK_PATH.trim()
    ? process.env.HEALTHCHECK_PATH.trim()
    : "/";

function run(name, cmd, args, envOverrides = {}) {
  const p = spawn(cmd, args, {
    stdio: "inherit",
    shell: false,
    env: { ...process.env, ...envOverrides },
  });

  p.on("exit", (code) => {
    console.error(`[supervisor] ${name} exited with code ${code}`);
    process.exit(code ?? 1);
  });

  return p;
}

function getNextCommand() {
  const binName = process.platform === "win32" ? "next.cmd" : "next";
  const candidates = [
    path.join(scriptDir, "..", "node_modules", ".bin", binName),
    path.join(process.cwd(), "node_modules", ".bin", binName),
  ];

  const found = candidates.find((candidate) => fs.existsSync(candidate));
  if (found) return { cmd: found, args: [] };

  console.warn(
    `[supervisor] ${binName} not found in node_modules/.bin; using 'pnpm exec next' fallback.`
  );
  return { cmd: "pnpm", args: ["exec", "next"] };
}

function execAsync(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd: process.cwd() }, (err, stdout, stderr) => {
      if (err) {
        const details = (stderr || err.message || "unknown error").trim();
        reject(new Error(`command failed: ${cmd}\n${details}`));
        return;
      }
      resolve(stdout.trim());
    });
  });
}

async function bootstrapGit() {
  if (!GIT_BOOTSTRAP) {
    console.log("[supervisor] git bootstrap disabled (GIT_BOOTSTRAP=false)");
    return;
  }

  if (fs.existsSync(".git")) {
    console.log("[supervisor] git bootstrap skipped (.git already exists)");
    return;
  }

  if (!REPO_URL) {
    console.warn("[supervisor] git bootstrap skipped (REPO_URL not set)");
    return;
  }

  console.log(`[supervisor] bootstrapping git repo from ${REPO_URL} (${BRANCH})`);

  const cmds = [
    "git init",
    `git remote add origin ${REPO_URL}`,
    "git fetch origin --depth=1",
    `git reset --hard origin/${BRANCH}`,
  ];

  for (const cmd of cmds) {
    await execAsync(cmd);
  }

  console.log("[supervisor] git bootstrap complete");
}

async function warmup() {
  const normalizedPath = HEALTHCHECK_PATH.startsWith("/")
    ? HEALTHCHECK_PATH
    : `/${HEALTHCHECK_PATH}`;
  const url = `http://localhost:${PORT}${normalizedPath}`;

  for (let i = 0; i < 90; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        console.log(
          `[supervisor] warmup complete at ${url} (${(((i + 1) * 500) / 1000).toFixed(1)}s)`
        );
        return;
      }
    } catch {
      // server not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.warn(`[supervisor] warmup timed out after 45s (${url})`);
}

function startNext() {
  const nextCommand = getNextCommand();

  if (NEXT_DEV) {
    console.log(`[supervisor] starting Next dev server on ${HOST}:${PORT}`);
    run(
      "next-dev",
      nextCommand.cmd,
      [...nextCommand.args, "dev", "--hostname", HOST, "--port", PORT],
      {
        NODE_ENV: "development",
      }
    );
    return;
  }

  console.log(`[supervisor] starting Next production server on ${HOST}:${PORT}`);
  run(
    "next-start",
    nextCommand.cmd,
    [...nextCommand.args, "start", "--hostname", HOST, "--port", PORT],
    {
      NODE_ENV: "production",
    }
  );
}

function startGitPoller() {
  if (!GIT_POLL) {
    console.log("[supervisor] git poller disabled (GIT_POLL=false)");
    return;
  }

  setTimeout(() => {
    console.log(
      `[supervisor] starting git poller after ${GIT_POLL_DELAY_MS / 1000}s (interval=${process.env.GIT_POLL_INTERVAL || "2000"}ms)`
    );
    run("git-poll", "node", ["scripts/git-poll.js"]);
  }, GIT_POLL_DELAY_MS);
}

startNext();

warmup().catch((err) => {
  console.warn(`[supervisor] warmup error (non-fatal): ${err instanceof Error ? err.message : String(err)}`);
});

bootstrapGit().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  console.warn(`[supervisor] git bootstrap failed (non-fatal): ${message}`);
});

startGitPoller();
