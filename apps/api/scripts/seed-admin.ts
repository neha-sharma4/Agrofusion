import crypto from "node:crypto";
import path from "node:path";
import { config as loadEnv } from "dotenv";
loadEnv({ path: path.resolve(process.cwd(), ".env") });
loadEnv({ path: path.resolve(process.cwd(), "../../.env") });
import { prisma } from "../src/config/prisma.js";
import { hashSecret } from "../src/utils/crypto.js";

function randomPassword() {
  return crypto.randomBytes(18).toString("base64url");
}

function printCredentials(email: string, password: string) {
  console.log(`
========================================
AGROFUSION AI ADMIN CREDENTIALS
========================================
Username: ${email}
Password: ${password}
========================================
SAVE THESE CREDENTIALS SECURELY.
========================================
`);
}

async function main() {
  const reset = process.argv.includes("--reset");
  const email = (process.env.ADMIN_EMAIL || "admin@agrofusion.local").toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.role === "ADMIN" && !reset) {
    console.info("Admin already exists. Existing credentials were not changed.");
    return;
  }
  if (existing && existing.role !== "ADMIN") {
    throw new Error("A non-admin user already uses this email. Set a different ADMIN_EMAIL.");
  }

  const password = process.env.ADMIN_PASSWORD?.trim() || randomPassword();
  const passwordHash = await hashSecret(password);

  if (existing && reset) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { passwordHash, isEmailVerified: true, accountStatus: "ACTIVE" },
    });
    console.info("Admin password was reset.");
    printCredentials(email, password);
    return;
  }

  await prisma.user.create({
    data: {
      name: "Administrator",
      email,
      phone: "0000000000",
      passwordHash,
      role: "ADMIN",
      isEmailVerified: true,
      preferredLanguage: "en",
    },
  });
  printCredentials(email, password);
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
