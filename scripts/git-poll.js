import { exec } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const BRANCH = process.env.PREVIEW_BRANCH || "main";
const INTERVAL = Number(process.env.GIT_POLL_INTERVAL || 2000);
const REPO_URL = process.env.REPO_URL;

let lastSha = null;
let pulling = false;
let authFailed = false;
let timer;

function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd: process.cwd() }, (err, stdout, stderr) => {
      if (err) {
        return reject(new Error((stderr || err.message || "unknown error").trim()));
      }
      resolve(stdout.trim());
    });
  });
}

async function poll() {
  if (!existsSync(join(process.cwd(), ".git"))) {
    console.log("[git-poll] no .git directory present; stopping poller");
    clearInterval(timer);
    return;
  }

  if (authFailed || pulling) return;

  try {
    pulling = true;

    if (REPO_URL) {
      try {
        await run(`git remote set-url origin ${REPO_URL}`);
      } catch {
        // fetch below will surface any actionable issues
      }
    }

    await run("git fetch origin");
    const sha = await run(`git rev-parse origin/${BRANCH}`);

    if (sha !== lastSha) {
      if (lastSha) {
        console.log(`[git-poll] update detected for ${BRANCH}: ${lastSha} -> ${sha}`);
      } else {
        console.log(`[git-poll] initialized tracking SHA for ${BRANCH}: ${sha}`);
      }
      await run(`git pull origin ${BRANCH}`);
      lastSha = sha;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[git-poll] error: ${message}`);

    if (
      message.includes("could not read Username") ||
      message.includes("Authentication failed") ||
      message.includes("Permission denied")
    ) {
      authFailed = true;
      console.error("[git-poll] authentication failed; disabling polling.");
    }
  } finally {
    pulling = false;
  }
}

if (!Number.isFinite(INTERVAL) || INTERVAL <= 0) {
  console.error(`[git-poll] invalid GIT_POLL_INTERVAL=${process.env.GIT_POLL_INTERVAL}; expected positive milliseconds`);
  process.exit(1);
}

console.log(`[git-poll] started (branch=${BRANCH}, interval=${INTERVAL}ms)`);
poll().catch(() => {
  // first poll errors are handled by poll()
});
timer = setInterval(() => {
  poll().catch(() => {
    // recurring errors are handled by poll()
  });
}, INTERVAL);
