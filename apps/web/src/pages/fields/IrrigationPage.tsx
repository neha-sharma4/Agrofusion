import { FormEvent, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { URGENCY_FARMER_LABELS, type AreaUnit, type UrgencyLevel } from "@agrofusion/shared";
import { CatalogApi, FeedbackApi, FieldsApi, type ForecastDay, IrrigationApi } from "../../lib/api";
import { AgriIcon, Button, Card, ErrorBanner, Field, Input, Select, SkeletonCard, StatusBadge } from "../../components/ui";
import i18n from "../../i18n";
import { AGRI_HERO_IMAGES } from "../../lib/agronomyAssets";

export function IrrigationPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const fieldQ = useQuery({ queryKey: ["field", id], queryFn: () => FieldsApi.get(id!) });
  const cycle = fieldQ.data?.activeCycle;
  const stagesQ = useQuery({
    queryKey: ["stages", cycle?.crop.id],
    queryFn: () => CatalogApi.stages(cycle?.crop.id),
    enabled: Boolean(cycle),
  });

  const [growthStageId, setGrowthStageId] = useState("");
  const [moisture, setMoisture] = useState("40");
  const [temp, setTemp] = useState("");
  const [humidity, setHumidity] = useState("");
  const [area, setArea] = useState("1");
  const [unit, setUnit] = useState<AreaUnit>("ACRE");
  const [weatherWarning, setWeatherWarning] = useState<string | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[] | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [locality, setLocality] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "requesting" | "available" | "denied">("requesting");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      setWeatherWarning(t("weatherFail"));
      return;
    }
    setLocationStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setCoords({ lat, lon });
        setLocationStatus("available");
        try {
          const w = await IrrigationApi.weather(lat, lon);
          if (w.available && w.current) {
            setTemp(String(w.current.temperatureC));
            setHumidity(String(w.current.humidityPct));
            setForecast(w.forecast ?? null);
            setWeatherWarning(null);
            if (w.locationName) {
              setLocality(w.locationName);
            }
          } else {
            setWeatherWarning(w.warning || t("weatherFail"));
          }
        } catch {
          setWeatherWarning(t("weatherFail"));
        }
      },
      (err) => {
        console.warn("Geolocation denied or error:", err);
        setLocationStatus("denied");
        setWeatherWarning(t("weatherFail"));
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  useEffect(() => {
    requestLocation();
  }, [t]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!cycle) return;
    const m = Number(moisture);
    if (m < 0 || m > 100) {
      setError("Soil moisture must be between 0 and 100.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const data = await IrrigationApi.recommend({
        cropCycleId: cycle.id,
        growthStageId,
        soilMoisturePct: m,
        temperatureC: Number(temp),
        humidityPct: Number(humidity),
        plotArea: Number(area),
        plotAreaUnit: unit,
        latitude: coords?.lat,
        longitude: coords?.lon,
        useManualWeather: Boolean(weatherWarning),
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Irrigation advice calculation failed");
    } finally {
      setBusy(false);
    }
  }

  if (fieldQ.isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-6">
        <div className="h-48 rounded-3xl bg-emerald-950/20 animate-shimmer" />
        <SkeletonCard />
      </div>
    );
  }

  if (!cycle) {
    return (
      <div className="max-w-md mx-auto text-center py-16 bg-white rounded-3xl border border-emerald-200 p-8 shadow-sm">
        <p className="text-forest-900 font-medium">Please start an active crop cycle first to calculate irrigation schedules.</p>
        <div className="mt-6">
          <Link to={`/fields/${id}`}>
            <Button variant="outline" className="w-auto">
              Return to Field
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const lang = i18n.language.startsWith("hi") ? "hi" : "en";
  const urgency = result?.urgency as UrgencyLevel | undefined;
  const moistureVal = Math.min(100, Math.max(0, Number(moisture) || 0));

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-2 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 font-mono text-xs font-medium text-forest-800">
        <Link to={`/fields/${id}`} className="hover:text-forest-950 flex items-center gap-1 transition-colors">
          <AgriIcon name="arrowLeft" className="h-3.5 w-3.5 text-forest-600" />
          <span>{fieldQ.data?.name || "Field"}</span>
        </Link>
        <span className="text-forest-400">/</span>
        <span className="text-forest-950 font-bold truncate">{t("irrigation")}</span>
      </div>

      {/* Top Agricultural Hydrology Hero */}
      <section
        className="agri-hero-banner relative rounded-3xl overflow-hidden shadow-xl border border-forest-800/40 text-white"
        style={{ backgroundImage: `url(${AGRI_HERO_IMAGES.irrigationAdvisory})` }}
      >
        <div className="agri-hero-overlay" />

        <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/30 text-xs font-mono font-medium backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
                Root-Zone Hydrological Balance
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-100 text-xs font-mono backdrop-blur-md">
                <AgriIcon name="cloudSun" className="h-3 w-3 text-sky-300" />
                OpenWeather Telemetry
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white drop-shadow-sm">
              Precision Irrigation Advisory
            </h1>

            <p className="text-emerald-100/90 text-sm leading-relaxed font-sans max-w-xl">
              Root-zone water deficit analysis calibrated with live microclimate telemetry, soil depletion dynamics, and 3-day rainfall outlooks.
            </p>
          </div>

          {/* Context Badges */}
          <div className="shrink-0 flex flex-col gap-2">
            <span className="inline-flex items-center gap-2 rounded-xl bg-black/40 border border-white/10 px-3.5 py-2 text-xs font-mono font-bold text-emerald-200 backdrop-blur-md">
              <AgriIcon name="leaf" className="h-4 w-4 text-emerald-400" />
              <span>{cycle.crop.name}</span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl bg-black/40 border border-white/10 px-3.5 py-2 text-xs font-mono font-semibold text-amber-200 backdrop-blur-md">
              <AgriIcon name="layers" className="h-4 w-4 text-amber-400" />
              <span>{cycle.soil.name}</span>
            </span>
          </div>
        </div>
      </section>

      {/* Two-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-emerald-200 bg-white p-6 sm:p-8 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <div>
                <h2 className="font-display text-lg font-bold text-forest-950">
                  Field Conditions & Telemetry Inputs
                </h2>
                <p className="text-xs text-forest-700">Provide field measurements for root-zone deficit calculation</p>
              </div>
              <span className="font-mono text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Step 1 of 2
              </span>
            </div>

            <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
              <ErrorBanner message={error} />
              {weatherWarning && (
                <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-950 flex items-center gap-2.5 shadow-2xs">
                  <AgriIcon name="alertTriangle" className="h-4.5 w-4.5 text-amber-700 shrink-0" />
                  <span>{weatherWarning}</span>
                </div>
              )}

              <Field label={t("growthStage")} required hint="Select active plant growth phase">
                <Select required value={growthStageId} onChange={(e) => setGrowthStageId(e.target.value)}>
                  <option value="">Select Growth Stage</option>
                  {(stagesQ.data ?? []).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </Field>

              {/* Soil Moisture with Interactive Gauge */}
              <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs font-semibold uppercase tracking-wider text-forest-950 flex items-center gap-1.5">
                    <AgriIcon name="droplet" className="h-3.5 w-3.5 text-sky-600" />
                    <span>{t("moisture")} Level (% Depletion)</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-forest-950 bg-white border border-emerald-200 px-2.5 py-0.5 rounded-lg shadow-2xs">
                    {moistureVal}%
                  </span>
                </div>

                <Input
                  type="number"
                  min={0}
                  max={100}
                  required
                  value={moisture}
                  onChange={(e) => setMoisture(e.target.value)}
                  placeholder="e.g. 40"
                  className="bg-white font-mono text-base font-semibold"
                />

                {/* Visual Gauge Bar */}
                <div className="space-y-1 pt-1">
                  <div className="h-2.5 w-full rounded-full bg-emerald-200/60 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        moistureVal < 30
                          ? "bg-rose-500"
                          : moistureVal <= 65
                          ? "bg-emerald-500"
                          : "bg-sky-500"
                      }`}
                      style={{ width: `${moistureVal}%` }}
                    />
                  </div>
                  <div className="flex justify-between font-mono text-[10px] text-forest-700 px-0.5">
                    <span>Dry (&lt;30%)</span>
                    <span className="text-emerald-700 font-bold">Optimal (40–65%)</span>
                    <span>Saturated (&gt;75%)</span>
                  </div>
                </div>
              </div>

              {/* Weather Stats Inputs */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Field label={t("temperature")} required hint="Ambient (°C)">
                  <Input
                    type="number"
                    step="0.1"
                    required
                    placeholder="30"
                    value={temp}
                    onChange={(e) => setTemp(e.target.value)}
                  />
                </Field>
                <Field label={t("humidity")} required hint="Relative (%)">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    required
                    placeholder="65"
                    value={humidity}
                    onChange={(e) => setHumidity(e.target.value)}
                  />
                </Field>
              </div>

              {/* Plot Area & Unit */}
              <Field label={t("area")} required hint="Field surface measurement">
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={0.01}
                    step="0.01"
                    required
                    className="w-2/3"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                  />
                  <div className="w-1/3">
                    <Select value={unit} onChange={(e) => setUnit(e.target.value as AreaUnit)}>
                      <option value="ACRE">Acre</option>
                      <option value="HECTARE">Hectare</option>
                      <option value="BIGHA">Bigha</option>
                      <option value="SQ_M">m²</option>
                    </Select>
                  </div>
                </div>
              </Field>

              <div className="pt-2">
                <Button size="lg" type="submit" disabled={busy} loading={busy} icon="droplet" className="w-full shadow-md font-bold">
                  {busy ? "Calculating Requirements…" : t("getAdvice")}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Local Microclimate & 3-Day Forecast */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-emerald-200 bg-white shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
              <div>
                <h3 className="text-sm font-bold text-forest-950 flex items-center gap-1.5">
                  <AgriIcon name="mapPin" className="h-4 w-4 text-emerald-600" />
                  <span>{t("currentLocation")}</span>
                </h3>
                <p className="text-[11px] text-forest-700">Weather API Station</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-auto text-xs"
                onClick={requestLocation}
              >
                📍 {t("useCurrentLocation")}
              </Button>
            </div>

            {locationStatus === "requesting" && (
              <div className="mt-3 flex items-center gap-2 text-xs text-forest-700 py-2">
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                <span>{t("detectingLocation")}</span>
              </div>
            )}

            {locationStatus === "available" && coords && (
              <div className="mt-3 space-y-2 text-xs">
                {locality && (
                  <div className="font-bold text-forest-950 text-sm bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-150">
                    📍 {locality}
                  </div>
                )}
                <div className="text-forest-700 flex items-center gap-2">
                  <span>Lat: <strong className="font-mono text-forest-950">{coords.lat.toFixed(4)}</strong></span>
                  <span className="text-emerald-300">|</span>
                  <span>Lon: <strong className="font-mono text-forest-950">{coords.lon.toFixed(4)}</strong></span>
                </div>
              </div>
            )}

            {locationStatus === "denied" && (
              <div className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-900 border border-amber-200">
                <p className="font-semibold">{t("locationDenied")}</p>
                <p className="mt-0.5 text-stone-600">Manual weather values entered on the left will be utilized.</p>
              </div>
            )}
          </div>

          {/* 3-Day Forecast Cards */}
          {forecast && forecast.length > 0 && (
            <div className="rounded-3xl border border-emerald-200 bg-white shadow-sm p-5 space-y-3">
              <h3 className="text-sm font-bold text-forest-950 flex items-center gap-2 pb-2 border-b border-emerald-100">
                <AgriIcon name="cloudRain" className="h-4.5 w-4.5 text-sky-600" />
                <span>{t("forecast")} (Next 3 Days)</span>
              </h3>
              <div className="space-y-2.5">
                {forecast.slice(0, 3).map((day) => (
                  <div
                    key={day.date}
                    className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-forest-950 text-xs">
                        {getForecastDayLabel(day.date, t, lang)}
                      </div>
                      <div className="text-[11px] text-forest-700 mt-0.5">
                        {day.tempMinC}°C – {day.tempMaxC}°C
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200 text-xs inline-flex items-center gap-1 shadow-2xs">
                        🌧 {day.rainfallMm} mm
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RECOMMENDATION RESULT STATE */}
      {result && (
        <div className="rounded-3xl border border-emerald-300 bg-white shadow-lg p-6 sm:p-9 space-y-6 animate-fade-in">
          <div className="border-b border-emerald-100 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-forest-800">
                  AI Evapotranspiration Verdict
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-forest-950 tracking-tight">
                {result.irrigation_required ? "Irrigation Recommended" : "Irrigation Not Required"}
              </h2>
            </div>
            {urgency && (
              <StatusBadge
                label={`Urgency: ${URGENCY_FARMER_LABELS[urgency][lang]}`}
                variant={
                  urgency === "CRITICAL"
                    ? "critical"
                    : urgency === "HIGH"
                    ? "attention"
                    : urgency === "MEDIUM"
                    ? "info"
                    : "healthy"
                }
                size="md"
              />
            )}
          </div>

          {/* Key Metric Callout Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-sky-200 bg-sky-50/80 p-6 flex items-center gap-5 shadow-xs">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-700 text-white shadow-md">
                <AgriIcon name="droplet" className="h-7 w-7" />
              </div>
              <div>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-sky-900 block">
                  {t("volume")} Required
                </span>
                <div className="font-mono text-3xl font-black text-forest-950 mt-1">
                  {Number(result.recommended_volume_liters ?? 0).toLocaleString()} <span className="font-sans text-base font-semibold text-forest-700">Liters</span>
                </div>
                <div className="text-xs text-sky-800 mt-1">Total application across root-zone area</div>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 flex items-center gap-5 shadow-xs">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-md">
                <AgriIcon name="layers" className="h-7 w-7" />
              </div>
              <div>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-forest-900 block">
                  {t("depth")} Measurement
                </span>
                <div className="font-mono text-3xl font-black text-forest-950 mt-1">
                  {String(result.recommended_amount_mm ?? 0)} <span className="font-sans text-base font-semibold text-forest-700">mm</span>
                </div>
                <div className="text-xs text-forest-800 mt-1">Calculated soil moisture replacement depth</div>
              </div>
            </div>
          </div>

          {/* Reasoning & Advice */}
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5 space-y-2">
            <div className="font-mono font-bold text-forest-900 uppercase tracking-wider text-xs">
              Agronomic Assessment Reasoning
            </div>
            <p className="text-forest-900 leading-relaxed text-sm">
              {String(result.reasoning)}
            </p>
          </div>

          {typeof result.moistureWarning === "string" && (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs sm:text-sm text-amber-950 flex items-center gap-3">
              <AgriIcon name="alertTriangle" className="h-5 w-5 text-amber-700 shrink-0" />
              <span>{result.moistureWarning}</span>
            </div>
          )}

          <FeedbackBox relatedType="irrigation" />
        </div>
      )}
    </div>
  );
}

function getForecastDayLabel(dateStr: string, t: (k: string) => string, lang: string): string {
  const todayStr = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  if (dateStr === todayStr) return t("today");
  if (dateStr === tomorrowStr) return t("tomorrow");

  try {
    const d = new Date(dateStr + "T00:00:00");
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  } catch {
    // fallback
  }
  return dateStr;
}

function FeedbackBox({ relatedType }: { relatedType: "irrigation" | "disease" | "suitability" }) {
  const { t } = useTranslation();
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="pt-2 border-t border-emerald-100 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
        <AgriIcon name="check" className="h-4 w-4 text-emerald-600" />
        <span>Thank you for helping improve our agricultural irrigation calculations!</span>
      </div>
    );
  }

  return (
    <div className="border-t border-emerald-100 pt-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span className="text-xs font-semibold text-forest-700">
          Was this irrigation recommendation appropriate for your field?
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            icon="thumbsUp"
            className="w-auto text-xs"
            onClick={() => {
              void FeedbackApi.send({ relatedType, relatedId: relatedType, rating: "helpful" });
              setSent(true);
            }}
          >
            {t("helpful")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon="thumbsDown"
            className="w-auto text-xs"
            onClick={() => {
              void FeedbackApi.send({ relatedType, relatedId: relatedType, rating: "not_helpful", comment });
              setSent(true);
            }}
          >
            {t("notHelpful")}
          </Button>
        </div>
      </div>
      <Input
        placeholder="Optional notes or feedback for agronomists…"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
    </div>
  );
}
