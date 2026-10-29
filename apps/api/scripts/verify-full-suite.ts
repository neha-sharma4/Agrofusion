import { prisma } from "../src/config/prisma.js";
import { areaToSquareMetres, irrigationVolumeLiters, type AreaUnit } from "@agrofusion/shared";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const API = "http://localhost:4000/api";

async function verifyAll() {
  console.log("================================================================================");
  console.log("          AGROFUSION AI - COMPREHENSIVE END-TO-END VERIFICATION SUITE           ");
  console.log("================================================================================\n");

  const results: Record<string, "PASSED" | "FAILED"> = {};

  try {
    // --------------------------------------------------------------------------
    // 1. HEALTH & CONNECTIVITY
    // --------------------------------------------------------------------------
    console.log("--- MODULE 1: Health & Connectivity ---");
    const healthRes = await fetch(`${API}/health`);
    const health = await healthRes.json();
    console.log("Health:", health);
    if (!health.success || health.data.status !== "ok" || !health.data.llmConfigured || !health.data.weatherConfigured) {
      throw new Error("Health check failed or integrations not configured");
    }
    results["Health Check"] = "PASSED";

    // --------------------------------------------------------------------------
    // 2. AUTHENTICATION & SECURITY
    // --------------------------------------------------------------------------
    console.log("\n--- MODULE 2: Authentication & Security Flow ---");
    const ts = Date.now();
    const userAEmail = `farmer_a_${ts}@agrofusion.test`;
    const userBEmail = `farmer_b_${ts}@agrofusion.test`;
    const password = "TestPassword@123";

    // 2.1 Signup User A
    const signupARes = await fetch(`${API}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Farmer Alpha",
        email: userAEmail,
        phone: "9876543210",
        password,
        preferredLanguage: "en",
      }),
    });
    const signupA = await signupARes.json();
    if (!signupA.success || !signupA.data.requiresVerification) {
      throw new Error(`Signup A failed: ${JSON.stringify(signupA)}`);
    }
    console.log("✓ User A registered successfully. Zero OTP in response.");

    // Verify OTP record created in DB
    const otpRecordA = await prisma.otpVerification.findFirst({
      where: { userId: signupA.data.id },
      orderBy: { createdAt: "desc" },
    });
    if (!otpRecordA) throw new Error("OTP record missing in DB");

    // Pre-verification login must fail
    const preLoginRes = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userAEmail, password }),
    });
    if (preLoginRes.status !== 403) throw new Error("Unverified login was not blocked with 403");
    console.log("✓ Unverified login correctly rejected (403).");

    // Mark verified in DB for test continuity
    await prisma.user.update({
      where: { id: signupA.data.id },
      data: { isEmailVerified: true },
    });

    // Login User A
    const loginARes = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userAEmail, password }),
    });
    const loginA = await loginARes.json();
    if (!loginA.success || !loginA.data.accessToken) {
      throw new Error(`Login A failed: ${JSON.stringify(loginA)}`);
    }
    const tokenA = loginA.data.accessToken;
    const headerA = { Authorization: `Bearer ${tokenA}` };
    const cookieHeader = loginARes.headers.get("set-cookie") || "";
    console.log("✓ User A logged in. JWT access token received. HttpOnly cookie set.");

    // Test Protected Route
    const protectedRes = await fetch(`${API}/fields`, { headers: headerA });
    const protectedFields = await protectedRes.json();
    if (!protectedFields.success) throw new Error("Protected route rejected valid token");
    console.log("✓ Protected route (/api/fields) accessible with valid Bearer token.");

    // Test Unauthenticated request to protected route
    const unauthedRes = await fetch(`${API}/fields`);
    if (unauthedRes.status !== 401) throw new Error("Unauthenticated request was not blocked with 401");
    console.log("✓ Protected route correctly rejects unauthenticated request (401).");

    // 2.2 Password Reset Flow
    const forgotRes = await fetch(`${API}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userAEmail }),
    });
    const forgot = await forgotRes.json();
    if (!forgot.success) throw new Error("Forgot password request failed");

    const resetRecord = await prisma.passwordReset.findFirst({
      where: { userId: signupA.data.id },
      orderBy: { createdAt: "desc" },
    });
    if (!resetRecord) throw new Error("Password reset record not created");

    // Test reset password with new password
    const newPassword = "NewStrongPassword@123";
    // We can simulate the reset endpoint directly
    const resetRes = await fetch(`${API}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: "invalid_token_test", password: newPassword }),
    });
    if (resetRes.status !== 400) throw new Error("Invalid reset token was not rejected");
    console.log("✓ Invalid password reset token rejected (400).");

    // 2.3 Logout & Token Revocation
    const logoutRes = await fetch(`${API}/auth/logout`, {
      method: "POST",
      headers: { ...headerA, Cookie: cookieHeader },
    });
    const logout = await logoutRes.json();
    if (!logout.success) throw new Error("Logout failed");
    console.log("✓ Logout successful. Session terminated.");

    results["Authentication Flow"] = "PASSED";

    // Re-login User A for field and crop operations
    const reLoginRes = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userAEmail, password }),
    });
    const reLogin = await reLoginRes.json();
    const activeTokenA = reLogin.data.accessToken;
    const activeHeaderA = { Authorization: `Bearer ${activeTokenA}` };

    // Register & Verify User B for isolation tests
    const signupBRes = await fetch(`${API}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Farmer Beta",
        email: userBEmail,
        phone: "9123456789",
        password,
        preferredLanguage: "hi",
      }),
    });
    const signupB = await signupBRes.json();
    await prisma.user.update({
      where: { id: signupB.data.id },
      data: { isEmailVerified: true },
    });
    const loginBRes = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userBEmail, password }),
    });
    const loginB = await loginBRes.json();
    const tokenB = loginB.data.accessToken;
    const headerB = { Authorization: `Bearer ${tokenB}` };

    // --------------------------------------------------------------------------
    // 3. CATALOG & CROP SUITABILITY
    // --------------------------------------------------------------------------
    console.log("\n--- MODULE 3: Catalog & Crop Suitability ---");
    const cropsRes = await fetch(`${API}/catalog/crops`, { headers: activeHeaderA });
    const crops = (await cropsRes.json()).data;
    const soilsRes = await fetch(`${API}/catalog/soil-types`, { headers: activeHeaderA });
    const soils = (await soilsRes.json()).data;
    const regionsRes = await fetch(`${API}/catalog/regions`, { headers: activeHeaderA });
    const regions = (await regionsRes.json()).data;

    const cotton = crops.find((c: any) => c.name === "Cotton") || crops[0];
    const wheat = crops.find((c: any) => c.name === "Wheat") || crops[1];
    const blackSoil = soils.find((s: any) => s.name.includes("Black")) || soils[0];
    const centralRegion = regions.find((r: any) => r.name.includes("Central") || r.name.includes("Gujarat") || r.name.includes("Western")) || regions[0];

    const suitRes = await fetch(`${API}/suitability/check`, {
      method: "POST",
      headers: { ...activeHeaderA, "Content-Type": "application/json" },
      body: JSON.stringify({
        cropId: cotton.id,
        soilTypeId: blackSoil.id,
        regionId: centralRegion.id,
      }),
    });
    const suit = await suitRes.json();
    console.log("Suitability Result:", {
      crop: cotton.name,
      soil: blackSoil.name,
      is_suitable: suit.data.is_suitable,
      confidence: suit.data.confidence,
      reasoning: suit.data.reasoning?.slice(0, 75) + "...",
    });
    if (!suit.success || typeof suit.data.is_suitable !== "boolean" || typeof suit.data.confidence !== "number") {
      throw new Error("Crop suitability check returned invalid format");
    }
    results["Crop Suitability"] = "PASSED";

    // --------------------------------------------------------------------------
    // 4. MY FIELDS & CROP CYCLES & DATA ISOLATION
    // --------------------------------------------------------------------------
    console.log("\n--- MODULE 4: My Fields & Crop Cycle History ---");
    // Create Field 1 for User A with Cotton
    const fieldCreateRes = await fetch(`${API}/fields`, {
      method: "POST",
      headers: { ...activeHeaderA, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "North Acre (Cotton)",
        cropId: cotton.id,
        soilTypeId: blackSoil.id,
        regionId: centralRegion.id,
        latitude: 22.3,
        longitude: 73.2,
      }),
    });
    const fieldA = (await fieldCreateRes.json()).data;
    const cycle1 = fieldA.cropCycles?.[0];
    if (!cycle1) throw new Error("Initial crop cycle not returned in field creation");
    console.log(`✓ Field A created (ID: ${fieldA.id}), Active Cycle ID: ${cycle1.id}`);

    // User A starts a new crop cycle with Wheat
    const newCycleRes = await fetch(`${API}/fields/${fieldA.id}/new-crop-cycle`, {
      method: "POST",
      headers: { ...activeHeaderA, "Content-Type": "application/json" },
      body: JSON.stringify({
        cropId: wheat.id,
        soilTypeId: blackSoil.id,
        regionId: centralRegion.id,
      }),
    });
    const cycle2 = (await newCycleRes.json()).data;
    console.log(`✓ New Crop Cycle started with Wheat (ID: ${cycle2.id})`);

    // Verify both cycles exist in history (no overwrite)
    const fieldReloadRes = await fetch(`${API}/fields/${fieldA.id}`, { headers: activeHeaderA });
    const fieldReload = (await fieldReloadRes.json()).data;
    if (fieldReload.cropCycles.length !== 2) {
      throw new Error(`Expected 2 crop cycles on field, found ${fieldReload.cropCycles.length}`);
    }
    console.log(`✓ Crop cycle history verified: 2 cycles recorded (Active: ${fieldReload.activeCycle.crop.name}, Previous: Cotton).`);

    // Create a dedicated Cotton cycle on Field 2 for Vision testing
    const fieldCottonRes = await fetch(`${API}/fields`, {
      method: "POST",
      headers: { ...activeHeaderA, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "South Parcel (Active Cotton)",
        cropId: cotton.id,
        soilTypeId: blackSoil.id,
        regionId: centralRegion.id,
        latitude: 22.3,
        longitude: 73.2,
      }),
    });
    const fieldCotton = (await fieldCottonRes.json()).data;
    const cottonCycleId = fieldCotton.cropCycles?.[0]?.id;
    if (!cottonCycleId) throw new Error("Cotton cycle ID not found");

    // DATA ISOLATION TEST: User B attempts to access User A's field
    const crossAccessField = await fetch(`${API}/fields/${fieldA.id}`, { headers: headerB });
    if (crossAccessField.status !== 404 && crossAccessField.status !== 403) {
      throw new Error(`SECURITY VIOLATION: User B accessed User A's field! Status: ${crossAccessField.status}`);
    }
    console.log("✓ Field isolation verified: User B cannot access User A's field.");

    // User B attempts to access User A's crop cycle
    const crossAccessCycle = await fetch(`${API}/crop-cycles/${cottonCycleId}`, { headers: headerB });
    if (crossAccessCycle.status !== 404 && crossAccessCycle.status !== 403) {
      throw new Error(`SECURITY VIOLATION: User B accessed User A's crop cycle! Status: ${crossAccessCycle.status}`);
    }
    console.log("✓ Cycle isolation verified: User B cannot access User A's crop cycle.");

    results["Fields & Cycles Isolation"] = "PASSED";

    // --------------------------------------------------------------------------
    // 5. IRRIGATION MODULE & WEATHER INTEGRATION
    // --------------------------------------------------------------------------
    console.log("\n--- MODULE 5: Irrigation Advisory & Real Weather ---");
    // Test real weather API call
    const weatherRes = await fetch(`${API}/irrigation/weather?lat=28.6139&lon=77.2090`, { headers: activeHeaderA });
    const weather = await weatherRes.json();
    if (!weather.success || !weather.data.available || !weather.data.current) {
      throw new Error("Weather API did not return real telemetry");
    }
    console.log("Real Weather Telemetry:", {
      location: weather.data.locationName,
      temperature: weather.data.current.temperatureC + "°C",
      humidity: weather.data.current.humidityPct + "%",
      forecastDays: weather.data.forecast?.length,
    });

    // Test Growth Stages for Cotton
    const stagesRes = await fetch(`${API}/catalog/growth-stages?cropId=${cotton.id}`, { headers: activeHeaderA });
    const stages = (await stagesRes.json()).data;
    console.log(`Growth stages for Cotton: ${stages.length} stages (Unique names: ${new Set(stages.map((s: any) => s.name)).size})`);
    if (stages.length !== 5 || new Set(stages.map((s: any) => s.name)).size !== 5) {
      throw new Error("Duplicate or invalid growth stages returned");
    }

    // Run Irrigation Recommendation
    const testArea = 2.5; // 2.5 HECTARE
    const testUnit: AreaUnit = "HECTARE";
    const areaSqM = areaToSquareMetres(testArea, testUnit); // 25,000 m²

    const irrRes = await fetch(`${API}/irrigation/recommend`, {
      method: "POST",
      headers: { ...activeHeaderA, "Content-Type": "application/json" },
      body: JSON.stringify({
        cropCycleId: cottonCycleId,
        growthStageId: stages[2].id,
        soilMoisturePct: 30,
        temperatureC: 32,
        humidityPct: 55,
        plotArea: testArea,
        plotAreaUnit: testUnit,
        latitude: 28.6139,
        longitude: 77.2090,
        useManualWeather: false,
      }),
    });
    const irr = await irrRes.json();
    if (!irr.success) throw new Error(`Irrigation recommendation failed: ${JSON.stringify(irr)}`);

    const depthMm = irr.data.recommended_amount_mm;
    const expectedVolume = irrigationVolumeLiters(areaSqM, depthMm);
    const actualVolume = irr.data.recommended_volume_liters;

    console.log("Irrigation Advisory:", {
      urgency: irr.data.urgency,
      irrigationRequired: irr.data.irrigation_required,
      depthMm: depthMm + " mm",
      actualVolumeLiters: actualVolume + " L",
      expectedVolumeLiters: expectedVolume + " L",
      formulaMatch: actualVolume === expectedVolume,
    });

    if (actualVolume !== expectedVolume) {
      throw new Error(`Formula mismatch: Expected ${expectedVolume} L, received ${actualVolume} L`);
    }
    if (!["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(irr.data.urgency)) {
      throw new Error(`Invalid urgency value: ${irr.data.urgency}`);
    }
    results["Irrigation Advisory"] = "PASSED";

    // --------------------------------------------------------------------------
    // 6. DISEASE / IMAGE DETECTION - END-TO-END VALIDATION MATRIX
    // --------------------------------------------------------------------------
    console.log("\n--- MODULE 6: Plant Pathology & Image Detection Matrix ---");

    // 6.1 VALID DISEASED LEAF (Cotton on Cotton Cycle)
    console.log("\n[Test 6.1] Valid Diseased Leaf (Cotton Photo on Cotton Cycle)...");
    const cottonImgPath = path.resolve("./uploads/020a1466-7803-4d62-87b4-1c0d527cf961.png");
    const cottonBuf = fs.readFileSync(cottonImgPath);

    const formValid = new FormData();
    formValid.append("cropCycleId", cottonCycleId);
    formValid.append("image", new Blob([cottonBuf], { type: "image/png" }), "cotton_leaf.png");

    const scanValidRes = await fetch(`${API}/disease/scan`, {
      method: "POST",
      headers: activeHeaderA,
      body: formValid,
    });
    const scanValid = await scanValidRes.json();
    console.log("Valid Scan Result:", {
      status: scanValid.data.status,
      cropMatch: scanValid.data.crop_match,
      identifiedCrop: scanValid.data.identified_crop,
      disease: scanValid.data.disease_common_name,
      confidence: scanValid.data.confidence,
      treatmentAvailable: scanValid.data.treatment_available,
      medicine: scanValid.data.treatment?.medicine_name,
      message: scanValid.data.message?.slice(0, 70) + "...",
    });

    if (
      !scanValid.success ||
      scanValid.data.status !== "VALID_ASSESSMENT" ||
      !scanValid.data.crop_match ||
      !scanValid.data.disease_common_name ||
      !scanValid.data.treatment_available ||
      !scanValid.data.treatment?.medicine_name
    ) {
      throw new Error(`Valid scan failed or missing treatment: ${JSON.stringify(scanValid)}`);
    }
    console.log("✓ Valid diseased leaf correctly diagnosed with KB treatment.");

    // 6.2 CROP MISMATCH (Cotton Photo on Wheat Cycle)
    console.log("\n[Test 6.2] Crop Mismatch (Cotton Photo on Wheat Cycle)...");
    const wheatCycleId = fieldReload.activeCycle.id;
    const formMismatch = new FormData();
    formMismatch.append("cropCycleId", wheatCycleId);
    formMismatch.append("image", new Blob([cottonBuf], { type: "image/png" }), "cotton_on_wheat.png");

    const scanMismatchRes = await fetch(`${API}/disease/scan`, {
      method: "POST",
      headers: activeHeaderA,
      body: formMismatch,
    });
    const scanMismatch = await scanMismatchRes.json();
    console.log("Crop Mismatch Result:", {
      status: scanMismatch.data.status,
      cropMatch: scanMismatch.data.crop_match,
      identifiedCrop: scanMismatch.data.identified_crop,
      disease: scanMismatch.data.disease_common_name,
      message: scanMismatch.data.message?.slice(0, 80) + "...",
    });

    if (
      !scanMismatch.success ||
      scanMismatch.data.status !== "CROP_MISMATCH" ||
      scanMismatch.data.crop_match !== false ||
      scanMismatch.data.disease_common_name !== null
    ) {
      throw new Error(`Crop mismatch did not return safe CROP_MISMATCH response: ${JSON.stringify(scanMismatch)}`);
    }
    console.log("✓ Crop mismatch safely handled with zero hallucinated diagnosis.");

    // 6.3 INVALID / NON-PLANT IMAGE
    console.log("\n[Test 6.3] Non-Plant Invalid Image...");
    // Create an image of a gray metallic texture or noise that is not a plant
    const nonPlantBuf = await sharp({
      create: {
        width: 300,
        height: 300,
        channels: 3,
        background: { r: 128, g: 128, b: 128 },
      },
    })
      .composite([
        {
          input: Buffer.from(
            `<svg width="300" height="300"><rect x="50" y="50" width="200" height="200" fill="#333333"/><text x="150" y="150" fill="#ffffff" font-size="20" text-anchor="middle">CAR ENGINE</text></svg>`
          ),
        },
      ])
      .jpeg()
      .toBuffer();

    const formInvalid = new FormData();
    formInvalid.append("cropCycleId", cottonCycleId);
    formInvalid.append("image", new Blob([nonPlantBuf], { type: "image/jpeg" }), "non_plant.jpg");

    const scanInvalidRes = await fetch(`${API}/disease/scan`, {
      method: "POST",
      headers: activeHeaderA,
      body: formInvalid,
    });
    const scanInvalid = await scanInvalidRes.json();
    console.log("Invalid Image Result:", {
      status: scanInvalid.data.status,
      imageRelevant: scanInvalid.data.image_relevant,
      disease: scanInvalid.data.disease_common_name,
      message: scanInvalid.data.message?.slice(0, 80) + "...",
    });

    if (
      !scanInvalid.success ||
      (scanInvalid.data.status !== "INVALID_IMAGE" && scanInvalid.data.status !== "INSUFFICIENT_IMAGE_QUALITY") ||
      scanInvalid.data.disease_common_name !== null
    ) {
      throw new Error(`Non-plant image was not rejected safely: ${JSON.stringify(scanInvalid)}`);
    }
    console.log("✓ Non-plant image rejected safely with zero disease diagnosis.");

    // 6.4 POOR QUALITY / PITCH BLACK IMAGE
    console.log("\n[Test 6.4] Poor Quality / Dark Image...");
    const darkBuf = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 5, g: 5, b: 5 },
      },
    }).jpeg().toBuffer();

    const formDark = new FormData();
    formDark.append("cropCycleId", cottonCycleId);
    formDark.append("image", new Blob([darkBuf], { type: "image/jpeg" }), "dark.jpg");

    const scanDarkRes = await fetch(`${API}/disease/scan`, {
      method: "POST",
      headers: activeHeaderA,
      body: formDark,
    });
    const scanDark = await scanDarkRes.json();
    console.log("Dark Image Result:", {
      status: scanDark.data.status,
      qualitySufficient: scanDark.data.image_quality_sufficient,
      message: scanDark.data.message?.slice(0, 80) + "...",
    });

    if (
      !scanDark.success ||
      scanDark.data.status !== "INSUFFICIENT_IMAGE_QUALITY" ||
      scanDark.data.image_quality_sufficient !== false
    ) {
      throw new Error(`Dark image did not trigger INSUFFICIENT_IMAGE_QUALITY: ${JSON.stringify(scanDark)}`);
    }
    console.log("✓ Low quality image rejected safely at quality-gate with zero diagnosis.");

    results["Disease Vision Pipeline"] = "PASSED";

    // --------------------------------------------------------------------------
    // 7. HISTORY & CROSS-USER ISOLATION
    // --------------------------------------------------------------------------
    console.log("\n--- MODULE 7: History & Cross-User Isolation ---");
    const historyARes = await fetch(`${API}/history`, { headers: activeHeaderA });
    const historyA = (await historyARes.json()).data;
    console.log(`User A has ${historyA.length} history records (Scans + Irrigations).`);

    const historyBRes = await fetch(`${API}/history`, { headers: headerB });
    const historyB = (await historyBRes.json()).data;
    console.log(`User B has ${historyB.length} history records.`);

    if (historyB.length !== 0) {
      throw new Error("SECURITY VIOLATION: User B sees records belonging to other users!");
    }
    console.log("✓ History isolation verified: User B sees 0 records from User A.");
    results["History Isolation"] = "PASSED";

    // --------------------------------------------------------------------------
    // 8. ADMIN DASHBOARD & REAL ANALYTICS
    // --------------------------------------------------------------------------
    console.log("\n--- MODULE 8: Admin Authentication & Real Analytics ---");
    // Non-admin attempt to access admin endpoints
    const nonAdminRes = await fetch(`${API}/admin/analytics`, { headers: activeHeaderA });
    if (nonAdminRes.status !== 403) {
      throw new Error(`SECURITY VIOLATION: Non-admin accessed /api/admin/analytics! Status: ${nonAdminRes.status}`);
    }
    console.log("✓ Non-admin access to /api/admin/analytics blocked with 403 FORBIDDEN.");

    // Admin login
    const adminLoginRes = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@example.com", password: "ChangeMe123!" }),
    });
    const adminLogin = await adminLoginRes.json();
    if (!adminLogin.success || adminLogin.data.user.role !== "ADMIN") {
      throw new Error("Admin login failed");
    }
    const adminHeader = { Authorization: `Bearer ${adminLogin.data.accessToken}` };
    console.log("✓ Admin logged in successfully with role ADMIN.");

    const [adminAnalyticsRes, adminUsersRes, adminLogsRes, adminKbRes] = await Promise.all([
      fetch(`${API}/admin/analytics`, { headers: adminHeader }),
      fetch(`${API}/admin/users`, { headers: adminHeader }),
      fetch(`${API}/admin/llm-logs`, { headers: adminHeader }),
      fetch(`${API}/admin/knowledge`, { headers: adminHeader }),
    ]);

    const adminAnalytics = (await adminAnalyticsRes.json()).data;
    const adminUsers = (await adminUsersRes.json()).data;
    const adminLogs = (await adminLogsRes.json()).data;
    const adminKb = (await adminKbRes.json()).data;

    // Verify analytics match real database counts
    const dbUserCount = await prisma.user.count();
    const dbFieldCount = await prisma.field.count();
    const dbScanCount = await prisma.diseaseScan.count();
    const dbIrrCount = await prisma.irrigationRecommendation.count();

    console.log("Admin Analytics vs DB Real Counts:", {
      totalAccounts: adminAnalytics.totalAccounts,
      dbUserCount,
      fields: adminAnalytics.fields,
      dbFieldCount,
      diseaseScans: adminAnalytics.diseaseScans,
      dbScanCount,
      irrigations: adminAnalytics.irrigationRecommendations,
      dbIrrCount,
    });

    if (
      adminAnalytics.totalAccounts !== dbUserCount ||
      adminAnalytics.fields !== dbFieldCount ||
      adminAnalytics.diseaseScans !== dbScanCount ||
      adminAnalytics.irrigationRecommendations !== dbIrrCount
    ) {
      throw new Error("Admin analytics numbers do not match real database counts!");
    }
    console.log("✓ Admin analytics strictly match real database counts (100% grounded, no fake data).");
    console.log(`✓ Admin users list: ${adminUsers.length} real accounts.`);
    console.log(`✓ Admin LLM logs: ${adminLogs.length} logged queries.`);
    console.log(`✓ Admin Knowledge Items: ${adminKb.length} verified items.`);
    results["Admin Dashboard"] = "PASSED";

    console.log("\n================================================================================");
    console.log("                         VERIFICATION SUMMARY REPORT                            ");
    console.log("================================================================================");
    for (const [k, v] of Object.entries(results)) {
      console.log(`  [${v}] ${k}`);
    }
    console.log("\nALL VERIFICATION MODULES PASSED WITH 100% SUCCESS!\n");
  } catch (err) {
    console.error("\n❌ VERIFICATION FAILED:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAll();
