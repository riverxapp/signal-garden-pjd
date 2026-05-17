// Feature: browser error reporter, invoked via components/ErrorReporter.tsx.
// Runs only in the browser; keep imports of this script out of server-only contexts.
type ErrorPayload = {
  type: string;
  message: string;
  stack?: string;
  file?: string;
  line?: number;
  column?: number;
  url?: string;
  userAgent?: string;
  timestamp: string;
  repo: string;
};

declare global {
  interface Window {
    __errorReporterInitialized?: boolean;
  }
}

const BUBBLE_ENDPOINT =
  "https://panda.new/api/1.1/wf/error/";

const repo =
  (typeof process !== "undefined" && process.env && process.env.REPO_URL) ||
  "unknown-repo";

function makePayload(data: Partial<ErrorPayload>): ErrorPayload {
  return {
    type: data.type ?? "error",
    message: data.message ?? "Unknown error",
    stack: data.stack,
    file: data.file,
    line: data.line,
    column: data.column,
    url:
      typeof window !== "undefined" && window.location
        ? window.location.href
        : undefined,
    userAgent:
      typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    timestamp: new Date().toISOString(),
    repo,
  };
}

async function postError(payload: ErrorPayload) {
  if (typeof fetch === "undefined") return;
  console.log("[error-reporter] sending", payload.type);
  try {
    const res = await fetch(BUBBLE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const preview = await res.text();
    console.log(
      `[error-reporter] sent (${res.status}) ${preview.slice(0, 200)}`
    );
  } catch (err) {
    console.error("[error-reporter] failed to send", err);
  }
}

function handleErrorEvent(event: ErrorEvent) {
  postError(
    makePayload({
      type: "error",
      message: event.message,
      stack: event.error?.stack,
      file: event.filename,
      line: event.lineno,
      column: event.colno,
    })
  );
}

function handleRejection(event: PromiseRejectionEvent) {
  const reason = event.reason;
  const message =
    typeof reason === "string"
      ? reason
      : reason?.message || "Unhandled rejection";
  const stack = typeof reason === "object" ? reason?.stack : undefined;

  postError(
    makePayload({
      type: "unhandledrejection",
      message,
      stack,
    })
  );
}

function wrapConsoleError() {
  const original = console.error;
  console.error = function (...args) {
    const message = args.map((a) => String(a)).join(" ");
    postError(
      makePayload({
        type: "console-error",
        message,
      })
    );
    original(...args);
  };
}

export function initErrorReporter() {
  if (typeof window === "undefined") return;
  if (window.__errorReporterInitialized) return;
  window.__errorReporterInitialized = true;

  console.log("[error-reporter] initializing");

  window.addEventListener("error", handleErrorEvent);
  window.addEventListener("unhandledrejection", handleRejection);
  wrapConsoleError();
}
