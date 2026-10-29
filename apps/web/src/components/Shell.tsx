import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../lib/auth";
import i18n from "../i18n";
import { AgriIcon } from "./ui";

export function Shell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#e1f3e7] via-[#ebf7f0] to-[#e4f4ea] text-stone-900 flex flex-col antialiased selection:bg-forest-100 selection:text-forest-900">
      {/* Institutional Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-emerald-200/80 bg-[#e3f4e8]/90 backdrop-blur-md transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-8 lg:px-12">
          {/* Brand & Editorial Title */}
          <div className="flex items-center gap-10">
            <NavLink to="/fields" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-forest-900 text-white shadow-xs transition-transform duration-200 group-hover:scale-105">
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
            </NavLink>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-2">
              <DesktopNavLink to="/fields" icon="sprout" label={t("myFields")} />
              <DesktopNavLink to="/scan" icon="scan" label={t("scan")} />
              <DesktopNavLink to="/history" icon="activity" label={t("history")} />
            </nav>
          </div>

          {/* Right Utilities */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="relative">
              <select
                aria-label={t("language")}
                className="appearance-none rounded-xl border border-stone-300/80 bg-white/80 px-3 py-1.5 pr-8 font-mono text-xs font-medium text-stone-800 transition-colors hover:border-forest-700 hover:bg-white focus:outline-hidden focus:ring-2 focus:ring-forest-700/15 cursor-pointer"
                value={i18n.language.startsWith("hi") ? "hi" : "en"}
                onChange={(e) => {
                  void i18n.changeLanguage(e.target.value);
                  localStorage.setItem("lang", e.target.value);
                }}
              >
                <option value="en">EN • English</option>
                <option value="hi">HI • हिन्दी</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-stone-400">
                <AgriIcon name="chevronDown" className="h-3 w-3" />
              </div>
            </div>

            {/* Admin Console Link */}
            {user?.role === "ADMIN" && (
              <NavLink
                to="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-amber-300/80 bg-amber-50/80 px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-amber-900 transition-colors hover:bg-amber-100"
              >
                <AgriIcon name="database" className="h-3.5 w-3.5 text-amber-700" />
                {t("admin")}
              </NavLink>
            )}

            {/* User Profile Pill */}
            {user && (
              <div className="hidden lg:flex items-center gap-2 rounded-xl border border-stone-200/80 bg-white/60 px-3 py-1 text-xs text-stone-800 shadow-2xs">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-forest-100 text-forest-800 font-mono font-bold text-[10px]">
                  {user.name ? user.name.charAt(0).toUpperCase() : "F"}
                </span>
                <span className="font-medium max-w-[130px] truncate">{user.name || user.email}</span>
              </div>
            )}

            {/* Logout Button */}
            <button
              type="button"
              aria-label={t("logout")}
              title={t("logout")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-2xs transition-colors hover:border-stone-400 hover:bg-stone-50 hover:text-stone-950 active:bg-stone-100 cursor-pointer"
              onClick={() => void logout()}
            >
              <AgriIcon name="logout" className="h-3.5 w-3.5 text-stone-600" />
              <span className="hidden sm:inline">{t("logout")}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Spacious Canvas Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 lg:px-12 pb-28 md:pb-16">
        {children}
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-emerald-200/90 bg-[#eaf6ee]/95 backdrop-blur-md px-4 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="mx-auto flex max-w-md items-center justify-around">
          <MobileTab to="/fields" icon="sprout" label={t("myFields")} />
          <MobileTab to="/scan" icon="scan" label={t("scan")} />
          <MobileTab to="/history" icon="activity" label={t("history")} />
          {user?.role === "ADMIN" && (
            <MobileTab to="/admin" icon="database" label={t("admin")} />
          )}
        </div>
      </nav>
    </div>
  );
}

function DesktopNavLink({
  to,
  icon,
  label,
}: {
  to: string;
  icon: "sprout" | "scan" | "activity";
  label: string;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `inline-flex items-center gap-2 rounded-xl px-4 py-2 font-medium text-sm transition-all duration-150 ${
          isActive
            ? "bg-[#0d3221] text-white shadow-xs"
            : "text-stone-700 hover:bg-emerald-100/70 hover:text-stone-950"
        }`
      }
    >
      <AgriIcon name={icon} className="h-4 w-4" />
      {label}
    </NavLink>
  );
}

function MobileTab({
  to,
  icon,
  label,
}: {
  to: string;
  icon: "sprout" | "scan" | "activity" | "database";
  label: string;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-medium transition-colors ${
          isActive ? "text-forest-900 font-semibold" : "text-stone-500 hover:text-stone-800"
        }`
      }
    >
      <div
        className={`rounded-full p-1.5 transition-colors ${
          to === window.location.pathname ? "bg-forest-100 text-forest-800" : ""
        }`}
      >
        <AgriIcon name={icon} className="h-5 w-5" />
      </div>
      <span>{label}</span>
    </NavLink>
  );
}

export function OfflineBanner() {
  const { t } = useTranslation();
  if (navigator.onLine) return null;
  return (
    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-300 bg-amber-50/90 p-4 font-mono text-xs font-medium text-amber-950 shadow-xs">
      <AgriIcon name="alertTriangle" className="h-4 w-4 shrink-0 text-amber-700" />
      <span>{t("offline")}</span>
    </div>
  );
}
