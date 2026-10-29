import { prisma } from "../src/config/prisma.js";
import { irrigationVolumeLiters, areaToSquareMetres } from "@agrofusion/shared";

const API = "http://localhost:4000/api";

async function run() {
  console.log("=== STARTING END-TO-END VERIFICATION ===");

  // 1. Health
  console.log("\n1. Testing GET /api/health...");
  const healthRes = await fetch(`${API}/health`);
  const health = await healthRes.json();
  console.log("Health response:", health);
  if (!health.success || health.data.status !== "ok") {
    throw new Error("Health check failed");
  }

  // 2. Admin Login
  console.log("\n2. Testing Admin Login with seeded credentials...");
  const adminLoginRes = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@example.com", password: "ChangeMe123!" }),
  });
  const adminLogin = await adminLoginRes.json();
  if (!adminLogin.success || adminLogin.data.user.role !== "ADMIN") {
    throw new Error(`Admin login failed: ${JSON.stringify(adminLogin)}`);
  }
  const adminToken = adminLogin.data.accessToken;
  console.log("Admin logged in successfully, role:", adminLogin.data.user.role);

  // 3. Admin Endpoints
  console.log("\n3. Testing Admin Endpoints...");
  const authHeader = { Authorization: `Bearer ${adminToken}` };

  const [analyticsRes, usersRes, logsRes, adminCropsRes, kbRes] = await Promise.all([
    fetch(`${API}/admin/analytics`, { headers: authHeader }),
    fetch(`${API}/admin/users`, { headers: authHeader }),
    fetch(`${API}/admin/llm-logs`, { headers: authHeader }),
    fetch(`${API}/admin/crops`, { headers: authHeader }),
    fetch(`${API}/admin/knowledge`, { headers: authHeader }),
  ]);

  const analytics = await analyticsRes.json();
  const users = await usersRes.json();
  const logs = await logsRes.json();
  const adminCrops = await adminCropsRes.json();
  const kb = await kbRes.json();

  console.log("Admin analytics counts:", analytics.data);
  console.log(`Users count: ${users.data.length}, KB count: ${kb.data.length}, Logs count: ${logs.data.length}`);
  console.log(`Admin crops count: ${adminCrops.data.length}`);
  if (!analytics.success || !users.success || !adminCrops.success || !kb.success) {
    throw new Error("Admin endpoints test failed");
  }

  // 4. Catalog APIs
  console.log("\n4. Testing Catalog APIs...");
  const cropsRes = await fetch(`${API}/catalog/crops`, { headers: authHeader });
  const crops = await cropsRes.json();
  const soilsRes = await fetch(`${API}/catalog/soil-types`, { headers: authHeader });
  const soils = await soilsRes.json();
  const regionsRes = await fetch(`${API}/catalog/regions`, { headers: authHeader });
  const regions = await regionsRes.json();

  if (!crops.data.length || !soils.data.length || !regions.data.length) {
    throw new Error("Catalog data is empty");
  }

  const rice = crops.data.find((c: any) => c.name === "Rice") || crops.data[0];
  const wheat = crops.data.find((c: any) => c.name === "Wheat") || crops.data[1];
  const alluvial = soils.data.find((s: any) => s.name === "Alluvial") || soils.data[0];
  const transGangetic = regions.data.find((r: any) => r.name.includes("Gangetic")) || regions.data[0];

  // Test GPS suggestion
  const gpsRes = await fetch(`${API}/catalog/suggest-region?lat=30.9&lon=75.8`, { headers: authHeader });
  const gps = await gpsRes.json();
  console.log("GPS Suggestion for (30.9, 75.8):", gps.data.region?.name);
  if (!gps.success || !gps.data.region) {
    throw new Error("GPS region suggestion failed");
  }

  // 5. Farmer Registration & Verification
  console.log("\n5. Testing Farmer Signup & OTP Verification...");
  const testEmail = `farmer_${Date.now()}@agrofusion.test`;
  const signupRes = await fetch(`${API}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Ramesh Kumar",
      email: testEmail,
      phone: "9876543210",
      password: "StrongPassword123!",
      preferredLanguage: "hi",
    }),
  });
  const signup = await signupRes.json();
  if (!signup.success || !signup.data.requiresVerification) {
    throw new Error(`Signup failed: ${JSON.stringify(signup)}`);
  }
  console.log("Farmer signed up:", signup.data);

  // Directly verify email in db for automated testing
  await prisma.user.update({
    where: { email: testEmail },
    data: { isEmailVerified: true },
  });
  console.log("Farmer email marked verified.");

  // Farmer Login
  const loginRes = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: "StrongPassword123!" }),
  });
  const login = await loginRes.json();
  if (!login.success || !login.data.accessToken) {
    throw new Error(`Farmer login failed: ${JSON.stringify(login)}`);
  }
  const farmerToken = login.data.accessToken;
  const farmerHeader = { Authorization: `Bearer ${farmerToken}` };
  console.log("Farmer logged in successfully. Token received.");

  // 6. Crop Suitability
  console.log("\n6. Testing Crop Suitability API...");
  const suitRes = await fetch(`${API}/suitability/check`, {
    method: "POST",
    headers: { ...farmerHeader, "Content-Type": "application/json" },
    body: JSON.stringify({
      cropId: rice.id,
      soilTypeId: alluvial.id,
      regionId: transGangetic.id,
    }),
  });
  const suit = await suitRes.json();
  console.log("Suitability Result:", {
    is_suitable: suit.data.is_suitable,
    confidence: suit.data.confidence,
    reasoning: suit.data.reasoning?.slice(0, 80) + "...",
  });
  if (!suit.success || typeof suit.data.is_suitable !== "boolean") {
    throw new Error("Suitability check failed");
  }

  // 7. Field Creation
  console.log("\n7. Testing Field Creation (Field + Crop Cycle)...");
  const fieldCreateRes = await fetch(`${API}/fields`, {
    method: "POST",
    headers: { ...farmerHeader, "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "North Field",
      cropId: rice.id,
      soilTypeId: alluvial.id,
      regionId: transGangetic.id,
      latitude: 30.9,
      longitude: 75.8,
    }),
  });
  const fieldCreated = await fieldCreateRes.json();
  const firstCycle = fieldCreated.data?.cropCycles?.[0];
  if (!fieldCreated.success || !firstCycle) {
    throw new Error(`Field creation failed: ${JSON.stringify(fieldCreated)}`);
  }
  const fieldId = fieldCreated.data.id;
  const firstCycleId = firstCycle.id;
  console.log("Field created with ID:", fieldId, "Active Cycle:", firstCycleId, "Crop:", firstCycle.crop.name);

  // 8. Start New Crop Cycle (verifying history preservation!)
  console.log("\n8. Testing Start New Crop Cycle (preserving history)...");
  const newCycleRes = await fetch(`${API}/fields/${fieldId}/new-crop-cycle`, {
    method: "POST",
    headers: { ...farmerHeader, "Content-Type": "application/json" },
    body: JSON.stringify({
      cropId: wheat.id,
      soilTypeId: alluvial.id,
      regionId: transGangetic.id,
    }),
  });
  const newCycle = await newCycleRes.json();
  if (!newCycle.success || newCycle.data.crop.name !== wheat.name) {
    throw new Error(`New cycle failed: ${JSON.stringify(newCycle)}`);
  }
  console.log("New cycle created with crop:", newCycle.data.crop.name);

  // Fetch field and check crop cycles list
  const getFieldRes = await fetch(`${API}/fields/${fieldId}`, { headers: farmerHeader });
  const getField = await getFieldRes.json();
  console.log(`Total crop cycles on field ${fieldId}: ${getField.data.cropCycles.length}`);
  if (getField.data.cropCycles.length < 2) {
    throw new Error("Historical crop cycle was not preserved!");
  }
  console.log("Historical crop cycle preservation VERIFIED!");

  const activeCycle = getField.data.activeCycle;

  // 9. Growth Stages & Irrigation Calculation
  console.log("\n9. Testing Irrigation Calculation & Deterministic Math...");
  const stagesRes = await fetch(`${API}/catalog/growth-stages?cropId=${activeCycle.cropId}`, { headers: farmerHeader });
  const stages = await stagesRes.json();
  const stage = stages.data[0];

  const plotArea = 1.5;
  const plotAreaUnit = "ACRE";
  const soilMoisture = 22; // Low moisture -> should require irrigation
  const temp = 34;
  const humidity = 45;

  const areaSqM = areaToSquareMetres(plotArea, plotAreaUnit);

  const irrRes = await fetch(`${API}/irrigation/recommend`, {
    method: "POST",
    headers: { ...farmerHeader, "Content-Type": "application/json" },
    body: JSON.stringify({
      cropCycleId: activeCycle.id,
      growthStageId: stage.id,
      soilMoisturePct: soilMoisture,
      temperatureC: temp,
      humidityPct: humidity,
      plotArea,
      plotAreaUnit,
      useManualWeather: true,
    }),
  });
  const irr = await irrRes.json();
  console.log("Irrigation Result:", {
    required: irr.data.irrigation_required,
    depthMm: irr.data.recommended_amount_mm,
    volumeLiters: irr.data.recommended_volume_liters,
    urgency: irr.data.urgency,
  });

  const expectedVolume = irrigationVolumeLiters(areaSqM, irr.data.recommended_amount_mm);
  console.log(`Area: ${areaSqM} m², Depth: ${irr.data.recommended_amount_mm} mm`);
  console.log(`Calculated Volume: ${irr.data.recommended_volume_liters} L, Expected: ${expectedVolume} L`);
  if (Math.abs(irr.data.recommended_volume_liters - expectedVolume) > 1) {
    throw new Error("Deterministic irrigation math formula check FAILED");
  }
  console.log("Deterministic irrigation math formula check PASSED!");

  // 10. Weather API integration test
  console.log("\n10. Testing Weather endpoint...");
  const weatherRes = await fetch(`${API}/irrigation/weather?lat=28.6139&lon=77.2090`, { headers: farmerHeader });
  const weather = await weatherRes.json();
  console.log("Weather response:", weather);
  if (!weather.success) {
    throw new Error("Weather endpoint failed");
  }

  // 11. Disease Scan Endpoint (with test image)
  console.log("\n11. Testing Disease Scan Endpoint...");
  // 11a. Low quality image inspection
  const dummyJpegBase64 = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";
  const dummyBuffer = Buffer.from(dummyJpegBase64, "base64");
  const blob = new Blob([dummyBuffer], { type: "image/jpeg" });
  const dummyFormData = new FormData();
  dummyFormData.append("cropCycleId", activeCycle.id);
  dummyFormData.append("image", blob, "leaf.jpg");

  const dummyScanRes = await fetch(`${API}/disease/scan`, {
    method: "POST",
    headers: { Authorization: `Bearer ${farmerToken}` },
    body: dummyFormData,
  });
  const dummyScan = await dummyScanRes.json();
  console.log("Quality Check Result:", dummyScan.data?.status);
  if (!dummyScan.success || (dummyScan.data.status !== "INSUFFICIENT_IMAGE_QUALITY" && dummyScan.data.status !== "INVALID_IMAGE")) {
    throw new Error(`Image quality inspection failed: ${JSON.stringify(dummyScan)}`);
  }
  console.log("Image quality/validity gate check PASSED! Status:", dummyScan.data.status);

  // 11b. Real plant leaf disease diagnosis
  const fs = await import("node:fs");
  const path = await import("node:path");
  const uploadsDir = path.resolve("./uploads");
  if (fs.existsSync(uploadsDir)) {
    const uploadFiles = fs.readdirSync(uploadsDir).filter((f) => f.endsWith(".png") || f.endsWith(".jpg"));
    if (uploadFiles.length > 0) {
      const realFile = uploadFiles[0];
      console.log(`Testing real photo scan with ${realFile}...`);
      const realBuffer = fs.readFileSync(path.join(uploadsDir, realFile));
      const realBlob = new Blob([realBuffer], { type: realFile.endsWith(".png") ? "image/png" : "image/jpeg" });
      const realFormData = new FormData();
      realFormData.append("cropCycleId", activeCycle.id);
      realFormData.append("image", realBlob, realFile);

      const realScanRes = await fetch(`${API}/disease/scan`, {
        method: "POST",
        headers: { Authorization: `Bearer ${farmerToken}` },
        body: realFormData,
      });
      const realScan = await realScanRes.json();
      console.log("Real Disease Scan Result:", {
        status: realScan.data?.status,
        identifiedCrop: realScan.data?.identified_crop,
        condition: realScan.data?.disease_common_name,
        confidence: realScan.data?.confidence,
        symptoms: realScan.data?.visible_symptoms?.length,
        treatmentAvailable: realScan.data?.treatment_available,
        message: realScan.data?.message,
      });

      if (!realScan.success || !realScan.data?.status) {
        throw new Error(`Real image scan failed: ${JSON.stringify(realScan)}`);
      }
      console.log("End-to-end vision pathology diagnosis PASSED!");
    }
  }

  // 12. History & Feedback
  console.log("\n12. Testing History and Feedback APIs...");
  const historyRes = await fetch(`${API}/history`, { headers: farmerHeader });
  const history = await historyRes.json();
  console.log(`Farmer history items: ${history.data.length}`);
  if (!history.success || history.data.length === 0) {
    throw new Error("History does not contain saved records");
  }

  const feedbackRes = await fetch(`${API}/feedback`, {
    method: "POST",
    headers: { ...farmerHeader, "Content-Type": "application/json" },
    body: JSON.stringify({
      relatedType: "irrigation",
      relatedId: history.data.find((h: any) => h.type === "irrigation")?.id || history.data[0].id,
      rating: "helpful",
      comment: "Very accurate calculation",
    }),
  });
  const feedback = await feedbackRes.json();
  if (!feedback.success) {
    throw new Error("Feedback submission failed");
  }
  console.log("Feedback submitted successfully.");

  console.log("\n==========================================");
  console.log("ALL END-TO-END VERIFICATION CHECKS PASSED!");
  console.log("==========================================");
}

run()
  .catch((err) => {
    console.error("\nVerification failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
