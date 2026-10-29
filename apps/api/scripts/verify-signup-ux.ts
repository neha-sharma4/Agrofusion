import fs from "node:fs";
import path from "node:path";
import { prisma } from "../src/config/prisma.js";

const API = "http://localhost:4000/api";

async function verifySignupUx() {
  console.log("================================================================");
  console.log("        VERIFYING SIGNUP UX & LOGIN NAVIGATION FLOW             ");
  console.log("================================================================\n");

  const timestamp = Date.now();
  const existingEmail = `existing.farmer.${timestamp}@agrifusion.local`;
  const newEmail = `new.farmer.${timestamp}@agrifusion.local`;
  const password = "TestPassword@123";

  // Step 1: Create initial user so email exists
  console.log("1. Creating an existing user in DB...");
  const initialSignupRes = await fetch(`${API}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Existing Farmer",
      email: existingEmail,
      phone: "9876543210",
      password: password,
      preferredLanguage: "en",
    }),
  });

  const initialSignup = await initialSignupRes.json();
  if (!initialSignupRes.ok || !initialSignup.success) {
    throw new Error(`Failed to create initial user: ${JSON.stringify(initialSignup)}`);
  }
  console.log(`   ✓ Initial user created: ${existingEmail}`);

  // Mark the initial user as verified so duplicate check tests EMAIL_IN_USE
  await prisma.user.update({
    where: { email: existingEmail.toLowerCase() },
    data: { isEmailVerified: true },
  });
  console.log("\n2. Testing Signup with existing email (duplicate check)...");
  const duplicateRes = await fetch(`${API}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Duplicate Farmer",
      email: existingEmail,
      phone: "9876543211",
      password: password,
      preferredLanguage: "en",
    }),
  });

  const duplicateData = await duplicateRes.json();
  console.log("   Duplicate signup status:", duplicateRes.status);
  console.log("   Duplicate signup response:", duplicateData);

  if (duplicateRes.status !== 409) {
    throw new Error(`Expected HTTP 409 for duplicate email, got ${duplicateRes.status}`);
  }
  if (duplicateData.error?.code !== "EMAIL_IN_USE") {
    throw new Error(`Expected error code EMAIL_IN_USE, got ${duplicateData.error?.code}`);
  }
  if (!duplicateData.error?.message.includes("An account with this email already exists")) {
    throw new Error(`Expected message 'An account with this email already exists.', got: ${duplicateData.error?.message}`);
  }
  console.log("   ✓ Duplicate email correctly detected and returned 409 with exact message!");

  // Step 3: Test Signup with New Email
  console.log("\n3. Testing Signup with a brand new email...");
  const newSignupRes = await fetch(`${API}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "New Farmer",
      email: newEmail,
      phone: "9123456780",
      password: password,
      preferredLanguage: "hi",
    }),
  });

  const newSignupData = await newSignupRes.json();
  console.log("   New signup status:", newSignupRes.status);
  console.log("   New signup response:", newSignupData);

  if (newSignupRes.status !== 201 || !newSignupData.success || !newSignupData.data.requiresVerification) {
    throw new Error(`New email signup failed: ${JSON.stringify(newSignupData)}`);
  }
  console.log(`   ✓ New email signup succeeded! User ID: ${newSignupData.data.id}`);

  // Step 4: Verify Frontend AuthPages Component & Bundle Structure
  console.log("\n4. Verifying Frontend Navigation Links in AuthPages...");
  const resolveWeb = (sub: string) => {
    const p1 = path.resolve(process.cwd(), "apps/web", sub);
    if (fs.existsSync(p1)) return p1;
    return path.resolve(process.cwd(), "../web", sub);
  };
  const authPagesPath = resolveWeb("src/pages/auth/AuthPages.tsx");
  const authPagesContent = fs.readFileSync(authPagesPath, "utf8");

  // Check 4a: SignupPage has duplicate email handling with Go to Login action
  if (!authPagesContent.includes("isEmailInUse") || !authPagesContent.includes("goToLogin")) {
    throw new Error("AuthPages.tsx is missing duplicate email detection or goToLogin button!");
  }
  console.log("   ✓ Duplicate email warning card with 'goToLogin' action verified in SignupPage.");

  // Check 4b: SignupPage links to /login with email prefill
  if (!authPagesContent.includes("/login?email=")) {
    throw new Error("SignupPage does not pre-fill email when navigating to /login!");
  }
  console.log("   ✓ SignupPage pre-fills email parameter when directing user to /login.");

  // Check 4c: SignupPage always has persistent 'Already have an account? Log in' link
  if (!authPagesContent.includes('to="/login"')) {
    throw new Error("SignupPage is missing persistent link to /login!");
  }
  console.log("   ✓ Persistent 'Already have an account? Log in' footer link verified on SignupPage.");

  // Check 4d: LoginPage has reciprocal 'Don't have an account? Sign up' link
  if (!authPagesContent.includes('to="/signup"')) {
    throw new Error("LoginPage is missing link to /signup!");
  }
  console.log("   ✓ 'Don't have an account? Sign up' link verified on LoginPage.");

  // Check 4e: LoginPage consumes email query param
  if (!authPagesContent.includes('new URLSearchParams(window.location.search).get("email")')) {
    throw new Error("LoginPage does not read email query parameter!");
  }
  console.log("   ✓ LoginPage reads email query parameter for automatic pre-fill.");

  // Step 5: Verify Translation Files
  console.log("\n5. Verifying i18n Translation Files (en.ts & hi.ts)...");
  const enPath = resolveWeb("src/i18n/en.ts");
  const hiPath = resolveWeb("src/i18n/hi.ts");
  const enContent = fs.readFileSync(enPath, "utf8");
  const hiContent = fs.readFileSync(hiPath, "utf8");

  const requiredKeys = [
    "alreadyHaveAccountText",
    "alreadyHaveAccount",
    "dontHaveAccountText",
    "dontHaveAccount",
    "goToLogin",
  ];

  for (const key of requiredKeys) {
    if (!enContent.includes(key)) throw new Error(`Missing ${key} in en.ts`);
    if (!hiContent.includes(key)) throw new Error(`Missing ${key} in hi.ts`);
  }
  console.log("   ✓ All navigation strings present in both English and Hindi.");

  // Step 6: Verify Production Build Output
  console.log("\n6. Verifying Production Build Assets...");
  const distDir = resolveWeb("dist/assets");
  const distFiles = fs.readdirSync(distDir);
  const jsBundle = distFiles.find((f) => f.startsWith("index-") && f.endsWith(".js"));

  if (!jsBundle) {
    throw new Error("Production JS bundle not found in apps/web/dist/assets!");
  }
  console.log(`   ✓ Production build asset found: ${jsBundle}`);

  console.log("\n================================================================");
  console.log("   ALL SIGNUP UX & NAVIGATION CHECKS PASSED SUCCESSFULLY!       ");
  console.log("================================================================\n");
}

verifySignupUx()
  .catch((err) => {
    console.error("Verification failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
