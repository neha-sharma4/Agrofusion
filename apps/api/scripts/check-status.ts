import { prisma } from "../src/config/prisma.js";

async function check() {
  console.log("Checking DB records...");
  const userCount = await prisma.user.count();
  const cropCount = await prisma.crop.count();
  const soilCount = await prisma.soilType.count();
  const regionCount = await prisma.agroClimaticRegion.count();
  const stageCount = await prisma.growthStage.count();
  const kbCount = await prisma.knowledgeItem.count();
  const fieldCount = await prisma.field.count();
  const cycleCount = await prisma.cropCycle.count();
  const scanCount = await prisma.diseaseScan.count();
  const irrCount = await prisma.irrigationRecommendation.count();

  console.log({
    userCount,
    cropCount,
    soilCount,
    regionCount,
    stageCount,
    kbCount,
    fieldCount,
    cycleCount,
    scanCount,
    irrCount,
  });

  const crops = await prisma.crop.findMany({ select: { name: true } });
  console.log("Crops:", crops.map((c) => c.name));

  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  console.log("Admin user:", admin ? { email: admin.email, name: admin.name } : "NONE");
}

check().catch(console.error).finally(() => prisma.$disconnect());
