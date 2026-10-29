import { prisma } from "../src/config/prisma.js";

async function main() {
  const recs = await prisma.irrigationRecommendation.findMany({
    select: { id: true, growthStageId: true },
  });
  console.log(`Found ${recs.length} irrigation recommendations:`, recs);

  // Check unique growthStageIds referenced
  const referencedIds = new Set(recs.map(r => r.growthStageId));
  console.log("Referenced growthStage IDs:", Array.from(referencedIds));

  for (const id of referencedIds) {
    const stage = await prisma.growthStage.findUnique({ where: { id } });
    console.log(`Referenced stage ${id}:`, stage);
  }
}

main().finally(() => prisma.$disconnect());
