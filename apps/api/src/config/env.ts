import path from "node:path";
import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv({ path: path.resolve(process.cwd(), ".env") });
loadEnv({ path: path.resolve(process.cwd(), "../../.env") });
loadEnv({ path: path.resolve(process.cwd(), "../.env") });

if (!process.env.GEMINI_API_KEY && process.env.LLM_API_KEY) {
  process.env.GEMINI_API_KEY = process.env.LLM_API_KEY;
}
if (!process.env.GEMINI_MODEL && process.env.LLM_MODEL) {
  process.env.GEMINI_MODEL = process.env.LLM_MODEL;
}
if (!process.env.GEMINI_API_BASE_URL && process.env.LLM_BASE_URL) {
  process.env.GEMINI_API_BASE_URL = process.env.LLM_BASE_URL;
}

// Automatically upgrade deprecated/unavailable model version to avoid 404s
if (process.env.GEMINI_MODEL === "gemini-2.0-flash") {
  process.env.GEMINI_MODEL = "gemini-2.5-flash";
}
if (process.env.LLM_MODEL === "gemini-2.0-flash") {
  process.env.LLM_MODEL = "gemini-2.5-flash";
}

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
}

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  ADMIN_EMAIL: z.preprocess((v) => (v === "" ? undefined : v), z.string().email().optional()),
  ADMIN_PASSWORD: z.string().optional(),
  GEMINI_API_KEY: z.string().optional().default(""),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
  GEMINI_API_BASE_URL: z.string().default("https://generativelanguage.googleapis.com/v1beta"),
  LLM_TEMPERATURE: z.coerce.number().default(0.25),
  DISEASE_CONFIDENCE_THRESHOLD: z.coerce.number().min(0).max(1).default(0.7),
  WEATHER_API_KEY: z.string().optional().default(""),
  WEATHER_API_BASE_URL: z.string().default("https://api.openweathermap.org/data/2.5"),
  SMTP_HOST: z.string().optional().default(""),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional().default(""),
  SMTP_PASS: z.string().optional().default(""),
  SMTP_FROM: z.string().default("AgroFusion AI <noreply@example.com>"),
  PORT: z.coerce.number().default(4000),
  FRONTEND_URL: z.string().default("http://localhost:5173"),
  NODE_ENV: z.string().default("development"),
  UPLOAD_DIR: z.string().default("./uploads"),
  MAX_UPLOAD_BYTES: z.coerce.number().default(10 * 1024 * 1024),
});

export const env = schema.parse(process.env);
export const isProd = env.NODE_ENV === "production";
