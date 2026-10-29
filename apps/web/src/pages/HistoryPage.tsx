import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { HistoryApi } from "../lib/api";
import { AgriIcon, type AgriIconName, Card, EmptyState, SkeletonCard, StatusBadge } from "../components/ui";
import { AGRI_HERO_IMAGES } from "../lib/agronomyAssets";

export function HistoryPage() {
  const [sp, setSp] = useSearchParams();
  const type = sp.get("type") || "";
  const fieldId = sp.get("fieldId") || "";
  const qs = `?${new URLSearchParams({ ...(type ? { type } : {}), ...(fieldId ? { fieldId } : {}) }).toString()}`;
  const q = useQuery({ queryKey: ["history", qs], queryFn: () => HistoryApi.list(qs === "?" ? "" : qs) });

  function setFilterType(newType: string) {
    const next = new URLSearchParams(sp);
    if (newType) next.set("type", newType);
    else next.delete("type");
    setSp(next);
  }

  function clearFieldFilter() {
    const next = new URLSearchParams(sp);
    next.delete("fieldId");
    setSp(next);
  }

  if (q.isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-6">
        <div className="h-48 rounded-3xl bg-emerald-950/20 animate-shimmer" />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  const items = (q.data as { id: string; type: string; createdAt: string; summary: string }[] | undefined) ?? [];

  const filterTabs = [
    { key: "", label: "All Activity" },
    { key: "disease", label: "Disease Scans", icon: "camera" as AgriIconName },
    { key: "irrigation", label: "Irrigation Logs", icon: "droplet" as AgriIconName },
    { key: "suitability", label: "Suitability Checks", icon: "sprout" as AgriIconName },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-2 animate-fade-in">
      {/* Top Banner with Agricultural Agronomist Imagery */}
      <section
        className="agri-hero-banner relative rounded-3xl overflow-hidden shadow-xl border border-forest-800/40 text-white"
        style={{ backgroundImage: `url(${AGRI_HERO_IMAGES.authPortal})` }}
      >
        <div className="agri-hero-overlay" />

        <div className="relative z-10 p-6 sm:p-10 space-y-3">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-mono font-medium backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Immutable Diagnostic Stream
          </span>

          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white drop-shadow-sm">
            Activity & Compliance History
          </h1>

          <p className="text-emerald-100/90 text-sm leading-relaxed font-sans max-w-xl">
            Chronological audit log of automated leaf pathogen scans, precision irrigation calculations, and agronomic suitability records across holdings.
          </p>
        </div>
      </section>

      {/* Field Filter Indicator if present */}
      {fieldId && (
        <div className="flex items-center justify-between rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs shadow-xs">
          <div className="flex items-center gap-2 text-forest-950 font-medium">
            <AgriIcon name="mapPin" className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Showing records filtered by specific field holding</span>
          </div>
          <button
            type="button"
            onClick={clearFieldFilter}
            className="text-emerald-700 font-bold hover:text-emerald-900 underline cursor-pointer"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {filterTabs.map((tab) => {
          const isActive = type === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilterType(tab.key)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 font-mono text-xs font-semibold transition-all duration-150 cursor-pointer ${
                isActive
                  ? "bg-forest-900 text-white shadow-sm"
                  : "bg-white border border-emerald-200 text-forest-800 hover:border-emerald-500 hover:bg-emerald-50 shadow-2xs"
              }`}
            >
              {tab.icon && <AgriIcon name={tab.icon} className="h-3.5 w-3.5" />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Timeline Activity Feed */}
      {items.length === 0 ? (
        <EmptyState
          icon="activity"
          title="No activity history found"
          description="Assessments, disease diagnostic scans, and irrigation calculations will automatically populate here."
        />
      ) : (
        <div className="space-y-3.5">
          {items.map((item) => {
            const isDisease = item.type.toLowerCase().includes("disease");
            const isIrrigation = item.type.toLowerCase().includes("irrigation");
            const isSuitability = item.type.toLowerCase().includes("suitability");

            const iconName: AgriIconName = isDisease
              ? "camera"
              : isIrrigation
              ? "droplet"
              : isSuitability
              ? "sprout"
              : "activity";

            const iconColor = isDisease
              ? "bg-rose-50 text-rose-700 border-rose-200"
              : isIrrigation
              ? "bg-sky-50 text-sky-700 border-sky-200"
              : isSuitability
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-emerald-50 text-emerald-800 border-emerald-200";

            const badgeColor = isDisease
              ? "bg-rose-50 text-rose-800 border-rose-200"
              : isIrrigation
              ? "bg-sky-50 text-sky-800 border-sky-200"
              : isSuitability
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-emerald-50 text-emerald-800 border-emerald-200";

            return (
              <div
                key={`${item.type}-${item.id}`}
                className="group rounded-3xl border border-emerald-200 bg-white p-5 shadow-xs hover:shadow-md transition-all duration-200 flex items-start gap-4"
              >
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${iconColor} shadow-2xs`}>
                  <AgriIcon name={iconName} className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <span className={`font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                      {item.type.replace(/_/g, " ")}
                    </span>
                    <span className="font-mono text-xs text-forest-600">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-forest-950 leading-relaxed text-pretty">
                    {item.summary}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
