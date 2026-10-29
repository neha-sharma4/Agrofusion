import { prisma } from "../src/config/prisma.js";

async function main() {
  const count = await prisma.growthStage.count();
  console.log("Total growth stages in DB:", count);

  const genericStages = await prisma.growthStage.findMany({
    where: { cropId: null },
    orderBy: { sortOrder: "asc" },
  });
  console.log("Generic growth stages (cropId = null):", genericStages);

  // Find a sample crop, e.g. Rice
  const rice = await prisma.crop.findFirst({ where: { name: "Rice" } });
  if (rice) {
    const riceStages = await prisma.growthStage.findMany({
      where: { cropId: rice.id },
      orderBy: { sortOrder: "asc" },
    });
    console.log(`Rice (cropId = ${rice.id}) stages:`, riceStages);
  }

  // Also simulate the query the API was doing:
  if (rice) {
    const apiResult = await prisma.growthStage.findMany({
      where: { OR: [{ cropId: rice.id }, { cropId: null }] },
      orderBy: { sortOrder: "asc" },
    });
    console.log("API query result count for Rice:", apiResult.length);
    console.log("API query result names:", apiResult.map(s => `${s.name} (cropId: ${s.cropId ? 'crop' : 'null'})`));
  }
}

main().finally(() => prisma.$disconnect());
