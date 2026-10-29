import { FormEvent, useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthApi, setToken } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import {
  AgriIcon,
  Button,
  Card,
  EditorialBadge,
  ErrorBanner,
  Field,
  Input,
  MetricDisplay,
} from "../../components/ui";
import i18n from "../../i18n";
import { AGRI_HERO_IMAGES } from "../../lib/agronomyAssets";

// =========================================================
// 1. LANDING PAGE — EDITORIAL AGRI-TECH PLATFORM SHOWCASE
// =========================================================
export function LandingPage() {
  const { t } = useTranslation();
  const nav = useNavigate();

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#def2e4] via-[#eaf6ee] to-[#e1f3e7] text-stone-900 flex flex-col selection:bg-forest-100 selection:text-forest-900">
      {/* Top Editorial Bar */}
      <header className="border-b border-emerald-200/80 bg-[#def2e4]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-forest-900 text-white shadow-xs">
              <AgriIcon name="leaf" className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg font-bold tracking-tight text-stone-950 leading-none">
                AgroFusion<span className="text-forest-600">.ai</span>
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-stone-500 mt-1">
                Agri-Intelligence Platform
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Picker */}
            <div className="relative hidden sm:block">
              <select
                aria-label={t("language")}
                className="appearance-none rounded-xl border border-stone-300/80 bg-white px-3 py-1.5 pr-8 font-mono text-xs font-medium text-stone-800 transition-colors hover:border-forest-700 hover:bg-white focus:outline-hidden cursor-pointer"
                value={i18n.language.startsWith("hi") ? "hi" : "en"}
                onChange={(e) => {
                  void i18n.changeLanguage(e.target.value);
                  localStorage.setItem("lang", e.target.value);
                }}
              >
                <option value="en">EN • English</option>
                <option value="hi">HI • हिन्दी</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-stone-400">
                <AgriIcon name="chevronDown" className="h-3 w-3" />
              </div>
            </div>

            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-800 shadow-2xs hover:border-forest-700 hover:text-forest-950 transition"
            >
              <span>{t("login")}</span>
              <AgriIcon name="arrowRight" className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1">
        <section
          className="agri-hero-banner relative overflow-hidden pt-16 sm:pt-24 pb-20 sm:pb-28 border-b border-forest-800/40 text-white"
          style={{ backgroundImage: `url(${AGRI_HERO_IMAGES.fieldsDashboard})` }}
        >
          <div className="agri-hero-overlay" />

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
            <div className="max-w-4xl space-y-6">
              {/* Category Pill */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-mono font-medium backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Autonomous Agricultural Intelligence
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-100 text-xs font-mono backdrop-blur-md">
                  <AgriIcon name="shieldCheck" className="h-3.5 w-3.5 text-emerald-300" />
                  ICAR Protocols Guard
                </span>
              </div>

              {/* Large Display Title */}
              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white text-balance leading-[1.08] drop-shadow-md">
                Intelligence for Every Field.
              </h1>

              {/* Editorial Description */}
              <p className="text-lg sm:text-xl text-emerald-100/90 font-normal leading-relaxed text-pretty max-w-2xl">
                AgroFusion AI unites computer vision pathology, hydrological modeling, and agro-climatic intelligence to provide precision guidance directly to Indian growers and farm managers.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <div className="w-full sm:w-auto">
                  <Button
                    variant="heroPrimary"
                    size="lg"
                    onClick={() => nav("/login")}
                    icon="arrowRight"
                    className="w-full sm:w-auto"
                  >
                    {t("getStarted")}
                  </Button>
                </div>
                <div className="w-full sm:w-auto">
                  <Button
                    variant="heroOutline"
                    size="lg"
                    onClick={() => nav("/signup")}
                    icon="leaf"
                    className="w-full sm:w-auto"
                  >
                    {t("signup")}
                  </Button>
                </div>
              </div>

              {/* Compliance & Standards */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-emerald-200/90 font-mono">
                <span className="flex items-center gap-1.5">
                  <AgriIcon name="shieldCheck" className="h-4 w-4 text-emerald-400" />
                  ICAR / CIBRC Verified Protocols
                </span>
                <span className="flex items-center gap-1.5">
                  <AgriIcon name="database" className="h-4 w-4 text-emerald-400" />
                  Hyperlocal Soil & Weather Integration
                </span>
                <span className="flex items-center gap-1.5">
                  <AgriIcon name="check" className="h-4 w-4 text-emerald-400" />
                  English & Hindi Native Support
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Metric Strip (Institutional) */}
        <section className="border-b border-stone-200/80 bg-white/60 py-10 sm:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <MetricDisplay value="< 3s" label="AI Diagnosis Speed" />
              <MetricDisplay value="100%" label="CIBRC Chemistry Aligned" />
              <MetricDisplay value="3-Day" label="Weather Lookahead" />
              <MetricDisplay value="Multi" label="Soil Types & Zones" />
            </div>
          </div>
        </section>

        {/* 3 Pillars / Feature Grid */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
            <div className="mb-12 max-w-2xl">
              <div className="font-mono text-xs font-semibold uppercase tracking-widest text-forest-800 mb-2">
                Core Capabilities
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-stone-950">
                Science-backed decisions for every crop stage.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <Card className="flex flex-col justify-between hover">
                <div>
                  <div className="h-12 w-12 rounded-2xl bg-forest-50 border border-forest-100 text-forest-800 flex items-center justify-center mb-6">
                    <AgriIcon name="scan" className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-stone-950">
                    Computer Vision Pathology
                  </h3>
                  <p className="mt-3 text-sm text-stone-600 leading-relaxed text-pretty">
                    Upload leaf photos taken under natural daylight. The AI model classifies crop conditions and provides structured medicine, dosage, and application timing adhering to ICAR guidelines.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-100 font-mono text-xs uppercase tracking-wider text-forest-800 font-medium">
                  Vision Intelligence →
                </div>
              </Card>

              {/* Feature 2 */}
              <Card className="flex flex-col justify-between hover">
                <div>
                  <div className="h-12 w-12 rounded-2xl bg-sky-50 border border-sky-100 text-sky-800 flex items-center justify-center mb-6">
                    <AgriIcon name="droplet" className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-stone-950">
                    Hydrological Stress Advisory
                  </h3>
                  <p className="mt-3 text-sm text-stone-600 leading-relaxed text-pretty">
                    Compute precise water volume (Liters) and depth (mm) requirements by evaluating soil moisture levels, crop growth stage, and hyperlocal rainfall forecasts.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-100 font-mono text-xs uppercase tracking-wider text-sky-800 font-medium">
                  Irrigation Science →
                </div>
              </Card>

              {/* Feature 3 */}
              <Card className="flex flex-col justify-between hover">
                <div>
                  <div className="h-12 w-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-800 flex items-center justify-center mb-6">
                    <AgriIcon name="layers" className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-stone-950">
                    Regional Agro-Climatic Intelligence
                  </h3>
                  <p className="mt-3 text-sm text-stone-600 leading-relaxed text-pretty">
                    Verify crop suitability against regional soil taxonomy and climate classifications. Receive alternative crop recommendations suited for your specific geographic coordinates.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-100 font-mono text-xs uppercase tracking-wider text-amber-800 font-medium">
                  Regional Suitability →
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Workflow Section: How AgroFusion AI Operates */}
        <section className="py-16 sm:py-20 border-b border-emerald-200/80 bg-white/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <EditorialBadge>Autonomous Precision Workflow</EditorialBadge>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-stone-950">
                How AgroFusion AI Operates
              </h2>
              <p className="mt-2 text-sm text-stone-600">
                From plot soil characterization to multimodal leaf diagnosis in seconds.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <span className="font-mono text-xs font-bold text-forest-800 bg-forest-50 px-2.5 py-1 rounded-md border border-forest-200">
                  STEP 01
                </span>
                <h4 className="mt-4 font-display font-bold text-lg text-stone-950">Register Holding</h4>
                <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">
                  Calibrate your plot coordinates, soil classification (Alluvial, Black, Laterite), and crop species.
                </p>
              </Card>
              <Card className="p-6">
                <span className="font-mono text-xs font-bold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
                  STEP 02
                </span>
                <h4 className="mt-4 font-display font-bold text-lg text-stone-950">Microclimate Sync</h4>
                <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">
                  Automatic GPS weather ingestion captures local temperature, humidity, and 3-day rainfall outlooks.
                </p>
              </Card>
              <Card className="p-6">
                <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  STEP 03
                </span>
                <h4 className="mt-4 font-display font-bold text-lg text-stone-950">Multimodal Scan</h4>
                <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">
                  Capture daylight leaf photography. Gemini Vision AI inspects symptom patterns and foliar pathogens.
                </p>
              </Card>
              <Card className="p-6">
                <span className="font-mono text-xs font-bold text-forest-900 bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-300">
                  STEP 04
                </span>
                <h4 className="mt-4 font-display font-bold text-lg text-stone-950">Prescription Action</h4>
                <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">
                  Receive ICAR chemical and organic medicines, exact water volumes (Liters), and application timings.
                </p>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Institutional Footer */}
      <footer className="border-t border-emerald-200/80 bg-[#d9eedf] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-stone-500 font-mono">
          <div className="flex items-center gap-3">
            <span className="font-bold text-stone-900 font-display text-sm">AgroFusion AI</span>
            <span>•</span>
            <span>Precision Farm Management System</span>
          </div>
          <div>All agronomic algorithms calibrated to Indian agro-climatic conditions.</div>
        </div>
      </footer>
    </div>
  );
}

// =========================================================
// 2. LOGIN PAGE — EDITORIAL SPLIT AUTHENTICATION
// =========================================================
export function LoginPage() {
  const { t } = useTranslation();
  const { setUser } = useAuth();
  const nav = useNavigate();
  const emailParam = new URLSearchParams(window.location.search).get("email") || "";
  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isUnverified, setIsUnverified] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
  }, [emailParam]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setIsUnverified(false);
    try {
      const res = await AuthApi.login(email, password);
      setToken(res.accessToken);
      setUser(res.user);
      void i18n.changeLanguage(res.user.preferredLanguage);
      nav(res.user.role === "ADMIN" ? "/admin" : "/fields");
    } catch (err: unknown) {
      const apiErr = err as { code?: string; message?: string };
      const unverified =
        apiErr?.code === "UNVERIFIED" ||
        (typeof apiErr?.message === "string" && apiErr.message.toLowerCase().includes("verify your email"));
      setIsUnverified(unverified);
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title={t("login")}
      subtitle="Access precision crop health and irrigation intelligence"
    >
      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
        {isUnverified ? (
          <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-4 text-sm text-amber-950 shadow-xs">
            <div className="flex items-start gap-3">
              <AgriIcon name="alertTriangle" className="h-5 w-5 shrink-0 text-amber-700 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-amber-950">
                  {error || t("pleaseVerifyFirst")}
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-amber-200/80 pt-2.5">
                  <span className="text-stone-700 font-medium text-xs">Need to complete email verification?</span>
                  <Link
                    to={`/verify?email=${encodeURIComponent(email)}`}
                    className="inline-flex items-center gap-1 rounded-xl bg-forest-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-forest-800 transition"
                  >
                    <span>{t("verifyEmail")}</span>
                    <AgriIcon name="arrowRight" className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <ErrorBanner message={error} />
        )}

        <Field label={t("email")}>
          <Input
            type="email"
            required
            placeholder="farmer@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (isUnverified) setIsUnverified(false);
            }}
            autoComplete="email"
          />
        </Field>

        <Field label={t("password")}>
          <Input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </Field>

        <div className="flex items-center justify-end">
          <Link to="/forgot" className="font-mono text-xs font-medium text-forest-800 hover:text-forest-950 underline">
            {t("forgot")}?
          </Link>
        </div>

        <Button type="submit" size="lg" loading={busy}>
          {busy ? "Authenticating…" : t("login")}
        </Button>

        <div className="mt-6 border-t border-stone-200/80 pt-5 text-center text-xs text-stone-600">
          <span>{t("dontHaveAccountText")} </span>
          <Link to="/signup" className="font-semibold text-forest-900 hover:text-forest-700 underline ml-1">
            {t("signup")}
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}

// =========================================================
// 3. SIGNUP PAGE
// =========================================================
export function SignupPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const emailParam = new URLSearchParams(window.location.search).get("email") || "";
  const [form, setForm] = useState({
    name: "",
    email: emailParam,
    phone: "",
    password: "",
    preferredLanguage: i18n.language.startsWith("hi") ? "hi" : "en",
  });
  const [error, setError] = useState<string | null>(null);
  const [isEmailInUse, setIsEmailInUse] = useState(false);
  const [isEmailUnverified, setIsEmailUnverified] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setIsEmailInUse(false);
    setIsEmailUnverified(false);
    try {
      await AuthApi.signup(form);
      sessionStorage.setItem(`otp_sent_${form.email.toLowerCase()}`, Date.now().toString());
      nav(`/verify?email=${encodeURIComponent(form.email)}`);
    } catch (err: unknown) {
      const apiErr = err as { code?: string; message?: string };
      const isUnverified =
        apiErr?.code === "EMAIL_UNVERIFIED" ||
        (typeof apiErr?.message === "string" && apiErr.message.toLowerCase().includes("not verified"));
      const isDuplicate =
        !isUnverified &&
        (apiErr?.code === "EMAIL_IN_USE" ||
          (typeof apiErr?.message === "string" && apiErr.message.toLowerCase().includes("already exists")));

      setIsEmailUnverified(isUnverified);
      setIsEmailInUse(isDuplicate);
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title={t("signup")}
      subtitle="Register your farm profile for predictive crop intelligence"
    >
      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
        {isEmailUnverified ? (
          <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-4 text-sm text-amber-950 shadow-xs">
            <div className="flex items-start gap-3">
              <AgriIcon name="alertTriangle" className="h-5 w-5 shrink-0 text-amber-700 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-amber-950">
                  {error || t("unverifiedAccountNotice")}
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-amber-200/80 pt-2.5">
                  <span className="text-stone-700 font-medium text-xs">Verify your email to continue</span>
                  <Link
                    to={`/verify?email=${encodeURIComponent(form.email)}`}
                    className="inline-flex items-center gap-1 rounded-xl bg-forest-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-forest-800 transition"
                  >
                    <span>{t("verifyEmail")}</span>
                    <AgriIcon name="arrowRight" className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : isEmailInUse ? (
          <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-4 text-sm text-amber-950 shadow-xs">
            <div className="flex items-start gap-3">
              <AgriIcon name="alertTriangle" className="h-5 w-5 shrink-0 text-amber-700 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-amber-950">{error || "An account with this email already exists."}</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-amber-200/80 pt-2.5">
                  <span className="text-stone-700 font-medium text-xs">
                    {t("alreadyHaveAccountText")}
                  </span>
                  <Link
                    to={`/login?email=${encodeURIComponent(form.email)}`}
                    className="inline-flex items-center gap-1 rounded-xl bg-forest-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-forest-800 transition"
                  >
                    <span>{t("goToLogin")}</span>
                    <AgriIcon name="arrowRight" className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <ErrorBanner message={error} />
        )}

        <Field label={t("name")}>
          <Input
            required
            placeholder="Farmer Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>

        <Field label={t("email")}>
          <Input
            type="email"
            required
            placeholder="farmer@example.com"
            value={form.email}
            onChange={(e) => {
              setForm({ ...form, email: e.target.value });
              if (isEmailInUse) setIsEmailInUse(false);
              if (isEmailUnverified) setIsEmailUnverified(false);
            }}
          />
        </Field>

        <Field label={t("phone")}>
          <Input
            required
            placeholder="+91 98765 43210"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </Field>

        <Field label={t("password")} hint="Min 8 characters">
          <Input
            type="password"
            required
            minLength={8}
            placeholder="Create password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </Field>

        <Button type="submit" size="lg" loading={busy}>
          {busy ? "Registering account…" : t("signup")}
        </Button>

        <div className="mt-6 border-t border-stone-200/80 pt-5 text-center text-xs text-stone-600">
          <span>{t("alreadyHaveAccountText")} </span>
          <Link to="/login" className="font-semibold text-forest-900 hover:text-forest-700 underline ml-1">
            {t("login")}
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}

// =========================================================
// 4. VERIFY OTP PAGE (STRICT ZERO-OTP EXPOSURE)
// =========================================================
export function VerifyPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { setUser } = useAuth();
  const email = new URLSearchParams(window.location.search).get("email") || "";
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(() => {
    const lastSent = sessionStorage.getItem(`otp_sent_${email.toLowerCase()}`);
    if (!lastSent) return 0;
    const elapsed = Math.floor((Date.now() - parseInt(lastSent, 10)) / 1000);
    return Math.max(0, 30 - elapsed);
  });
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!email) return;
    const lastSent = sessionStorage.getItem(`otp_sent_${email.toLowerCase()}`);
    if (lastSent) {
      const elapsed = Math.floor((Date.now() - parseInt(lastSent, 10)) / 1000);
      setCooldown(Math.max(0, 30 - elapsed));
    } else {
      setCooldown(0);
    }
  }, [email]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await AuthApi.verifyOtp(email, otp.trim());
      sessionStorage.removeItem(`otp_sent_${email.toLowerCase()}`);
      setToken(res.accessToken);
      const me = await AuthApi.me();
      setUser(me);
      nav("/fields");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setBusy(false);
    }
  }

  async function onResend() {
    if (cooldown > 0 || resending || !email) return;
    setResending(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await AuthApi.resend(email);
      setSuccessMsg(t("codeResent"));
      setCooldown(30);
      sessionStorage.setItem(`otp_sent_${email.toLowerCase()}`, Date.now().toString());
      setOtp("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not resend verification code";
      setError(msg);
      const match = msg.match(/wait (\d+) seconds/);
      if (match && match[1]) {
        setCooldown(parseInt(match[1], 10));
      } else {
        setCooldown(30);
      }
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthLayout
      title={t("verifyEmail")}
      subtitle="Enter the 6-digit confirmation code delivered to your inbox"
    >
      <form onSubmit={(e) => void onSubmit(e)} className="space-y-5">
        <ErrorBanner message={error} />
        {successMsg && (
          <div className="rounded-2xl bg-emerald-50/90 border border-emerald-200 p-3.5 text-xs font-medium text-emerald-900 flex items-center gap-2">
            <AgriIcon name="check" className="h-4 w-4 text-emerald-700" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Email delivery metadata box */}
        <div className="rounded-2xl bg-[#f4f1eb] border border-stone-200/90 p-4 text-center">
          <p className="text-xs text-stone-500 font-medium">{t("checkEmailNotice")}</p>
          <p className="mt-1 font-mono font-bold text-stone-900 break-all text-sm">{email || "your registered email"}</p>
          <p className="mt-1.5 text-[11px] text-stone-500">{t("checkEmailSpam")}</p>
        </div>

        {/* 6-Digit Segmented OTP Input */}
        <div>
          <label className="block text-center font-mono text-xs font-semibold uppercase tracking-wider text-stone-700 mb-3">
            {t("otp")} (6 Digits)
          </label>
          <OtpBoxes value={otp} onChange={setOtp} />
        </div>

        <Button type="submit" size="lg" disabled={busy || otp.length < 6} loading={busy}>
          {busy ? "Verifying…" : t("verifyEmail")}
        </Button>

        {/* Resend Action */}
        <div className="pt-2 text-center">
          <button
            type="button"
            disabled={cooldown > 0 || resending}
            className={`font-mono text-xs font-medium transition-all px-3 py-2 rounded-xl inline-flex items-center gap-1.5 ${
              cooldown > 0 || resending
                ? "text-stone-400 bg-stone-100 cursor-not-allowed"
                : "text-forest-900 hover:bg-forest-50 hover:text-forest-700 cursor-pointer"
            }`}
            onClick={() => void onResend()}
          >
            <AgriIcon name="refresh" className={`h-3.5 w-3.5 ${resending ? "animate-spin" : ""}`} />
            <span>
              {resending
                ? "Sending code…"
                : cooldown > 0
                ? `${t("resendOtp")} (${cooldown}s)`
                : t("resendOtp")}
            </span>
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}

// Segmented 6-digit OTP input
function OtpBoxes({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function handleDigitChange(index: number, char: string) {
    const clean = char.replace(/\D/g, "");
    if (!clean) {
      const next = value.split("");
      next[index] = "";
      onChange(next.join(""));
      return;
    }

    if (clean.length > 1) {
      const pasted = clean.slice(0, 6);
      onChange(pasted);
      const nextIndex = Math.min(5, pasted.length);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const next = value.split("");
    while (next.length < 6) next.push("");
    next[index] = clean;
    const res = next.join("").slice(0, 6);
    onChange(res);

    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const digit = value[i] || "";
        return (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleDigitChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={(e) => {
              e.preventDefault();
              const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
              if (pasted) {
                onChange(pasted);
                const nextIndex = Math.min(5, pasted.length);
                inputRefs.current[nextIndex]?.focus();
              }
            }}
            className="h-13 w-11 sm:h-14 sm:w-12 rounded-xl border border-stone-300 bg-white text-center font-mono text-xl font-bold text-stone-900 shadow-2xs transition-colors hover:border-stone-400 focus:border-forest-700 focus:outline-hidden focus:ring-2 focus:ring-forest-700/15"
          />
        );
      })}
    </div>
  );
}

// =========================================================
// 5. FORGOT & RESET PASSWORD
// =========================================================
export function ForgotPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <AuthLayout
      title={t("forgot")}
      subtitle="Enter your email to receive recovery instructions"
    >
      {done ? (
        <div className="text-center py-6 space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200">
            <AgriIcon name="check" className="h-6 w-6" />
          </div>
          <p className="text-sm text-stone-700 font-medium">
            If an account exists for <span className="font-semibold text-stone-900">{email}</span>, a password reset link was sent.
          </p>
          <div className="pt-4">
            <Link to="/login" className="font-mono text-xs font-semibold text-forest-800 hover:text-forest-950 underline">
              Return to Login →
            </Link>
          </div>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setBusy(true);
            void AuthApi.forgot(email).then(() => {
              setDone(true);
              setBusy(false);
            });
          }}
          className="space-y-4"
        >
          <Field label={t("email")}>
            <Input
              type="email"
              required
              placeholder="farmer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Button type="submit" size="lg" loading={busy}>
            {busy ? "Sending link…" : t("sendReset")}
          </Button>
          <div className="text-center pt-2">
            <Link to="/login" className="font-mono text-xs font-medium text-stone-500 hover:text-stone-800">
              Cancel & Return to Login
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}

export function ResetPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const token = new URLSearchParams(window.location.search).get("token") || "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <AuthLayout
      title={t("newPassword")}
      subtitle="Choose a secure password for your farm profile"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          void AuthApi.reset(token, password)
            .then(() => nav("/login"))
            .catch((err) => setError(err instanceof Error ? err.message : "Failed"))
            .finally(() => setBusy(false));
        }}
        className="space-y-4"
      >
        <ErrorBanner message={error} />
        <Field label={t("newPassword")} hint="Min 8 characters">
          <Input
            type="password"
            required
            minLength={8}
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <Button type="submit" size="lg" loading={busy}>
          {busy ? "Saving…" : t("savePassword")}
        </Button>
      </form>
    </AuthLayout>
  );
}

// =========================================================
// 6. EDITORIAL AUTHENTICATION SHELL (ASYMMETRIC SPLIT LAYOUT)
// =========================================================
function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <div className="min-h-dvh flex flex-col lg:grid lg:grid-cols-12 bg-stone-100">
      {/* Left Column: Deep Agricultural Green Brand Showcase (Desktop) */}
      <div
        className="hidden lg:flex lg:col-span-5 bg-[#0d3221] text-emerald-50 p-10 xl:p-14 flex-col justify-between relative overflow-hidden agri-hero-banner"
        style={{ backgroundImage: `url(${AGRI_HERO_IMAGES.authPortal})` }}
      >
        <div className="agri-hero-overlay" />

        {/* Subtle background ambient mesh */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 h-96 w-96 rounded-full bg-leaf-500/10 blur-3xl pointer-events-none" />

        {/* Top Branding */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 border border-white/15 text-emerald-400 shadow-xs transition-transform duration-200 group-hover:scale-105">
              <AgriIcon name="leaf" className="h-6 w-6" />
            </div>
            <div>
              <span className="font-display text-xl font-bold tracking-tight text-white block leading-none">
                AgroFusion<span className="text-emerald-400">.ai</span>
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-300/80 mt-1 block">
                Agri-Intelligence Platform
              </span>
            </div>
          </Link>
        </div>

        {/* Center Editorial Statement */}
        <div className="relative z-10 space-y-6 my-auto py-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-950/60 px-3.5 py-1 text-xs font-mono font-medium text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Autonomous Agronomic Intelligence</span>
          </div>

          <h2 className="font-display text-3xl xl:text-4xl font-bold tracking-tight text-white text-balance leading-tight">
            Science-backed agricultural decisions for every crop stage.
          </h2>

          <p className="text-emerald-100/80 text-sm leading-relaxed text-pretty">
            Real-time multimodal disease diagnostics, soil texture calibration, and hydrological evapo-transpiration scheduling built directly for Indian agriculture.
          </p>

          <div className="space-y-3 pt-2 font-mono text-xs text-emerald-200/90">
            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300">
                <AgriIcon name="check" className="h-3.5 w-3.5" />
              </div>
              <span>ICAR & CIBRC Standardized Protocol Recommendations</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300">
                <AgriIcon name="check" className="h-3.5 w-3.5" />
              </div>
              <span>Hyperlocal 3-Day OpenWeather Precipitation Sync</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300">
                <AgriIcon name="check" className="h-3.5 w-3.5" />
              </div>
              <span>Strict Zero-Exposure Security & SMTP Authentication</span>
            </div>
          </div>
        </div>

        {/* Bottom Institutional Seal */}
        <div className="relative z-10 pt-6 border-t border-emerald-800/80 flex items-center justify-between text-xs text-emerald-300/70 font-mono">
          <span>AgroFusion AI • Platform</span>
          <span>Krishi Intelligence Engine</span>
        </div>
      </div>

      {/* Right Column: Authentication Form Canvas */}
      <div className="col-span-12 lg:col-span-7 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 min-h-dvh bg-gradient-to-b from-[#eaf6ee] via-[#f2faf5] to-[#e6f4ec]">
        {/* Mobile Header / Desktop Top Actions */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link to="/" className="lg:hidden inline-flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-900 text-emerald-400">
              <AgriIcon name="leaf" className="h-5 w-5" />
            </div>
            <span className="font-display font-bold text-stone-900 text-lg">AgroFusion<span className="text-forest-600">.ai</span></span>
          </Link>
          <div className="hidden lg:block">
            <Link to="/" className="inline-flex items-center gap-1.5 font-mono text-xs text-stone-500 hover:text-stone-900 transition-colors">
              <AgriIcon name="arrowLeft" className="h-3.5 w-3.5" />
              <span>Back to Overview</span>
            </Link>
          </div>

          {/* Language Switcher */}
          <div className="relative">
            <select
              aria-label={t("language")}
              className="appearance-none rounded-xl border border-stone-300 bg-white/90 px-3 py-1.5 pr-7 font-mono text-xs font-medium text-stone-800 transition-colors hover:border-forest-700 focus:outline-hidden cursor-pointer shadow-2xs"
              value={i18n.language.startsWith("hi") ? "hi" : "en"}
              onChange={(e) => {
                void i18n.changeLanguage(e.target.value);
                localStorage.setItem("lang", e.target.value);
              }}
            >
              <option value="en">EN • English</option>
              <option value="hi">HI • हिन्दी</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-stone-400">
              <AgriIcon name="chevronDown" className="h-3 w-3" />
            </div>
          </div>
        </div>

        {/* Center Form Card */}
        <div className="mx-auto w-full max-w-md my-auto py-6">
          <div className="mb-6">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-stone-950">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1.5 text-xs sm:text-sm text-stone-600 leading-relaxed text-pretty">
                {subtitle}
              </p>
            )}
          </div>

          <Card className="shadow-[0_4px_24px_rgba(20,83,45,0.06)] border-emerald-200/80 bg-white p-6 sm:p-8">
            {children}
          </Card>
        </div>

        {/* Footer info */}
        <div className="text-center pt-6 text-xs text-stone-500 font-mono">
          Protected by enterprise SMTP verification & TLS encryption.
        </div>
      </div>
    </div>
  );
}
