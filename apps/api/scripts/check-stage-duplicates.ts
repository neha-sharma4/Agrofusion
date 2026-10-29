import { prisma } from "../src/config/prisma.js";

async function main() {
  const crops = await prisma.crop.findMany({ select: { id: true, name: true } });
  for (const c of crops) {
    const stages = await prisma.growthStage.findMany({
      where: { cropId: c.id },
      select: { id: true, name: true, sortOrder: true },
    });
    if (stages.length !== 5) {
      console.log(`Crop ${c.name} has ${stages.length} stages!`);
    }
    const names = stages.map(s => s.name);
    const uniqueNames = new Set(names);
    if (names.length !== uniqueNames.size) {
      console.log(`Crop ${c.name} has DUPLICATE stage names within its own stages!`, names);
    }
  }

  const generic = await prisma.growthStage.findMany({ where: { cropId: null } });
  console.log("Generic stages count:", generic.length);
  const genericNames = generic.map(s => s.name);
  if (genericNames.length !== new Set(genericNames).size) {
    console.log("Generic stages has duplicates!", genericNames);
  } else {
    console.log("Generic stages are unique:", genericNames);
  }
}

main().finally(() => prisma.$disconnect());
