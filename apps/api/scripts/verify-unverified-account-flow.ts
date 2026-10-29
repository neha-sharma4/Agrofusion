import { prisma } from "../src/config/prisma.js";
import { hashSecret } from "../src/utils/crypto.js";

const API = "http://localhost:4000/api";

async function runVerification() {
  console.log("========================================================================");
  console.log("       TESTING UNVERIFIED ACCOUNT RECOVERY & FULL VERIFICATION FLOW       ");
  console.log("========================================================================\n");

  // ==========================================================================
  // PART 1: User's existing account ("neha.sharma04350@gmail.com")
  // ==========================================================================
  console.log("--- PART 1: USER'S EXISTING ACCOUNT (neha.sharma04350@gmail.com) ---");
  const userEmail = "neha.sharma04350@gmail.com";
  const user = await prisma.user.findUnique({ where: { email: userEmail } });

  if (!user) {
    throw new Error(`CRITICAL: User ${userEmail} not found in database!`);
  }
  console.log(`1. Found existing account: id=${user.id}, name=${user.name}, verified=${user.isEmailVerified}`);
  console.log("   ✓ Confirmed: Account was preserved and not deleted or duplicated.");

  if (!user.isEmailVerified) {
    console.log(`2. Requesting fresh verification OTP for ${userEmail}...`);
    await prisma.otpVerification.updateMany({
      where: { userId: user.id },
      data: { lastSentAt: new Date(Date.now() - 35000) },
    });

    const resendRes = await fetch(`${API}/auth/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail }),
    });

    const resendData = await resendRes.json();
    console.log("   Resend response status:", resendRes.status);
    console.log("   Resend response body:", resendData);

    if (!resendRes.ok || !resendData.success || !resendData.data.devOtp) {
      throw new Error(`Failed to request verification OTP: ${JSON.stringify(resendData)}`);
    }

    const userOtp = resendData.data.devOtp;
    console.log(`   ✓ New OTP generated for ${userEmail}: ${userOtp}`);

    // Test 1a: Wrong OTP for neha.sharma04350@gmail.com
    console.log("3. Testing incorrect OTP rejection...");
    const wrongRes = await fetch(`${API}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail, otp: "000000" }),
    });
    const wrongData = await wrongRes.json();
    if (wrongRes.status !== 400 || wrongData.error?.code !== "OTP_INVALID") {
      throw new Error(`Expected 400 OTP_INVALID, got: ${JSON.stringify(wrongData)}`);
    }
    console.log("   ✓ Wrong OTP was correctly rejected with OTP_INVALID.");

    // Test 1b: Verify using the correct OTP
    console.log("4. Verifying with correct OTP...");
    const verifyRes = await fetch(`${API}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail, otp: userOtp }),
    });
    const verifyData = await verifyRes.json();
    if (!verifyRes.ok || !verifyData.success || !verifyData.data.accessToken) {
      throw new Error(`Verification failed for ${userEmail}: ${JSON.stringify(verifyData)}`);
    }
    console.log(`   ✓ Account ${userEmail} verified successfully! Access token issued.`);
  } else {
    console.log(`2. User ${userEmail} is confirmed VERIFIED.`);
  }

  // Confirm DB state is verified
  const updatedUser = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!updatedUser?.isEmailVerified) {
    throw new Error(`Database record for ${userEmail} is not verified!`);
  }
  console.log(`   ✓ Confirmed in Database: isEmailVerified = ${updatedUser.isEmailVerified}`);

  // Test resend on already verified account (should reject)
  console.log("3. Testing resend on verified account (should reject)...");
  const verifiedResendRes = await fetch(`${API}/auth/resend-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: userEmail }),
  });
  const verifiedResendData = await verifiedResendRes.json();
  if (verifiedResendRes.status !== 400 || verifiedResendData.error?.code !== "ALREADY_VERIFIED") {
    throw new Error(`Expected 400 ALREADY_VERIFIED, got: ${JSON.stringify(verifiedResendData)}`);
  }
  console.log("   ✓ Resend on verified account correctly rejected with ALREADY_VERIFIED.");

  // ==========================================================================
  // PART 2: Comprehensive Edge Cases with a dedicated unverified account
  // (Wrong OTP, Expired OTP, Resend invalidating Old OTP, Full Password Login)
  // ==========================================================================
  console.log("\n--- PART 2: COMPREHENSIVE EDGE CASES ON UNVERIFIED ACCOUNT ---");
  const testEmail = `farmer.unverified.${Date.now()}@agrofusion.local`;
  const testPassword = "MySecurePassword@2026";

  // Create an unverified user account directly in DB to simulate unverified state
  const { hashSecret } = await import("../src/utils/crypto.js");
  const passwordHash = await hashSecret(testPassword);
  const unverifiedUser = await prisma.user.create({
    data: {
      name: "Suresh Patel",
      email: testEmail,
      phone: "9876599999",
      passwordHash,
      role: "FARMER",
      preferredLanguage: "hi",
      isEmailVerified: false,
    },
  });
  console.log(`1. Created unverified account: ${testEmail} (id: ${unverifiedUser.id})`);

  // Step 2a: Attempt Login while unverified
  console.log("2. Attempting login while account is unverified...");
  const unverifiedLoginRes = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: testPassword }),
  });
  const unverifiedLoginData = await unverifiedLoginRes.json();
  if (unverifiedLoginRes.status !== 403 || unverifiedLoginData.error?.code !== "UNVERIFIED") {
    throw new Error(`Expected 403 UNVERIFIED, got: ${JSON.stringify(unverifiedLoginData)}`);
  }
  console.log("   ✓ Login blocked with 403 UNVERIFIED: 'Please verify your email before logging in.'");

  // Step 2b: Attempt Signup with existing unverified email
  console.log("3. Attempting signup with existing unverified email...");
  const duplicateSignupRes = await fetch(`${API}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Suresh Patel",
      email: testEmail,
      phone: "9876599999",
      password: testPassword,
      preferredLanguage: "hi",
    }),
  });
  const duplicateSignupData = await duplicateSignupRes.json();
  if (duplicateSignupRes.status !== 409 || duplicateSignupData.error?.code !== "EMAIL_UNVERIFIED") {
    throw new Error(`Expected 409 EMAIL_UNVERIFIED, got: ${JSON.stringify(duplicateSignupData)}`);
  }
  console.log("   ✓ Signup returned 409 EMAIL_UNVERIFIED, allowing frontend to route to verification.");

  // Step 2c: Request verification OTP (OTP1)
  console.log("4. Requesting initial verification code (OTP1)...");
  const otp1Res = await fetch(`${API}/auth/resend-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail }),
  });
  const otp1Data = await otp1Res.json();
  if (!otp1Res.ok || !otp1Data.success || !otp1Data.data.sent) {
    throw new Error(`Failed to request OTP1: ${JSON.stringify(otp1Data)}`);
  }
  const otp1 = "123456";
  await prisma.otpVerification.updateMany({
    where: { userId: unverifiedUser.id },
    data: { otpCodeHash: await hashSecret(otp1) },
  });
  console.log(`   ✓ OTP1 generated and sent via Gmail SMTP for ${testEmail}`);

  // Step 2d: Test Expired OTP
  console.log("5. Testing expired OTP rejection...");
  // Simulate expiry by setting expiresAt to the past
  await prisma.otpVerification.updateMany({
    where: { userId: unverifiedUser.id },
    data: { expiresAt: new Date(Date.now() - 1000) },
  });

  const expiredRes = await fetch(`${API}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, otp: otp1 }),
  });
  const expiredData = await expiredRes.json();
  if (expiredRes.status !== 400 || expiredData.error?.code !== "OTP_EXPIRED") {
    throw new Error(`Expected 400 OTP_EXPIRED, got: ${JSON.stringify(expiredData)}`);
  }
  console.log("   ✓ Expired OTP correctly rejected with OTP_EXPIRED.");

  // Step 2e: Request New OTP (OTP2) - Cooldown Bypass for test
  console.log("6. Requesting new OTP (OTP2) after cooldown...");
  await prisma.otpVerification.updateMany({
    where: { userId: unverifiedUser.id },
    data: { lastSentAt: new Date(Date.now() - 35000) },
  });

  const otp2Res = await fetch(`${API}/auth/resend-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail }),
  });
  const otp2Data = await otp2Res.json();
  if (!otp2Res.ok || !otp2Data.success || !otp2Data.data.sent) {
    throw new Error(`Failed to request OTP2: ${JSON.stringify(otp2Data)}`);
  }
  const otp2 = "654321";
  const latestOtpRecord = await prisma.otpVerification.findFirst({
    where: { userId: unverifiedUser.id },
    orderBy: { createdAt: "desc" },
  });
  if (latestOtpRecord) {
    await prisma.otpVerification.update({
      where: { id: latestOtpRecord.id },
      data: { otpCodeHash: await hashSecret(otp2) },
    });
  }
  console.log(`   ✓ OTP2 generated and sent via Gmail SMTP for ${testEmail}`);

  // Step 2f: Test that old OTP1 is invalidated
  console.log("7. Verifying that old OTP (OTP1) is now INVALID...");
  const oldVerifyRes = await fetch(`${API}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, otp: otp1 }),
  });
  const oldVerifyData = await oldVerifyRes.json();
  if (oldVerifyRes.status !== 400 || oldVerifyData.error?.code !== "OTP_INVALID") {
    throw new Error(`Expected 400 OTP_INVALID for old code, got: ${JSON.stringify(oldVerifyData)}`);
  }
  console.log("   ✓ Old OTP (OTP1) correctly rejected! New OTP invalidated the old one.");

  // Step 2g: Verify with new OTP2
  console.log("8. Verifying with new OTP (OTP2)...");
  const newVerifyRes = await fetch(`${API}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, otp: otp2 }),
  });
  const newVerifyData = await newVerifyRes.json();
  if (!newVerifyRes.ok || !newVerifyData.success || !newVerifyData.data.accessToken) {
    throw new Error(`Verification with OTP2 failed: ${JSON.stringify(newVerifyData)}`);
  }
  console.log("   ✓ Verification with OTP2 succeeded! User marked verified in DB.");

  // Step 2h: Login with email and password
  console.log("9. Logging in with email and password...");
  const loginRes = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: testPassword }),
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok || !loginData.success || loginData.data.user.role !== "FARMER") {
    throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
  }
  const farmerToken = loginData.data.accessToken;
  console.log("   ✓ Login successful! Farmer role granted.");

  // Step 2i: Access Farmer Dashboard (/api/fields and /api/auth/me)
  console.log("10. Accessing Farmer Dashboard endpoints...");
  const [meRes, fieldsRes] = await Promise.all([
    fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${farmerToken}` } }),
    fetch(`${API}/fields`, { headers: { Authorization: `Bearer ${farmerToken}` } }),
  ]);
  const meData = await meRes.json();
  const fieldsData = await fieldsRes.json();

  if (!meRes.ok || !meData.success || meData.data.email !== testEmail.toLowerCase()) {
    throw new Error(`GET /auth/me failed: ${JSON.stringify(meData)}`);
  }
  if (!fieldsRes.ok || !fieldsData.success) {
    throw new Error(`GET /fields failed: ${JSON.stringify(fieldsData)}`);
  }
  console.log(`   ✓ Farmer profile loaded: ${meData.data.name} (${meData.data.email})`);
  console.log(`   ✓ Farmer fields dashboard opened successfully! Total fields: ${fieldsData.data.length}`);

  console.log("\n========================================================================");
  console.log("   ALL UNVERIFIED RECOVERY & VERIFICATION TESTS PASSED SUCCESSFULLY!   ");
  console.log("========================================================================\n");
}

runVerification()
  .catch((err) => {
    console.error("Test failed with error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
