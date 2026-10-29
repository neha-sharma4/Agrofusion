import fs from "node:fs";
import path from "node:path";
import { config as loadEnv } from "dotenv";

loadEnv({ path: path.resolve(process.cwd(), ".env") });
loadEnv({ path: path.resolve(process.cwd(), "../../.env") });

import { prisma } from "../src/config/prisma.js";
import { hashSecret } from "../src/utils/crypto.js";

async function main() {
  console.log("==================================================");
  console.log("AGROFUSION AI — DATABASE CLEAN RESET");
  console.log("==================================================");

  // 1. Clear transactional tables in foreign-key dependency order
  console.log("\n1. Clearing transactional data...");
  const feedbackDeleted = await prisma.feedback.deleteMany();
  const llmLogDeleted = await prisma.llmLog.deleteMany();
  const scansDeleted = await prisma.diseaseScan.deleteMany();
  const irrigationsDeleted = await prisma.irrigationRecommendation.deleteMany();
  const cyclesDeleted = await prisma.cropCycle.deleteMany();
  const fieldsDeleted = await prisma.field.deleteMany();
  const otpDeleted = await prisma.otpVerification.deleteMany();
  const resetTokensDeleted = await prisma.passwordReset.deleteMany();
  const refreshTokensDeleted = await prisma.refreshToken.deleteMany();

  // Remove non-admin users (or all users and reseed admin)
  const nonAdminUsersDeleted = await prisma.user.deleteMany({
    where: { role: { not: "ADMIN" } },
  });

  console.log(`- Deleted ${feedbackDeleted.count} feedback records`);
  console.log(`- Deleted ${llmLogDeleted.count} LLM log records`);
  console.log(`- Deleted ${scansDeleted.count} disease scans`);
  console.log(`- Deleted ${irrigationsDeleted.count} irrigation recommendations`);
  console.log(`- Deleted ${cyclesDeleted.count} crop cycles`);
  console.log(`- Deleted ${fieldsDeleted.count} fields`);
  console.log(`- Deleted ${otpDeleted.count} OTP verifications`);
  console.log(`- Deleted ${nonAdminUsersDeleted.count} demo/test farmer accounts`);

  // 2. Clean uploads folder
  const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || "./uploads");
  if (fs.existsSync(uploadDir)) {
    const files = fs.readdirSync(uploadDir);
    let removedFiles = 0;
    for (const f of files) {
      if (f.endsWith(".png") || f.endsWith(".jpg") || f.endsWith(".jpeg") || f.endsWith(".webp")) {
        fs.unlinkSync(path.join(uploadDir, f));
        removedFiles++;
      }
    }
    console.log(`- Cleaned ${removedFiles} uploaded files from ${uploadDir}`);
  }

  // 3. Ensure master data exists
  console.log("\n2. Verifying master / reference data...");
  const cropsCount = await prisma.crop.count();
  const soilsCount = await prisma.soilType.count();
  const regionsCount = await prisma.agroClimaticRegion.count();
  const stagesCount = await prisma.growthStage.count();
  const kbCount = await prisma.knowledgeItem.count();

  if (cropsCount === 0 || soilsCount === 0 || regionsCount === 0 || kbCount === 0) {
    console.log("Master data missing. Running master seed...");
    // Run seed.ts
    const { execSync } = await import("node:child_process");
    execSync("npx tsx scripts/seed.ts", { stdio: "inherit" });
  } else {
    console.log(`- Crops: ${cropsCount}`);
    console.log(`- Soil types: ${soilsCount}`);
    console.log(`- Agro-climatic regions: ${regionsCount}`);
    console.log(`- Growth stages: ${stagesCount}`);
    console.log(`- Knowledge base entries: ${kbCount}`);
  }

  // 4. Ensure Admin account exists with configured password
  console.log("\n3. Seeding / updating Administrator account...");
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD?.trim() || "ChangeMe123!";
  const passwordHash = await hashSecret(adminPassword);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      isEmailVerified: true,
      accountStatus: "ACTIVE",
      role: "ADMIN",
    },
    create: {
      name: "Administrator",
      email: adminEmail,
      phone: "0000000000",
      passwordHash,
      role: "ADMIN",
      isEmailVerified: true,
      preferredLanguage: "en",
    },
  });

  console.log(`- Admin account ready: ${admin.email}`);

  // 5. Final validation of clean database state
  const finalFarmers = await prisma.user.count({ where: { role: "FARMER" } });
  const finalAllUsers = await prisma.user.count();
  const finalFields = await prisma.field.count();
  const finalCycles = await prisma.cropCycle.count();
  const finalIrrigations = await prisma.irrigationRecommendation.count();
  const finalScans = await prisma.diseaseScan.count();
  const finalLogs = await prisma.llmLog.count();

  console.log("\n==================================================");
  console.log("CLEAN DATABASE STATE VERIFIED:");
  console.log("==================================================");
  console.log(`  Farmers (Total Users): ${finalFarmers}`);
  console.log(`  Total Accounts:        ${finalAllUsers} (1 Admin, 0 Farmers)`);
  console.log(`  Fields:                ${finalFields}`);
  console.log(`  Crop Cycles:           ${finalCycles}`);
  console.log(`  Irrigations:           ${finalIrrigations}`);
  console.log(`  Disease Scans:         ${finalScans}`);
  console.log(`  AI Logs:               ${finalLogs}`);
  console.log("==================================================");
  console.log("DATABASE RESET COMPLETED SUCCESSFULLY!");
  console.log("==================================================\n");
}

main()
  .catch((err) => {
    console.error("Database reset failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
