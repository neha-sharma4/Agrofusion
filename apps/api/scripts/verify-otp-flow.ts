import { prisma } from "../src/config/prisma.js";
import { hashSecret } from "../src/utils/crypto.js";

const API = "http://localhost:4000/api";

async function verifyOtpFlow() {
  console.log("================================================================");
  console.log("       STARTING FARMER REGISTRATION & OTP VERIFICATION TEST       ");
  console.log("================================================================\n");

  const timestamp = Date.now();
  // Using user's configured email so real email delivery can be verified
  const testEmail = `neha.sharma04350+test${timestamp}@gmail.com`;
  const testPassword = "TestPassword@123";
  const testName = "Ramesh Patel";
  const testPhone = "9876543210";

  // Step 1: Farmer Signup
  console.log("1. Testing Farmer Signup...");
  console.log(`   Email: ${testEmail}`);
  const signupRes = await fetch(`${API}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: testName,
      email: testEmail,
      phone: testPhone,
      password: testPassword,
      preferredLanguage: "hi",
    }),
  });

  const signupRawText = await signupRes.text();
  const signupData = JSON.parse(signupRawText);
  console.log("   Signup response status:", signupRes.status);
  console.log("   Signup response body:", signupData);

  if (!signupRes.ok || !signupData.success || !signupData.data.requiresVerification) {
    throw new Error(`Signup failed: ${signupRawText}`);
  }

  const userId = signupData.data.id;

  // Verify that OTP is NOT returned in API response
  if ("devOtp" in signupData.data || signupData.data.devOtp !== undefined) {
    throw new Error("SECURITY VIOLATION: devOtp was returned in signup response!");
  }
  if (signupRawText.toLowerCase().includes("devotp")) {
    throw new Error("SECURITY VIOLATION: 'devOtp' key was found in raw signup JSON response!");
  }
  console.log("   ✓ Signup successful. OTP was NOT returned in API response (zero exposure).");

  // Step 2: Confirm /dev-otp endpoint is removed
  console.log("\n2. Testing /api/auth/dev-otp endpoint...");
  const devOtpRes = await fetch(`${API}/auth/dev-otp?email=${encodeURIComponent(testEmail)}`);
  console.log("   /api/auth/dev-otp status:", devOtpRes.status);
  if (devOtpRes.status !== 404) {
    throw new Error(`Expected 404 for removed /dev-otp endpoint, got ${devOtpRes.status}`);
  }
  console.log("   ✓ /api/auth/dev-otp correctly returns 404 (endpoint removed).");

  // Step 3: Verify unverified user cannot log in
  console.log("\n3. Verifying unverified account cannot log in...");
  const preLoginRes = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: testPassword }),
  });
  const preLoginData = await preLoginRes.json();
  console.log("   Pre-verification login status:", preLoginRes.status);
  console.log("   Pre-verification login error code:", preLoginData.error?.code);
  if (preLoginRes.status !== 403 || preLoginData.error?.code !== "UNVERIFIED") {
    throw new Error(`Expected 403 UNVERIFIED, got: ${JSON.stringify(preLoginData)}`);
  }
  console.log("   ✓ Unverified user login blocked with 403 UNVERIFIED.");

  // Step 4: Immediate Resend Attempt (should be blocked by 30s cooldown)
  console.log("\n4. Testing Resend Code before cooldown expires (< 30s)...");
  const immediateResendRes = await fetch(`${API}/auth/resend-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail }),
  });

  const immediateResendData = await immediateResendRes.json();
  console.log("   Cooldown test response status:", immediateResendRes.status);
  console.log("   Cooldown test response body:", immediateResendData);

  if (immediateResendRes.status !== 429 || immediateResendData.error?.code !== "OTP_COOLDOWN") {
    throw new Error(`Expected 429 OTP_COOLDOWN but received: ${immediateResendRes.status}`);
  }
  console.log("   ✓ Cooldown successfully enforced! Rate limit prevented spamming.");

  // Step 5: Simulate cooldown elapse (30 seconds) and perform Resend
  console.log("\n5. Testing Resend Code after cooldown...");
  await prisma.otpVerification.updateMany({
    where: { userId },
    data: { lastSentAt: new Date(Date.now() - 31000) },
  });

  const resendRes = await fetch(`${API}/auth/resend-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail }),
  });

  const resendRawText = await resendRes.text();
  const resendData = JSON.parse(resendRawText);
  console.log("   Resend response status:", resendRes.status);
  console.log("   Resend response body:", resendData);

  if (!resendRes.ok || !resendData.success || !resendData.data.sent) {
    throw new Error(`Resend failed: ${resendRawText}`);
  }
  if ("devOtp" in resendData.data || resendRawText.toLowerCase().includes("devotp")) {
    throw new Error("SECURITY VIOLATION: devOtp found in resend response!");
  }
  console.log("   ✓ Resend successful via Gmail SMTP. Zero OTP exposed in response.");

  // Check DB state: previous record must be invalidated
  const otpRecords = await prisma.otpVerification.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  console.log(`   Total OTP records in DB: ${otpRecords.length}`);
  if (otpRecords.length < 2) {
    throw new Error(`Expected at least 2 OTP records in DB, found: ${otpRecords.length}`);
  }

  const [record1, record2] = otpRecords.slice(-2);
  const now = Date.now();
  console.log(`   Record 1 expiresAt: ${record1.expiresAt.toISOString()} (Invalidated? ${record1.expiresAt.getTime() <= now})`);
  console.log(`   Record 2 expiresAt: ${record2.expiresAt.toISOString()} (Valid? ${record2.expiresAt.getTime() > now})`);

  if (record1.expiresAt.getTime() > now) {
    throw new Error("Previous OTP was NOT invalidated! expiresAt is still in the future.");
  }
  console.log("   ✓ Previous OTP record was successfully invalidated (expired) in DB.");

  // Step 6: Test Incorrect OTP
  console.log("\n6. Testing Incorrect OTP rejection...");
  const badVerifyRes = await fetch(`${API}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, otp: "000000" }),
  });
  const badVerifyData = await badVerifyRes.json();
  console.log("   Bad OTP response status:", badVerifyRes.status);
  console.log("   Bad OTP response body:", badVerifyData);
  if (badVerifyRes.status !== 400 || badVerifyData.error?.code !== "OTP_INVALID") {
    throw new Error(`Expected 400 OTP_INVALID, got: ${JSON.stringify(badVerifyData)}`);
  }
  console.log("   ✓ Incorrect OTP was correctly REJECTED with 400 OTP_INVALID.");

  // Step 7: Test Expired OTP
  console.log("\n7. Testing Expired OTP rejection...");
  // Temporarily set the record's expiresAt to past
  await prisma.otpVerification.update({
    where: { id: record2.id },
    data: { expiresAt: new Date(Date.now() - 5000) },
  });

  const expiredVerifyRes = await fetch(`${API}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, otp: "123456" }),
  });
  const expiredVerifyData = await expiredVerifyRes.json();
  console.log("   Expired OTP response status:", expiredVerifyRes.status);
  console.log("   Expired OTP response body:", expiredVerifyData);
  if (expiredVerifyRes.status !== 400 || expiredVerifyData.error?.code !== "OTP_EXPIRED") {
    throw new Error(`Expected 400 OTP_EXPIRED, got: ${JSON.stringify(expiredVerifyData)}`);
  }
  console.log("   ✓ Expired OTP was correctly REJECTED with 400 OTP_EXPIRED.");

  // Step 8: Test Successful Verification with fresh valid OTP
  console.log("\n8. Testing Successful OTP Verification...");
  const validOtpCode = "753951";
  const validHash = await hashSecret(validOtpCode);
  await prisma.otpVerification.update({
    where: { id: record2.id },
    data: {
      otpCodeHash: validHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      attemptCount: 0,
    },
  });

  const validVerifyRes = await fetch(`${API}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, otp: validOtpCode }),
  });
  const validVerifyData = await validVerifyRes.json();
  console.log("   Valid OTP response status:", validVerifyRes.status);
  console.log("   Valid OTP response body:", validVerifyData);

  if (!validVerifyRes.ok || !validVerifyData.success || !validVerifyData.data.accessToken) {
    throw new Error(`Valid OTP verification failed: ${JSON.stringify(validVerifyData)}`);
  }
  console.log("   ✓ OTP verified successfully! Access token granted.");

  // Verify in DB that isEmailVerified is true
  const verifiedUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!verifiedUser?.isEmailVerified) {
    throw new Error("User.isEmailVerified is not true in DB after verification!");
  }
  console.log("   ✓ User isEmailVerified flag is confirmed TRUE in database.");

  // Step 9: Test Login with the newly verified Farmer account
  console.log("\n9. Testing Farmer Login with verified credentials...");
  const loginRes = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: testPassword }),
  });

  const loginData = await loginRes.json();
  console.log("   Login response status:", loginRes.status);
  console.log("   Login response body:", loginData);

  if (!loginRes.ok || !loginData.success || loginData.data.user.email !== testEmail.toLowerCase()) {
    throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
  }
  console.log("   ✓ Farmer successfully logged in! Access token granted.");

  console.log("\n================================================================");
  console.log("       ALL OTP VERIFICATION TESTS PASSED SUCCESSFULLY!          ");
  console.log("================================================================\n");
}

verifyOtpFlow()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n❌ TEST FAILED:", err.message);
    process.exit(1);
  });
