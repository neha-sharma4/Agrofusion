import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FieldsApi } from "../../lib/api";
import {
  AgriIcon,
  Button,
  Card,
  EditorialBadge,
  EmptyState,
  SkeletonCard,
  StatusBadge,
} from "../../components/ui";
import { OfflineBanner } from "../../components/Shell";
import { AGRI_HERO_IMAGES, getCropImageUrl } from "../../lib/agronomyAssets";

export function FieldsPage() {
  const { t } = useTranslation();
  const q = useQuery({ queryKey: ["fields"], queryFn: FieldsApi.list });

  if (q.isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-48 rounded-3xl bg-emerald-950/20 animate-shimmer" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const fields = q.data ?? [];
  const activeCyclesCount = fields.filter((f) => Boolean(f.activeCycle)).length;
  const uniqueCrops = Array.from(
    new Set(fields.map((f) => f.activeCycle?.crop.name).filter(Boolean)),
  );
  const primaryField = fields[0];

  return (
    <div className="space-y-10 animate-fade-in">
      <OfflineBanner />

      {/* Top Agricultural Command Center Hero */}
      <section
        className="agri-hero-banner relative rounded-3xl overflow-hidden shadow-xl border border-forest-800/40 text-white"
        style={{ backgroundImage: `url(${AGRI_HERO_IMAGES.fieldsDashboard})` }}
      >
        <div className="agri-hero-overlay" />

        <div className="relative z-10 p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-mono font-medium backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Autonomous Farm Monitoring
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-100 text-xs font-mono backdrop-blur-md">
                <AgriIcon name="cloudSun" className="h-3 w-3 text-emerald-300" />
                Live Telemetry
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white drop-shadow-sm">
              Field Intelligence & Crop Status
            </h1>

            <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed font-sans max-w-xl">
              Live agronomic telemetry, AI leaf pathology diagnostics, and weather-adjusted irrigation schedules across your registered holdings.
            </p>

            {/* Protocol badges */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-mono text-emerald-200/80">
              <span className="flex items-center gap-1.5">
                <AgriIcon name="shieldCheck" className="h-3.5 w-3.5 text-emerald-400" />
                ICAR CIBRC Protocols
              </span>
              <span className="text-emerald-500/50">•</span>
              <span className="flex items-center gap-1.5">
                <AgriIcon name="sparkles" className="h-3.5 w-3.5 text-emerald-400" />
                Gemini 2.5 Vision Diagnostics
              </span>
              <span className="text-emerald-500/50">•</span>
              <span className="flex items-center gap-1.5">
                <AgriIcon name="droplet" className="h-3.5 w-3.5 text-emerald-400" />
                Evapotranspiration Modeling
              </span>
            </div>
          </div>

          {/* Call to action */}
          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
            <Link to="/fields/new">
              <Button
                variant="heroPrimary"
                size="lg"
                icon="plus"
                className="w-full shadow-lg"
              >
                {t("addField")}
              </Button>
            </Link>
            <Link to="/scan">
              <Button
                variant="heroOutline"
                size="md"
                icon="camera"
                className="w-full"
              >
                Instant Disease Scan
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Connected Agricultural Monitoring Telemetry Strip */}
      {fields.length > 0 && (
        <div className="agri-telemetry-strip rounded-3xl p-4 sm:p-6 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-emerald-100">
          {/* Telemetry 1: Registered Holdings */}
          <div className="flex items-center gap-4 px-2 pt-2 sm:pt-0">
            <div className="h-12 w-12 rounded-2xl bg-emerald-100/80 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0 shadow-xs">
              <AgriIcon name="mapPin" className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-2xl sm:text-3xl font-bold text-forest-950">
                  {fields.length}
                </span>
                <span className="font-mono text-xs text-forest-600 font-medium">Plots</span>
              </div>
              <p className="font-mono text-xs text-forest-700 tracking-wider uppercase font-semibold">
                Registered Holdings
              </p>
            </div>
          </div>

          {/* Telemetry 2: Active Growing Cycles */}
          <div className="flex items-center gap-4 px-2 sm:px-4 pt-2 sm:pt-0">
            <div className="h-12 w-12 rounded-2xl bg-leaf-100/80 border border-leaf-200 flex items-center justify-center text-leaf-800 shrink-0 shadow-xs">
              <AgriIcon name="sprout" className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-2xl sm:text-3xl font-bold text-forest-950">
                  {activeCyclesCount}
                </span>
                <span className="font-mono text-xs text-leaf-700 font-medium">Active</span>
              </div>
              <p className="font-mono text-xs text-forest-700 tracking-wider uppercase font-semibold">
                Growing Cycles
              </p>
            </div>
          </div>

          {/* Telemetry 3: Monitored Crop Varieties */}
          <div className="flex items-center gap-4 px-2 sm:px-4 pt-2 sm:pt-0">
            <div className="h-12 w-12 rounded-2xl bg-soil-100/80 border border-soil-200 flex items-center justify-center text-soil-700 shrink-0 shadow-xs">
              <AgriIcon name="layers" className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-2xl sm:text-3xl font-bold text-forest-950">
                  {uniqueCrops.length}
                </span>
                <span className="font-mono text-xs text-soil-600 font-medium">Species</span>
              </div>
              <p className="font-mono text-xs text-forest-700 tracking-wider uppercase font-semibold">
                Crop Varieties
              </p>
            </div>
          </div>

          {/* Telemetry 4: AI Diagnostic Engine */}
          <div className="flex items-center gap-4 px-2 sm:px-4 pt-2 sm:pt-0">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0 shadow-xs">
              <AgriIcon name="sparkles" className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-2xl sm:text-3xl font-bold text-emerald-700">
                  24/7
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse ml-1" />
              </div>
              <p className="font-mono text-xs text-forest-700 tracking-wider uppercase font-semibold">
                Vision Diagnostics
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Featured Primary Holding Spotlight */}
      {primaryField && (
        <section className="relative overflow-hidden rounded-3xl border border-emerald-200/90 bg-white shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left: Atmospheric Crop Photo with Overlay */}
            <div className="lg:col-span-5 relative min-h-[240px] lg:min-h-full agri-card-img-wrap">
              <img
                src={getCropImageUrl(primaryField.activeCycle?.crop.name)}
                alt={primaryField.name}
                className="agri-card-img absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/40 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-white/10" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="inline-block px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-md text-xs font-mono font-medium text-emerald-200 border border-white/10 mb-1">
                  Primary Holding
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white drop-shadow-md">
                  {primaryField.name}
                </h3>
              </div>
            </div>

            {/* Right: Comprehensive Agronomic Profile */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <EditorialBadge>Agricultural Profile</EditorialBadge>
                  <StatusBadge
                    label={primaryField.advisoryBadge}
                    variant={
                      primaryField.advisoryBadge.toLowerCase().includes("healthy")
                        ? "healthy"
                        : primaryField.advisoryBadge.toLowerCase().includes("critical")
                        ? "critical"
                        : "attention"
                    }
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="rounded-2xl bg-emerald-50/70 p-3.5 border border-emerald-100">
                    <span className="text-forest-600 uppercase tracking-wider block font-semibold">
                      Active Crop
                    </span>
                    <span className="font-bold text-forest-950 text-sm mt-0.5 block truncate">
                      {primaryField.activeCycle?.crop.name || "None active"}
                    </span>
                  </div>
                  <div className="rounded-2xl bg-soil-50/70 p-3.5 border border-soil-200/60">
                    <span className="text-soil-600 uppercase tracking-wider block font-semibold">
                      Soil Texture
                    </span>
                    <span className="font-bold text-stone-900 text-sm mt-0.5 block truncate">
                      {primaryField.activeCycle?.soil.name || "Unspecified"}
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-1 rounded-2xl bg-stone-50 p-3.5 border border-stone-200/70">
                    <span className="text-stone-500 uppercase tracking-wider block font-semibold">
                      Agro-Zone
                    </span>
                    <span className="font-bold text-stone-900 text-sm mt-0.5 block truncate">
                      {primaryField.activeCycle?.region.name || "Regional Zone"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link to={`/fields/${primaryField.id}`} className="flex-1">
                  <Button variant="primary" size="md" icon="arrowRight" className="w-full">
                    Open Field Cockpit
                  </Button>
                </Link>
                <Link to={`/fields/${primaryField.id}/scan`} className="flex-1">
                  <Button variant="outline" size="md" icon="camera" className="w-full">
                    Scan Leaf
                  </Button>
                </Link>
                <Link to={`/fields/${primaryField.id}/irrigation`} className="flex-1">
                  <Button variant="secondary" size="md" icon="droplet" className="w-full">
                    Irrigation Advisory
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Quick Jump Shortcuts Ribbon */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white/90 border border-emerald-200 p-4 shadow-xs">
        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-forest-800 px-1 flex items-center gap-1.5">
          <AgriIcon name="sparkles" className="h-3.5 w-3.5 text-emerald-600" />
          Field Shortcuts:
        </span>
        <Link
          to="/scan"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2 font-mono text-xs font-medium text-forest-900 hover:bg-emerald-100 transition-colors"
        >
          <AgriIcon name="camera" className="h-3.5 w-3.5 text-emerald-700" />
          <span>General Disease Scan</span>
        </Link>
        <Link
          to="/history"
          className="inline-flex items-center gap-2 rounded-xl bg-stone-50 border border-stone-200 px-3.5 py-2 font-mono text-xs font-medium text-stone-800 hover:bg-stone-100 transition-colors"
        >
          <AgriIcon name="activity" className="h-3.5 w-3.5 text-stone-600" />
          <span>Historical Audit Log</span>
        </Link>
        <Link
          to="/fields/new"
          className="inline-flex items-center gap-2 rounded-xl bg-forest-900 text-white px-3.5 py-2 font-mono text-xs font-medium hover:bg-forest-800 transition-colors ml-auto"
        >
          <AgriIcon name="plus" className="h-3.5 w-3.5" />
          <span>Register New Holding</span>
        </Link>
      </div>

      {/* All Fields Agricultural Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-forest-950 tracking-tight">
              All Monitored Holdings ({fields.length})
            </h3>
            <p className="text-xs font-mono text-forest-700 mt-0.5">
              Individual plot telemetry and active diagnostic modules
            </p>
          </div>
          <Link to="/fields/new">
            <Button size="sm" variant="outline" icon="plus">
              Add Field
            </Button>
          </Link>
        </div>

        {fields.length === 0 ? (
          <EmptyState
            icon="sprout"
            title={t("noFields")}
            description="Start precision farming by adding your first agricultural field with soil classification and regional crop recommendations."
            action={
              <Link to="/fields/new">
                <Button size="lg" icon="plus" className="w-auto shadow-sm">
                  {t("addField")}
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fields.map((f) => {
              const cropName = f.activeCycle?.crop.name || "Crop Field";
              const soilName = f.activeCycle?.soil.name || "Alluvial";
              const regionName = f.activeCycle?.region.name || "Agro-climatic zone";
              const cropImgUrl = getCropImageUrl(cropName);

              const badgeVariant =
                f.advisoryBadge.toLowerCase().includes("healthy") ||
                f.advisoryBadge.toLowerCase().includes("good")
                  ? "healthy"
                  : f.advisoryBadge.toLowerCase().includes("attention") ||
                    f.advisoryBadge.toLowerCase().includes("warning")
                  ? "attention"
                  : f.advisoryBadge.toLowerCase().includes("critical") ||
                    f.advisoryBadge.toLowerCase().includes("danger")
                  ? "critical"
                  : "neutral";

              return (
                <div
                  key={f.id}
                  className="group rounded-3xl bg-white border border-emerald-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Top: Crop Photography Header with Status Badge */}
                  <div className="relative h-44 agri-card-img-wrap">
                    <img
                      src={cropImgUrl}
                      alt={cropName}
                      className="agri-card-img absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest-950/85 via-forest-950/30 to-transparent" />

                    {/* Status Badge in Header */}
                    <div className="absolute top-3.5 right-3.5">
                      <StatusBadge label={f.advisoryBadge} variant={badgeVariant} size="sm" />
                    </div>

                    {/* Crop Tag Pill */}
                    <div className="absolute top-3.5 left-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 text-emerald-200 border border-white/20 text-xs font-mono backdrop-blur-md">
                        <AgriIcon name="sprout" className="h-3 w-3 text-emerald-400" />
                        {cropName}
                      </span>
                    </div>

                    {/* Field Name & Location on Bottom of Image */}
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <Link
                        to={`/fields/${f.id}`}
                        className="block font-display text-lg font-bold text-white hover:text-emerald-300 transition-colors truncate"
                      >
                        {f.name}
                      </Link>
                      <p className="font-mono text-xs text-emerald-200/80 flex items-center gap-1.5 truncate mt-0.5">
                        <AgriIcon name="mapPin" className="h-3 w-3 text-emerald-400 shrink-0" />
                        <span>{regionName}</span>
                      </p>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    {/* Metadata Strip */}
                    <div className="grid grid-cols-2 gap-2.5 rounded-2xl bg-emerald-50/60 p-3.5 border border-emerald-100 font-mono text-xs">
                      <div>
                        <span className="text-forest-600 block uppercase font-semibold text-[10px] tracking-wider">
                          Crop Variety
                        </span>
                        <span className="font-bold text-forest-950 truncate block mt-0.5">
                          {cropName}
                        </span>
                      </div>
                      <div>
                        <span className="text-forest-600 block uppercase font-semibold text-[10px] tracking-wider">
                          Soil Classification
                        </span>
                        <span className="font-bold text-forest-950 truncate block mt-0.5">
                          {soilName}
                        </span>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="space-y-2 pt-2 border-t border-emerald-100">
                      <Link to={`/fields/${f.id}`} className="block">
                        <Button
                          variant="primary"
                          size="sm"
                          icon="arrowRight"
                          className="w-full text-xs font-bold"
                        >
                          Open Field Cockpit
                        </Button>
                      </Link>

                      <div className="grid grid-cols-2 gap-2">
                        <Link to={`/fields/${f.id}/scan`}>
                          <Button
                            variant="outline"
                            size="sm"
                            icon="camera"
                            className="w-full text-xs"
                          >
                            Scan Leaf
                          </Button>
                        </Link>
                        <Link to={`/fields/${f.id}/irrigation`}>
                          <Button
                            variant="secondary"
                            size="sm"
                            icon="droplet"
                            className="w-full text-xs"
                          >
                            Irrigation
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
