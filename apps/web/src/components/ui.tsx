import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

// ==========================================
// 1. UNIFIED AGRICULTURAL & SAAS SVG ICONS
// ==========================================
export type AgriIconName =
  | "leaf"
  | "sprout"
  | "droplet"
  | "sun"
  | "cloudRain"
  | "camera"
  | "scan"
  | "shieldCheck"
  | "alertTriangle"
  | "activity"
  | "mapPin"
  | "layers"
  | "check"
  | "x"
  | "thumbsUp"
  | "thumbsDown"
  | "logout"
  | "user"
  | "settings"
  | "arrowRight"
  | "arrowLeft"
  | "chevronDown"
  | "plus"
  | "trash"
  | "search"
  | "refresh"
  | "externalLink"
  | "calendar"
  | "trendingUp"
  | "database"
  | "cloudSun"
  | "sparkles"
  | "info";

export function AgriIcon({
  name,
  className = "w-5 h-5",
}: {
  name: AgriIconName;
  className?: string;
}) {
  switch (name) {
    case "leaf":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 20A7 7 0 014 13C4 7 8 3 19 3c.5 4-1 10-6 13.5M11 20c1.5-3 4-6 8-7m-8 7l-2 2" />
        </svg>
      );
    case "sprout":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-7m0 0a5 5 0 005-5c0-3-2.5-4-5-4s-5 1-5 4a5 5 0 005 5zm0 0a5 5 0 01-5 5m5-5a5 5 0 005 5" />
        </svg>
      );
    case "droplet":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
        </svg>
      );
    case "sun":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <circle cx="12" cy="12" r="4" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41m14.14-14.14l-1.41 1.41" />
        </svg>
      );
    case "cloudRain":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 13v6m-4-4v6m-4-2v6M20 16.58A5 5 0 0018 7h-1.26A8 8 0 104 15.25" />
        </svg>
      );
    case "camera":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case "scan":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7V5a2 2 0 012-2h2m10 0h2a2 2 0 012 2v2m0 10v2a2 2 0 01-2 2h-2m-10 0H5a2 2 0 01-2-2v-2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 12h10" />
        </svg>
      );
    case "shieldCheck":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case "alertTriangle":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    case "activity":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case "mapPin":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case "layers":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      );
    case "check":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      );
    case "x":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    case "thumbsUp":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
      );
    case "thumbsDown":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
        </svg>
      );
    case "logout":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      );
    case "user":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    case "settings":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case "arrowRight":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      );
    case "arrowLeft":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      );
    case "chevronDown":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      );
    case "plus":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      );
    case "trash":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      );
    case "search":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      );
    case "refresh":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      );
    case "externalLink":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      );
    case "calendar":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case "trendingUp":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    case "database":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      );
    case "cloudSun":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    case "sparkles":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.286L13 21l-2.286-6.857L5 12l5.714-2.286L13 3z" />
        </svg>
      );
    case "info":
    default:
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
}

// ==========================================
// 2. EDITORIAL PRIMITIVES (ANNAM.AI INSPIRED)
// ==========================================

export function SectionHeader({
  badge,
  title,
  subtitle,
  action,
  className = "",
}: {
  badge?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200/80 pb-6 ${className}`}>
      <div className="max-w-3xl">
        {badge && (
          <div className="mb-2.5 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-forest-700" />
            <span className="font-mono text-xs font-medium uppercase tracking-widest text-forest-800">
              {badge}
            </span>
          </div>
        )}
        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-stone-900 text-balance">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-sm sm:text-base text-stone-600 font-normal leading-relaxed text-pretty">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0 self-start sm:self-end">{action}</div>}
    </div>
  );
}

export function MetricDisplay({
  value,
  unit,
  label,
  delta,
  trend = "neutral",
}: {
  value: ReactNode;
  unit?: string;
  label: string;
  delta?: string;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <div className="p-1">
      <div className="flex items-baseline gap-1.5">
        <span className="font-mono text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-stone-900">
          {value}
        </span>
        {unit && <span className="font-mono text-sm sm:text-base font-normal text-stone-500">{unit}</span>}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="font-mono text-xs uppercase tracking-wider text-stone-500 font-medium">{label}</span>
        {delta && (
          <span
            className={`font-mono text-xs font-semibold px-2 py-0.5 rounded-md ${
              trend === "up"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                : trend === "down"
                ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                : "bg-stone-100 text-stone-700 border border-stone-200/60"
            }`}
          >
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}

export function EditorialBadge({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-stone-200/90 bg-[#f4f1eb] px-3 py-1 font-mono text-xs font-medium uppercase tracking-wider text-forest-900 ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-forest-600" />
      {children}
    </span>
  );
}

// ==========================================
// 3. EDITORIAL CARDS & CONTAINERS
// ==========================================
export function Card({
  children,
  className = "",
  hover = false,
  variant = "default",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  variant?: "default" | "tinted" | "forest" | "glass";
  onClick?: () => void;
}) {
  const variantStyles = {
    default: "border-emerald-200/70 bg-white/95 text-stone-900 shadow-[0_2px_12px_rgba(20,83,45,0.04)]",
    tinted: "border-emerald-200/90 bg-[#edf8f1]/90 text-stone-900 shadow-[0_2px_10px_rgba(20,83,45,0.03)]",
    forest: "border-forest-800 bg-[#0d3221] text-emerald-50 shadow-[0_8px_24px_rgba(7,31,20,0.25)]",
    glass: "border-emerald-200/60 bg-white/80 backdrop-blur-md text-stone-900 shadow-[0_4px_20px_rgba(20,83,45,0.05)]",
  }[variant];

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl sm:rounded-3xl border p-6 sm:p-8 transition-all duration-200 ${variantStyles} ${
        hover
          ? "hover:border-forest-700/50 hover:shadow-[0_12px_32px_rgba(13,50,33,0.09)] hover:-translate-y-0.5 cursor-pointer"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  unit,
  icon,
  delta,
  trend = "neutral",
  description,
  className = "",
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  icon?: AgriIconName;
  delta?: string;
  trend?: "up" | "down" | "neutral";
  description?: string;
  className?: string;
}) {
  return (
    <Card className={`p-5 sm:p-6 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs uppercase tracking-wider text-stone-500 font-medium truncate">
          {label}
        </span>
        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-50 text-forest-700 border border-forest-100 shrink-0">
            <AgriIcon name={icon} className="h-4.5 w-4.5" />
          </div>
        )}
      </div>
      <div className="mt-2.5 flex items-baseline gap-1.5">
        <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-stone-950">
          {value}
        </span>
        {unit && <span className="font-mono text-xs sm:text-sm text-stone-500 font-normal">{unit}</span>}
      </div>
      {(delta || description) && (
        <div className="mt-2.5 flex items-center justify-between gap-2 text-xs">
          {description && <span className="text-stone-500 truncate">{description}</span>}
          {delta && (
            <span
              className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                trend === "up"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                  : trend === "down"
                  ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                  : "bg-stone-100 text-stone-700 border border-stone-200/60"
              }`}
            >
              {delta}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className = "",
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-4 flex items-start justify-between gap-4 border-b border-stone-100 pb-3 ${className}`}>
      <div>
        <h3 className="font-display text-lg sm:text-xl font-semibold text-stone-900 tracking-tight">{title}</h3>
        {subtitle && <p className="mt-1 text-xs sm:text-sm text-stone-500 font-normal leading-relaxed">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ==========================================
// 4. MODERN BUTTONS & ACTIONS
// ==========================================
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "success"
  | "heroPrimary"
  | "heroOutline"
  | "white";

export type ButtonSize = "sm" | "md" | "lg";

function resolveButtonClasses(
  baseStyles: string,
  sizeStyles: string,
  variantClasses: string,
  widthStyle: string,
  userClassName: string,
): string {
  // If caller overrides background, text, or border color, remove defaults to prevent conflicts
  const hasCustomBg = /(?:^|\s)bg-(?!gradient)[^\s]+/.test(userClassName);
  const hasCustomText = /(?:^|\s)text-(?!xs|sm|base|lg|xl|center|left|right)[^\s]+/.test(userClassName);
  const hasCustomBorder = /(?:^|\s)border-(?!none|hidden|\d)[^\s]+/.test(userClassName);

  let filteredVariant = variantClasses;
  if (hasCustomBg) {
    filteredVariant = filteredVariant.replace(/(?:^|\s)bg-(?!gradient)[^\s]+/g, " ");
  }
  if (hasCustomText) {
    filteredVariant = filteredVariant.replace(/(?:^|\s)text-(?!xs|sm|base|lg|xl|center|left|right)[^\s]+/g, " ");
  }
  if (hasCustomBorder) {
    filteredVariant = filteredVariant.replace(/(?:^|\s)border-(?!none|hidden|\d)[^\s]+/g, " ");
  }

  return `${baseStyles} ${sizeStyles} ${filteredVariant.trim()} ${widthStyle} ${userClassName}`
    .replace(/\s+/g, " ")
    .trim();
}

export function Button({
  children,
  onClick,
  type = "button",
  disabled,
  loading = false,
  variant = "primary",
  size = "md",
  icon,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: AgriIconName;
  className?: string;
}) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium tracking-wide transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none";

  const sizeStyles =
    size === "sm"
      ? "px-3.5 py-2 text-xs"
      : size === "lg"
      ? "px-6 py-3.5 text-base font-semibold"
      : "px-5 py-2.5 text-sm";

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      "bg-forest-900 text-white border border-forest-900 shadow-xs hover:bg-forest-800 hover:border-forest-800 active:bg-forest-950 focus-visible:ring-forest-700",
    secondary:
      "bg-[#f4f1eb] text-forest-950 border border-stone-200/90 hover:bg-[#ede9e1] hover:border-stone-300 active:bg-[#e3ded4]",
    outline:
      "border border-stone-300 bg-white text-stone-800 hover:bg-stone-50 hover:border-forest-700 hover:text-stone-900",
    ghost:
      "border border-transparent bg-transparent text-stone-700 hover:bg-stone-100 hover:text-stone-900",
    heroPrimary:
      "bg-emerald-500 text-emerald-950 border border-emerald-400 font-bold shadow-lg hover:bg-emerald-400 active:bg-emerald-600 focus-visible:ring-emerald-400",
    heroOutline:
      "bg-white/10 text-white border border-white/35 font-semibold backdrop-blur-md shadow-xs hover:bg-white/20 hover:border-white/60 active:bg-white/25 focus-visible:ring-white/50",
    white:
      "bg-white text-forest-950 border border-stone-200 font-semibold shadow-xs hover:bg-emerald-50 hover:border-emerald-300 active:bg-emerald-100",
    danger:
      "bg-rose-700 text-white border border-rose-700 shadow-xs hover:bg-rose-800 active:bg-rose-900 focus-visible:ring-rose-700",
    success:
      "bg-forest-700 text-white border border-forest-700 shadow-xs hover:bg-forest-800 active:bg-forest-900 focus-visible:ring-forest-700",
  };

  const widthStyle = className.includes("w-") ? "" : "w-full";
  const computedClassName = resolveButtonClasses(
    baseStyles,
    sizeStyles,
    variantStyles[variant] ?? variantStyles.primary,
    widthStyle,
    className,
  );

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={computedClassName}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : icon ? (
        <AgriIcon name={icon} className="h-4 w-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
}

// ==========================================
// 5. STANDARDIZED STATUS BADGES
// ==========================================
export type StatusBadgeVariant = "healthy" | "attention" | "critical" | "info" | "neutral" | "verified";

export function StatusBadge({
  label,
  variant = "neutral",
  size = "md",
}: {
  label: ReactNode;
  variant?: StatusBadgeVariant;
  size?: "sm" | "md";
}) {
  const styles = {
    healthy: "bg-emerald-50 text-emerald-900 border-emerald-200/80",
    attention: "bg-amber-50 text-amber-900 border-amber-200/80",
    critical: "bg-rose-50 text-rose-900 border-rose-200/80",
    info: "bg-sky-50 text-sky-900 border-sky-200/80",
    neutral: "bg-[#f4f1eb] text-stone-800 border-stone-200",
    verified: "bg-forest-50 text-forest-900 border-forest-100",
  }[variant];

  const dotColor = {
    healthy: "bg-emerald-600",
    attention: "bg-amber-600",
    critical: "bg-rose-600",
    info: "bg-sky-600",
    neutral: "bg-stone-500",
    verified: "bg-forest-700",
  }[variant];

  const pad = size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-mono font-medium uppercase tracking-wider ${styles} ${pad}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      {label}
    </span>
  );
}

// ==========================================
// 6. FORM CONTROLS & FIELDS
// ==========================================
export function Field({
  label,
  hint,
  children,
  error,
  required,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  error?: string;
  required?: boolean;
}) {
  return (
    <label className="mb-4 block">
      <div className="flex items-center justify-between font-mono text-xs font-medium text-stone-700 uppercase tracking-wider mb-2">
        <span>
          {label} {required && <span className="text-rose-600">*</span>}
        </span>
        {hint && <span className="text-[11px] font-normal normal-case text-stone-400">{hint}</span>}
      </div>
      <div>{children}</div>
      {error && <p className="mt-1.5 text-xs text-rose-600 font-medium">{error}</p>}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 transition-colors placeholder:text-stone-400 hover:border-stone-400 focus:border-forest-700 focus:outline-hidden focus:ring-2 focus:ring-forest-700/15 disabled:bg-stone-50 disabled:text-stone-400 ${
        props.className ?? ""
      }`}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative w-full">
      <select
        {...props}
        className={`w-full appearance-none rounded-xl border border-stone-300 bg-white px-4 py-3 pr-10 text-sm text-stone-900 transition-colors hover:border-stone-400 focus:border-forest-700 focus:outline-hidden focus:ring-2 focus:ring-forest-700/15 disabled:bg-stone-50 disabled:text-stone-400 cursor-pointer ${
          props.className ?? ""
        }`}
      />
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400">
        <AgriIcon name="chevronDown" className="h-4 w-4" />
      </div>
    </div>
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 transition-colors placeholder:text-stone-400 hover:border-stone-400 focus:border-forest-700 focus:outline-hidden focus:ring-2 focus:ring-forest-700/15 disabled:bg-stone-50 disabled:text-stone-400 ${
        props.className ?? ""
      }`}
    />
  );
}

// ==========================================
// 7. ALERTS & BANNERS
// ==========================================
export function ErrorBanner({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-900">
      <AgriIcon name="alertTriangle" className="h-5 w-5 shrink-0 text-rose-700 mt-0.5" />
      <div className="flex-1 leading-relaxed font-medium">{message}</div>
    </div>
  );
}

export function AlertBanner({
  type = "info",
  title,
  message,
}: {
  type?: "info" | "warning" | "error" | "success";
  title?: string;
  message: ReactNode;
}) {
  const configs = {
    info: {
      bg: "bg-sky-50/90 border-sky-200 text-sky-950",
      icon: "info" as const,
      iconColor: "text-sky-700",
    },
    warning: {
      bg: "bg-amber-50/90 border-amber-200 text-amber-950",
      icon: "alertTriangle" as const,
      iconColor: "text-amber-700",
    },
    error: {
      bg: "bg-rose-50/90 border-rose-200 text-rose-950",
      icon: "alertTriangle" as const,
      iconColor: "text-rose-700",
    },
    success: {
      bg: "bg-emerald-50/90 border-emerald-200 text-emerald-950",
      icon: "shieldCheck" as const,
      iconColor: "text-emerald-700",
    },
  }[type];

  return (
    <div className={`mb-6 flex items-start gap-3.5 rounded-2xl border p-4 text-sm ${configs.bg}`}>
      <AgriIcon name={configs.icon} className={`h-5 w-5 shrink-0 mt-0.5 ${configs.iconColor}`} />
      <div className="flex-1">
        {title && <p className="font-semibold text-stone-900">{title}</p>}
        <div className="mt-0.5 text-stone-700 text-xs sm:text-sm leading-relaxed">{message}</div>
      </div>
    </div>
  );
}

// ==========================================
// 8. EMPTY STATE & SKELETON LOADERS
// ==========================================
export function EmptyState({
  icon = "sprout",
  title,
  description,
  action,
}: {
  icon?: AgriIconName;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-stone-300/80 bg-white/70 p-10 text-center sm:p-16">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f4f1eb] text-forest-800 shadow-xs border border-stone-200">
        <AgriIcon name={icon} className="h-8 w-8" />
      </div>
      <h3 className="mt-5 font-display text-lg sm:text-xl font-semibold text-stone-900">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-stone-500 max-w-md mx-auto leading-relaxed text-pretty">
          {description}
        </p>
      )}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="animate-shimmer rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-xs">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="h-6 w-40 rounded-lg bg-stone-200" />
          <div className="h-4 w-28 rounded-md bg-stone-100" />
        </div>
        <div className="h-7 w-20 rounded-full bg-stone-200" />
      </div>
      <div className="mt-6 h-3 w-48 rounded-md bg-stone-100" />
    </div>
  );
}

export function Spinner({ label = "Processing…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3.5 p-16 text-stone-600">
      <span className="h-8 w-8 animate-spin rounded-full border-3 border-forest-800 border-t-transparent shadow-xs" />
      <span className="font-mono text-xs font-medium tracking-widest text-stone-500 uppercase">{label}</span>
    </div>
  );
}
