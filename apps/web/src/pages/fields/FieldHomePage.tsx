import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FieldsApi } from "../../lib/api";
import {
  AgriIcon,
  Button,
  Card,
  EditorialBadge,
  SkeletonCard,
  StatusBadge,
} from "../../components/ui";
import { AGRI_HERO_IMAGES, getCropImageUrl, getSoilImageUrl } from "../../lib/agronomyAssets";

export function FieldHomePage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const q = useQuery({ queryKey: ["field", id], queryFn: () => FieldsApi.get(id!) });

  if (q.isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-6 w-32 rounded bg-stone-200 animate-shimmer" />
        <div className="h-48 rounded-3xl bg-emerald-950/20 animate-shimmer" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (!q.data) {
    return (
      <div className="text-center py-16 bg-white/80 rounded-3xl border border-emerald-200 p-8">
        <p className="text-forest-900 font-medium">Field profile not found.</p>
        <div className="mt-6">
          <Link to="/fields">
            <Button variant="outline" className="w-auto">
              ← Return to Fields Overview
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const cycle = q.data.activeCycle;
  const cropName = cycle?.crop.name;
  const soilName = cycle?.soil.name;
  const regionName = cycle?.region.name || "Agro-climatic zone";
  const heroImgUrl = cropName ? getCropImageUrl(cropName) : AGRI_HERO_IMAGES.fieldCockpit;

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 font-mono text-xs font-medium text-forest-800">
        <Link to="/fields" className="hover:text-forest-950 flex items-center gap-1 transition-colors">
          <AgriIcon name="arrowLeft" className="h-3.5 w-3.5 text-forest-600" />
          <span>{t("myFields")}</span>
        </Link>
        <span className="text-forest-400">/</span>
        <span className="text-forest-950 font-bold truncate max-w-xs">{q.data.name}</span>
      </div>

      {/* Field Profile Hero Section with Photographic Backdrop */}
      <section
        className="agri-hero-banner relative rounded-3xl overflow-hidden shadow-xl border border-forest-800/40 text-white"
        style={{ backgroundImage: `url(${heroImgUrl})` }}
      >
        <div className="agri-hero-overlay" />

        <div className="relative z-10 p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-mono font-medium backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Field Cockpit
              </span>
              <StatusBadge
                label={cycle ? "Crop Active" : "Fallow / Ready for Planting"}
                variant={cycle ? "healthy" : "neutral"}
                size="sm"
              />
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white drop-shadow-sm">
              {q.data.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-emerald-200/90 pt-1">
              <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-lg border border-white/10 backdrop-blur-sm">
                <AgriIcon name="mapPin" className="h-3.5 w-3.5 text-emerald-400" />
                <span>{regionName}</span>
              </span>
              <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-lg border border-white/10 backdrop-blur-sm">
                <AgriIcon name="cloudSun" className="h-3.5 w-3.5 text-emerald-400" />
                <span>GPS Telemetry Station</span>
              </span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
            <Link to={`/fields/${id}/new-cycle`}>
              <Button
                variant="heroOutline"
                size="md"
                icon="plus"
                className="w-full"
              >
                {t("startCycle")}
              </Button>
            </Link>
            <Link to={`/fields/${id}/scan`}>
              <Button
                variant="heroPrimary"
                size="md"
                icon="camera"
                className="w-full shadow-lg"
              >
                Run Disease Scan
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Agronomic Context Strip with Curated Thumbnails */}
      {cycle ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Crop Profile */}
          <div className="rounded-3xl bg-white border border-emerald-200 overflow-hidden shadow-sm flex flex-col">
            <div className="relative h-28 agri-card-img-wrap">
              <img
                src={getCropImageUrl(cycle.crop.name)}
                alt={cycle.crop.name}
                className="agri-card-img absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 to-transparent" />
              <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between text-white font-mono text-xs">
                <span className="font-semibold text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                  <AgriIcon name="leaf" className="h-3.5 w-3.5" />
                  Active Crop
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
              </div>
            </div>
            <div className="p-4 space-y-1">
              <div className="font-display text-xl font-bold text-forest-950">{cycle.crop.name}</div>
              <div className="font-mono text-xs text-forest-700">
                Sown: {new Date(cycle.startDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Soil Classification */}
          <div className="rounded-3xl bg-white border border-emerald-200 overflow-hidden shadow-sm flex flex-col">
            <div className="relative h-28 agri-card-img-wrap">
              <img
                src={getSoilImageUrl(cycle.soil.name)}
                alt={cycle.soil.name}
                className="agri-card-img absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 to-transparent" />
              <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between text-white font-mono text-xs">
                <span className="font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                  <AgriIcon name="layers" className="h-3.5 w-3.5" />
                  Soil Texture
                </span>
                <span className="h-2 w-2 rounded-full bg-amber-400" />
              </div>
            </div>
            <div className="p-4 space-y-1">
              <div className="font-display text-xl font-bold text-forest-950">{cycle.soil.name}</div>
              <div className="font-mono text-xs text-forest-700">Calibrated for Infiltration</div>
            </div>
          </div>

          {/* Protocol Guard */}
          <div className="rounded-3xl bg-white border border-emerald-200 overflow-hidden shadow-sm flex flex-col justify-between p-5 bg-gradient-to-br from-emerald-50/50 to-white">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-forest-800 font-semibold flex items-center gap-1.5">
                  <AgriIcon name="shieldCheck" className="h-4 w-4 text-emerald-600" />
                  <span>Protocol Guard</span>
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="mt-3 font-display text-2xl font-bold text-forest-950">Active</div>
              <p className="mt-1 font-mono text-xs text-forest-700 leading-relaxed">
                ICAR CIBRC & Agro-climatic safety thresholds enforced for this plot.
              </p>
            </div>
            <div className="pt-3 border-t border-emerald-100 font-mono text-[11px] text-emerald-800 font-medium">
              Verified Compliance Engine
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-amber-50/90 border border-amber-200 p-6 text-sm text-amber-950">
          No crop cycle is currently registered for this plot. Start a new cycle to activate leaf diagnostics and precision irrigation calculations.
        </div>
      )}

      {/* Decision-Support Operations Grid with Photographic Backgrounds */}
      <section className="space-y-6">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-forest-950 tracking-tight">
            Field Operations & Diagnostics
          </h2>
          <p className="font-mono text-xs text-forest-700 mt-0.5">
            Launch diagnostic workflows and precision scheduling models
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Module 1: Irrigation */}
          <Link to={`/fields/${id}/irrigation`} className="group block">
            <div className="rounded-3xl bg-white border border-emerald-200/90 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full">
              <div className="relative h-36 agri-card-img-wrap">
                <img
                  src={AGRI_HERO_IMAGES.irrigationAdvisory}
                  alt="Irrigation Schedule"
                  className="agri-card-img absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950/85 via-forest-950/40 to-transparent" />
                <div className="absolute top-3 left-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 border border-sky-400/30 text-sky-200 backdrop-blur-md">
                    <AgriIcon name="droplet" className="h-5 w-5" />
                  </div>
                </div>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h3 className="font-display text-xl font-bold">{t("irrigation")}</h3>
                  <span className="font-mono text-xs text-sky-200">Hydrological Balance Model</span>
                </div>
              </div>
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <p className="text-sm text-forest-800 leading-relaxed">
                  Assess current soil moisture depletion, evaluate 3-day rainfall outlooks, and calculate precise application volume (Liters) and depth (mm).
                </p>
                <div className="pt-3 border-t border-emerald-100 flex items-center justify-between font-mono text-xs text-sky-700 font-semibold group-hover:text-sky-800">
                  <span>Calculate Application →</span>
                  <AgriIcon name="arrowRight" className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>

          {/* Module 2: Disease Scan */}
          <Link to={`/fields/${id}/scan`} className="group block">
            <div className="rounded-3xl bg-white border border-emerald-200/90 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full">
              <div className="relative h-36 agri-card-img-wrap">
                <img
                  src={AGRI_HERO_IMAGES.diseaseScan}
                  alt="Disease Scan"
                  className="agri-card-img absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950/85 via-forest-950/40 to-transparent" />
                <div className="absolute top-3 left-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 backdrop-blur-md">
                    <AgriIcon name="camera" className="h-5 w-5" />
                  </div>
                </div>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h3 className="font-display text-xl font-bold">{t("scan")}</h3>
                  <span className="font-mono text-xs text-emerald-200">Multimodal Vision LLM</span>
                </div>
              </div>
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <p className="text-sm text-forest-800 leading-relaxed">
                  Upload leaf photographs for AI computer vision pathology. Receive verified chemical and cultural treatment regimens aligned with ICAR standards.
                </p>
                <div className="pt-3 border-t border-emerald-100 flex items-center justify-between font-mono text-xs text-emerald-700 font-semibold group-hover:text-emerald-800">
                  <span>Diagnose Leaf →</span>
                  <AgriIcon name="arrowRight" className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>

          {/* Module 3: Activity Audit Log */}
          <Link to={`/history?fieldId=${id}`} className="group block">
            <div className="rounded-3xl bg-white border border-emerald-200/90 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full p-6">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-100 group-hover:bg-forest-900 group-hover:text-white transition-colors">
                    <AgriIcon name="activity" className="h-6 w-6" />
                  </div>
                  <span className="font-mono text-xs uppercase tracking-wider text-forest-700 font-medium group-hover:translate-x-0.5 transition-transform">
                    Audit Trail →
                  </span>
                </div>
                <h3 className="mt-4 font-display text-xl font-bold text-forest-950">{t("history")}</h3>
                <p className="mt-2 text-sm text-forest-800 leading-relaxed">
                  Review historical diagnostic logs, past irrigation recommendations, and agronomist feedback records recorded for this holding.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-emerald-100 font-mono text-xs text-forest-600">
                Audit & Compliance Trail
              </div>
            </div>
          </Link>

          {/* Module 4: Seasonal Cycle Transition */}
          <Link to={`/fields/${id}/new-cycle`} className="group block">
            <div className="rounded-3xl bg-white border border-emerald-200/90 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full p-6">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-soil-50 text-soil-700 border border-soil-200 group-hover:bg-soil-600 group-hover:text-white transition-colors">
                    <AgriIcon name="sprout" className="h-6 w-6" />
                  </div>
                  <span className="font-mono text-xs uppercase tracking-wider text-soil-700 font-medium group-hover:translate-x-0.5 transition-transform">
                    Switch Crop →
                  </span>
                </div>
                <h3 className="mt-4 font-display text-xl font-bold text-forest-950">{t("startCycle")}</h3>
                <p className="mt-2 text-sm text-forest-800 leading-relaxed">
                  Transition this plot to a new seasonal crop with automatic regional soil suitability analysis and alternative crop recommendations.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-emerald-100 font-mono text-xs text-soil-600">
                Seasonal Rotation Model
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Historical Crop Cycles Section */}
      {q.data.cropCycles.length > 1 && (
        <section>
          <div className="rounded-3xl bg-white border border-emerald-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-emerald-100">
              <h3 className="font-display text-lg font-bold text-forest-950 flex items-center gap-2">
                <AgriIcon name="calendar" className="h-4 w-4 text-forest-600" />
                <span>Historical Seasonal Crop Cycles</span>
              </h3>
            </div>

            <div className="divide-y divide-emerald-100">
              {q.data.cropCycles.map((c) => (
                <div key={c.id} className="py-4 flex items-center justify-between gap-4 font-mono text-xs">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <div>
                      <span className="font-bold text-forest-950 text-sm font-sans">{c.crop.name}</span>
                      <span className="text-forest-600 ml-3">
                        Planted: {new Date(c.startDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <StatusBadge
                    label={c.status}
                    variant={c.status === "ACTIVE" ? "healthy" : "neutral"}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
