import { prisma } from "../src/config/prisma.js";

async function checkScans() {
  const scans = await prisma.diseaseScan.findMany({
    include: {
      cropCycle: {
        include: {
          crop: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  console.log(`Total disease scans in DB: ${scans.length}`);
  for (const s of scans) {
    console.log({
      id: s.id,
      imageKey: s.imageKey,
      crop: s.cropCycle?.crop?.name,
      status: s.status,
      isHealthy: s.isHealthy,
      diseaseCommonName: s.diseaseCommonName,
      confidence: s.confidence,
      treatmentAvailable: s.treatmentJson != null,
      message: s.message?.slice(0, 100),
    });
  }
}

checkScans().catch(console.error).finally(() => prisma.$disconnect());
