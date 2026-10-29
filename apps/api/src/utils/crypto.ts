import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const SALT_ROUNDS = 12;

export async function hashSecret(value: string) {
  return bcrypt.hash(value, SALT_ROUNDS);
}

export async function verifySecret(value: string, hash: string) {
  return bcrypt.compare(value, hash);
}

export function randomOtp() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

export function randomToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export type AccessPayload = { sub: string; role: "FARMER" | "ADMIN"; typ: "access" };

export function signAccessToken(userId: string, role: "FARMER" | "ADMIN") {
  return jwt.sign({ sub: userId, role, typ: "access" } satisfies AccessPayload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): AccessPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessPayload;
  if (decoded.typ !== "access") throw new Error("invalid token");
  return decoded;
}
