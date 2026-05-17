import { spawn } from "node:child_process";
import path from "node:path";

const DEFAULT_TIMEOUT_MS = 60_000;
const KILL_GRACE_MS = 5_000;

const NPM_BUILT_INS = new Set([
  "access",
  "adduser",
  "audit",
  "bugs",
  "cache",
  "ci",
  "completion",
  "config",
  "dedupe",
  "deprecate",
  "diff",
  "dist-tag",
  "docs",
  "doctor",
  "edit",
  "exec",
  "explain",
  "explore",
  "find-dupes",
  "fund",
  "help",
  "help-search",
  "hook",
  "init",
  "install",
  "install-ci-test",
  "install-test",
  "link",
  "ll",
  "login",
  "logout",
  "ls",
  "org",
  "outdated",
  "owner",
  "pack",
  "ping",
  "pkg",
  "prefix",
  "profile",
  "prune",
  "publish",
  "query",
  "rebuild",
  "repo",
  "restart",
  "root",
  "run",
  "run-script",
  "sbom",
  "search",
  "set",
  "shrinkwrap",
  "star",
  "stars",
  "start",
  "stop",
  "team",
  "test",
  "token",
  "uninstall",
  "unpublish",
  "unstar",
  "update",
  "version",
  "view",
  "whoami",
]);

let isLocked = false;

function nowIso() {
  return new Date().toISOString();
}

function isNpmCommand(command) {
  const base = path.basename(command).toLowerCase();
  return base === "npm" || base === "npm.cmd";
}

function normalizeNpmRun(command, args) {
  if (!isNpmCommand(command)) {
    return { command, args };
  }

  if (args.length === 0) {
    return { command, args };
  }

  const [first] = args;
  if (first.startsWith("-") || NPM_BUILT_INS.has(first)) {
    return { command, args };
  }

  return { command, args: ["run", ...args] };
}

function parseCommandString(raw) {
  if (typeof raw !== "string") {
    throw new Error("action must be a string");
  }

  const input = raw.trim();
  if (!input) {
    throw new Error("action cannot be empty");
  }

  const tokens = [];
  let current = "";
  let quote = null;
  let escaping = false;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];

    if (escaping) {
      current += ch;
      escaping = false;
      continue;
    }

    if (ch === "\\") {
      escaping = true;
      continue;
    }

    if (quote) {
      if (ch === quote) {
        quote = null;
      } else {
        current += ch;
      }
      continue;
    }

    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }

    if (/\s/.test(ch)) {
      if (current.length > 0) {
        tokens.push(current);
        current = "";
      }
      continue;
    }

    current += ch;
  }

  if (escaping) {
    throw new Error("invalid command string: trailing escape");
  }

  if (quote) {
    throw new Error("invalid command string: unmatched quote");
  }

  if (current.length > 0) {
    tokens.push(current);
  }

  if (tokens.length === 0) {
    throw new Error("action cannot be empty");
  }

  return tokens;
}

function parsePayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("payload must be an object");
  }

  const { action } = payload;
  if (typeof action !== "string") {
    throw new Error("action must be a string");
  }

  const tokens = parseCommandString(action);
  return {
    command: tokens[0],
    args: tokens.slice(1),
  };
}

export function getRunnerState() {
  return { busy: isLocked };
}

export async function runCommand(payload, options = {}) {
  if (isLocked) {
    const error = new Error("command runner is busy");
    error.code = "BUSY";
    throw error;
  }

  const timeoutMs =
    Number.isFinite(options.timeoutMs) && options.timeoutMs > 0
      ? options.timeoutMs
      : DEFAULT_TIMEOUT_MS;

  const parsed = parsePayload(payload);
  const normalized = normalizeNpmRun(parsed.command, parsed.args);
  const command = normalized.command;
  const args = normalized.args;

  isLocked = true;

  const started = Date.now();
  const startedAt = nowIso();
  console.log(
    `[run] START ${startedAt} command=${JSON.stringify(command)} args=${JSON.stringify(
      args
    )}`
  );

  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let finished = false;
    let killTimer = null;

    let child;
    try {
      child = spawn(command, args, {
        shell: false,
        env: process.env,
        cwd: process.cwd(),
      });
    } catch (error) {
      isLocked = false;
      reject(error);
      return;
    }

    const timeoutTimer = setTimeout(() => {
      timedOut = true;
      if (!child.killed) {
        child.kill("SIGTERM");
      }

      killTimer = setTimeout(() => {
        if (!child.killed) {
          child.kill("SIGKILL");
        }
      }, KILL_GRACE_MS);
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      stdout += text;
      process.stdout.write(text);
    });

    child.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      stderr += text;
      process.stderr.write(text);
    });

    child.on("error", (error) => {
      if (finished) {
        return;
      }
      finished = true;
      clearTimeout(timeoutTimer);
      if (killTimer) {
        clearTimeout(killTimer);
      }
      isLocked = false;
      reject(error);
    });

    child.on("close", (code, signal) => {
      if (finished) {
        return;
      }
      finished = true;
      clearTimeout(timeoutTimer);
      if (killTimer) {
        clearTimeout(killTimer);
      }

      const ended = Date.now();
      const result = {
        success: code === 0 && !timedOut,
        stdout,
        stderr,
        code,
        signal,
        timedOut,
        startedAt,
        endedAt: new Date(ended).toISOString(),
        durationMs: ended - started,
      };

      console.log(
        `[run] END ${result.endedAt} durationMs=${result.durationMs} code=${String(
          code
        )} signal=${String(signal)} timedOut=${timedOut}`
      );

      isLocked = false;
      resolve(result);
    });
  });
}
