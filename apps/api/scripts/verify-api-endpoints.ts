import { prisma } from "../src/config/prisma.js";
import { signAccessToken } from "../src/utils/crypto.js";

async function main() {
  // Find a verified farmer user
  const farmer = await prisma.user.findFirst({
    where: { role: "FARMER", isEmailVerified: true },
  });

  if (!farmer) {
    throw new Error("No verified farmer found in DB");
  }

  // Find a field with an active crop cycle
  const cycle = await prisma.cropCycle.findFirst({
    where: { status: "ACTIVE" },
    include: { crop: true, field: true },
  });

  if (!cycle) {
    throw new Error("No active crop cycle found in DB");
  }

  console.log(`Using farmer: ${farmer.email}, Active cycle crop: ${cycle.crop.name}`);

  const token = signAccessToken(cycle.field.userId, "FARMER");
  const headers = { Authorization: `Bearer ${token}` };

  // Test 1: GET /api/catalog/growth-stages with cropId
  const stagesRes = await fetch(`http://localhost:4000/api/catalog/growth-stages?cropId=${cycle.crop.id}`, { headers });
  const stagesJson = (await stagesRes.json()) as { success: boolean; data: Array<{ id: string; name: string }> };
  console.log("\n1. GET /api/catalog/growth-stages?cropId=" + cycle.crop.id);
  console.log("   Success:", stagesJson.success);
  console.log("   Stage count:", stagesJson.data?.length);
  console.log("   Stage names:", stagesJson.data?.map(s => s.name));

  if (stagesJson.data?.length !== 5) {
    throw new Error(`Expected exactly 5 stages, got ${stagesJson.data?.length}`);
  }
  const uniqueNames = new Set(stagesJson.data.map(s => s.name));
  if (uniqueNames.size !== 5) {
    throw new Error("Duplicate stage names found!");
  }

  // Test 2: GET /api/catalog/growth-stages without cropId (generic)
  const genericRes = await fetch("http://localhost:4000/api/catalog/growth-stages", { headers });
  const genericJson = (await genericRes.json()) as { success: boolean; data: Array<{ id: string; name: string }> };
  console.log("\n2. GET /api/catalog/growth-stages (no cropId)");
  console.log("   Success:", genericJson.success);
  console.log("   Stage count:", genericJson.data?.length);
  console.log("   Stage names:", genericJson.data?.map(s => s.name));

  if (genericJson.data?.length !== 5) {
    throw new Error(`Expected 5 generic stages, got ${genericJson.data?.length}`);
  }

  // Test 3: GET /api/catalog/reverse-geocode
  const geoRes = await fetch("http://localhost:4000/api/catalog/reverse-geocode?lat=28.6139&lon=77.2090", { headers });
  const geoJson = (await geoRes.json()) as { success: boolean; data: { locationName: string | null } };
  console.log("\n3. GET /api/catalog/reverse-geocode?lat=28.6139&lon=77.2090");
  console.log("   Success:", geoJson.success);
  console.log("   Location Name:", geoJson.data?.locationName);

  // Test 4: GET /api/irrigation/weather
  const weatherRes = await fetch("http://localhost:4000/api/irrigation/weather?lat=28.6139&lon=77.2090", { headers });
  const weatherJson = (await weatherRes.json()) as {
    success: boolean;
    data: {
      available: boolean;
      current?: { temperatureC: number; humidityPct: number };
      forecast?: Array<{ date: string; rainfallMm: number; tempMaxC: number; tempMinC: number }>;
      locationName?: string;
    };
  };
  console.log("\n4. GET /api/irrigation/weather?lat=28.6139&lon=77.2090");
  console.log("   Success:", weatherJson.success);
  console.log("   Available:", weatherJson.data?.available);
  console.log("   Location Name:", weatherJson.data?.locationName);
  console.log("   Current temp/humidity:", weatherJson.data?.current);
  console.log("   Forecast days count:", weatherJson.data?.forecast?.length);

  // Test 5: POST /api/irrigation/recommend with detected GPS coordinates
  const recommendRes = await fetch("http://localhost:4000/api/irrigation/recommend", {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      cropCycleId: cycle.id,
      growthStageId: stagesJson.data[0].id,
      soilMoisturePct: 35,
      temperatureC: weatherJson.data?.current?.temperatureC ?? 28,
      humidityPct: weatherJson.data?.current?.humidityPct ?? 65,
      plotArea: 2,
      plotAreaUnit: "ACRE",
      latitude: 28.6139,
      longitude: 77.2090,
      useManualWeather: false,
    }),
  });
  const recJson = (await recommendRes.json()) as any;
  console.log("\n5. POST /api/irrigation/recommend (with GPS coordinates)");
  console.log("   Full response:", JSON.stringify(recJson));
  console.log("   Success:", recJson.success);
  console.log("   Irrigation Required:", recJson.data?.irrigation_required);
  console.log("   Recommended Depth (mm):", recJson.data?.recommended_amount_mm);
  console.log("   Recommended Volume (L):", recJson.data?.recommended_volume_liters);
  console.log("   Urgency Level:", recJson.data?.urgency);

  // Verify volume math: plotAreaSqM * recommended_amount_mm
  const expectedVol = recJson.data?.plotAreaSqM * (recJson.data?.recommended_amount_mm ?? 0);
  if (Math.abs((recJson.data?.recommended_volume_liters ?? 0) - expectedVol) > 1) {
    throw new Error(`Volume mismatch! expected approx ${expectedVol}, got ${recJson.data?.recommended_volume_liters}`);
  }
  console.log(`   Deterministic check passed: ${recJson.data?.recommended_volume_liters} ≈ ${expectedVol}`);

  // Test 6: POST /api/irrigation/recommend with manual weather fallback (no GPS)
  const manualRecRes = await fetch("http://localhost:4000/api/irrigation/recommend", {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      cropCycleId: cycle.id,
      growthStageId: stagesJson.data[1].id,
      soilMoisturePct: 50,
      temperatureC: 32,
      humidityPct: 50,
      plotArea: 1,
      plotAreaUnit: "HECTARE",
      useManualWeather: true,
    }),
  });
  const manualRecJson = (await manualRecRes.json()) as {
    success: boolean;
    data: {
      irrigation_required: boolean;
      recommended_amount_mm: number;
      recommended_volume_liters: number;
      plotAreaSqM: number;
      urgency: string;
    };
  };
  console.log("\n6. POST /api/irrigation/recommend (manual weather fallback)");
  console.log("   Success:", manualRecJson.success);
  console.log("   Irrigation Required:", manualRecJson.data?.irrigation_required);
  console.log("   Recommended Depth (mm):", manualRecJson.data?.recommended_amount_mm);
  console.log("   Recommended Volume (L):", manualRecJson.data?.recommended_volume_liters);
  console.log("   Urgency Level:", manualRecJson.data?.urgency);

  // 1 HECTARE = 10000 m²
  const expectedManualVol = manualRecJson.data?.plotAreaSqM * (manualRecJson.data?.recommended_amount_mm ?? 0);
  if (Math.abs((manualRecJson.data?.recommended_volume_liters ?? 0) - expectedManualVol) > 1) {
    throw new Error(`Manual volume mismatch! expected approx ${expectedManualVol}, got ${manualRecJson.data?.recommended_volume_liters}`);
  }
  console.log(`   Deterministic check passed: ${manualRecJson.data?.recommended_volume_liters} ≈ ${expectedManualVol}`);

  console.log("\nALL END-TO-END HTTP API TESTS PASSED!");
}

main()
  .catch((e) => {
    console.error("HTTP verification error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
