import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";

export async function logLlm(opts: {
  endpoint: string;
  userId?: string;
  input: unknown;
  output?: unknown;
  confidence?: number | null;
  latencyMs: number;
  validationStatus: string;
  flagged?: boolean;
  errorMessage?: string;
}) {
  const threshold = env.DISEASE_CONFIDENCE_THRESHOLD;
  const lowConfidence = typeof opts.confidence === "number" && opts.confidence < threshold;
  const flagged = Boolean(opts.flagged || lowConfidence || opts.validationStatus !== "PASSED");
  await prisma.llmLog.create({
    data: {
      endpoint: opts.endpoint,
      userId: opts.userId,
      inputPayload: redact(opts.input) as object,
      outputPayload: (opts.output ? redact(opts.output) : undefined) as object | undefined,
      confidence: opts.confidence ?? undefined,
      latencyMs: opts.latencyMs,
      validationStatus: opts.validationStatus,
      flaggedForReview: flagged,
      errorMessage: opts.errorMessage,
    },
  });
}

function redact(value: unknown): unknown {
  if (typeof value !== "object" || value === null) return value;
  const clone = JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
  for (const key of Object.keys(clone)) {
    const lower = key.toLowerCase();
    if (lower.includes("password") || lower.includes("otp") || lower.includes("token") || lower.includes("api_key")) {
      clone[key] = "[redacted]";
    }
    if (lower.includes("image") && typeof clone[key] === "string" && String(clone[key]).length > 200) {
      clone[key] = `[image omitted ${String(clone[key]).length} chars]`;
    }
  }
  return clone;
}
