import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { env } from "../config/env.js";

export async function saveUpload(buffer: Buffer, originalName: string) {
  await fs.mkdir(env.UPLOAD_DIR, { recursive: true });
  const ext = path.extname(originalName).slice(0, 8) || ".jpg";
  const key = `${crypto.randomUUID()}${ext}`;
  await fs.writeFile(path.join(env.UPLOAD_DIR, key), buffer);
  return key;
}

export function resolveUpload(key: string) {
  const base = path.resolve(env.UPLOAD_DIR);
  const full = path.resolve(path.join(env.UPLOAD_DIR, key));
  if (!full.startsWith(base)) throw new Error("invalid path");
  return full;
}

export async function readUpload(key: string) {
  return fs.readFile(resolveUpload(key));
}
