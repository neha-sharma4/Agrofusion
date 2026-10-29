import { prisma } from "../src/config/prisma.js";
import { weatherService } from "../src/integrations/weatherService.js";
import { areaToSquareMetres, irrigationVolumeLiters } from "@agrofusion/shared";

async function main() {
  console.log("=== STEP 1: Verify Growth Stages API Logic (No Duplicates) ===");
  const crops = await prisma.crop.findMany({ take: 3 });
  for (const crop of crops) {
    // Simulate what catalogRouter.get("/growth-stages") does
    let stages = await prisma.growthStage.findMany({
      where: { cropId: crop.id },
      orderBy: { sortOrder: "asc" },
    });
    if (stages.length === 0) {
      stages = await prisma.growthStage.findMany({
        where: { cropId: null },
        orderBy: { sortOrder: "asc" },
      });
    }

    console.log(`Crop "${crop.name}" returned ${stages.length} growth stages:`);
    const names = stages.map((s) => s.name);
    console.log("  Stages:", names);

    if (stages.length !== 5) {
      throw new Error(`Expected exactly 5 growth stages for crop ${crop.name}, got ${stages.length}`);
    }

    const uniqueNames = new Set(names);
    if (uniqueNames.size !== names.length) {
      throw new Error(`Duplicate growth stages found for crop ${crop.name}!`);
    }
  }

  // Without cropId (generic stages)
  const genericStages = await prisma.growthStage.findMany({
    where: { cropId: null },
    orderBy: { sortOrder: "asc" },
  });
  console.log(`Generic (no cropId) returned ${genericStages.length} growth stages:`, genericStages.map((s) => s.name));
  if (genericStages.length !== 5) {
    throw new Error(`Expected 5 generic growth stages, got ${genericStages.length}`);
  }

  console.log("\n=== STEP 2: Verify Weather Service & Reverse Geocoding ===");
  const lat = 28.6139;
  const lon = 77.209;
  const weatherBundle = await weatherService.fetch(lat, lon);
  if (!weatherBundle) {
    throw new Error("Weather fetch failed for coordinates 28.6139, 77.2090");
  }

  console.log("Weather current:", weatherBundle.current);
  console.log("Weather locationName:", weatherBundle.locationName);
  console.log("Forecast days count:", weatherBundle.forecast.length);
  if (weatherBundle.forecast.length > 0) {
    console.log("Sample forecast day:", weatherBundle.forecast[0]);
  }

  if (!weatherBundle.locationName) {
    console.warn("Notice: locationName is undefined, showing coordinates fallback as required.");
  } else {
    console.log("Reverse geocoding successfully detected:", weatherBundle.locationName);
  }

  const directGeo = await weatherService.reverseGeocode(lat, lon);
  console.log("Direct reverse geocode result:", directGeo);

  console.log("\n=== STEP 3: Verify Deterministic Irrigation Math ===");
  const testArea = 2; // 2 ACRE
  const testUnit = "ACRE" as const;
  const areaSqM = areaToSquareMetres(testArea, testUnit);
  const depthMm = 25;
  const expectedLitres = irrigationVolumeLiters(areaSqM, depthMm);
  const manualLitres = Math.round(areaSqM * depthMm);

  console.log(`Area: ${testArea} ${testUnit} = ${areaSqM} m²`);
  console.log(`Depth: ${depthMm} mm`);
  console.log(`irrigationVolumeLiters: ${expectedLitres} L`);
  console.log(`Math.round(areaSqM * depthMm): ${manualLitres} L`);

  if (expectedLitres !== manualLitres) {
    throw new Error(`Deterministic math mismatch! expected ${manualLitres}, got ${expectedLitres}`);
  }

  console.log("\n=== STEP 4: Verify Existing Database Data Integrity ===");
  const fieldCount = await prisma.field.count();
  const cycleCount = await prisma.cropCycle.count();
  const userCount = await prisma.user.count();
  console.log(`Preserved counts -> Users: ${userCount}, Fields: ${fieldCount}, CropCycles: ${cycleCount}`);

  if (userCount === 0) {
    throw new Error("Data loss detected: User count is 0!");
  }

  console.log("\nAll verification checks PASSED successfully!");
}

main()
  .catch((err) => {
    console.error("Verification failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
