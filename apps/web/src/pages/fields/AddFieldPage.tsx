import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CatalogApi, FieldsApi, SuitabilityApi, type Named } from "../../lib/api";
import {
  AgriIcon,
  Button,
  Card,
  EditorialBadge,
  ErrorBanner,
  Field,
  Input,
  Select,
  SkeletonCard,
  StatusBadge,
} from "../../components/ui";
import { AGRI_HERO_IMAGES, getCropImageUrl, getSoilImageUrl } from "../../lib/agronomyAssets";

export function AddFieldPage({ mode, fieldId }: { mode: "create" | "cycle"; fieldId?: string }) {
  const { t } = useTranslation();
  const nav = useNavigate();
  const cropsQ = useQuery({ queryKey: ["crops"], queryFn: CatalogApi.crops });
  const soilsQ = useQuery({ queryKey: ["soils"], queryFn: CatalogApi.soils });
  const regionsQ = useQuery({ queryKey: ["regions"], queryFn: CatalogApi.regions });
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [cropId, setCropId] = useState("");
  const [soilTypeId, setSoilTypeId] = useState("");
  const [regionId, setRegionId] = useState("");
  const [gpsNote, setGpsNote] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suit, setSuit] = useState<Awaited<ReturnType<typeof SuitabilityApi.check>> | null>(null);
  const [busy, setBusy] = useState(false);

  const cropSearch = useMemo(() => cropsQ.data ?? [], [cropsQ.data]);
  const selectedCrop = cropSearch.find((c) => c.id === cropId);
  const selectedSoil = (soilsQ.data ?? []).find((s) => s.id === soilTypeId);
  const selectedRegion = (regionsQ.data ?? []).find((r: Named) => r.id === regionId);

  async function suggestGps() {
    if (!navigator.geolocation) {
      setGpsNote("Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await CatalogApi.suggestRegion(pos.coords.latitude, pos.coords.longitude);
          if (res.region) {
            setRegionId(res.region.id);
            setGpsNote(`Auto-detected: ${res.region.name}`);
          } else {
            setGpsNote(t("gpsHint"));
          }
        } catch {
          setGpsNote(t("gpsHint"));
        } finally {
          setGpsLoading(false);
        }
      },
      () => {
        setGpsNote(t("gpsHint"));
        setGpsLoading(false);
      },
    );
  }

  async function runSuitability() {
    setBusy(true);
    setError(null);
    try {
      const result = await SuitabilityApi.check({ cropId, soilTypeId, regionId });
      setSuit(result);
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suitability check failed");
    } finally {
      setBusy(false);
    }
  }

  async function finish(selectedCropId = cropId) {
    setBusy(true);
    try {
      if (mode === "cycle" && fieldId) {
        await FieldsApi.newCycle(fieldId, { cropId: selectedCropId, soilTypeId, regionId });
        nav(`/fields/${fieldId}`);
      } else {
        const created = (await FieldsApi.create({ name, cropId: selectedCropId, soilTypeId, regionId })) as { id: string };
        nav(`/fields/${created.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save field");
    } finally {
      setBusy(false);
    }
  }

  function pickAlternative(cropName: string) {
    const found = cropSearch.find((c) => c.name.toLowerCase() === cropName.toLowerCase());
    if (found) void finish(found.id);
    else setError("That alternative crop is not in the crop list. Please pick from the list.");
  }

  if (cropsQ.isLoading || soilsQ.isLoading || regionsQ.isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-12">
        <div className="h-48 rounded-3xl bg-emerald-950/20 animate-shimmer" />
        <SkeletonCard />
      </div>
    );
  }

  const steps = [
    { num: 1, label: "Crop & Plot" },
    { num: 2, label: "Soil Texture" },
    { num: 3, label: "Climate Zone" },
    { num: 4, label: "Suitability" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-2 animate-fade-in">
      {/* Header Navigation */}
      <div className="flex items-center justify-between font-mono text-xs text-forest-800">
        <Link
          to={mode === "cycle" && fieldId ? `/fields/${fieldId}` : "/fields"}
          className="hover:text-forest-950 flex items-center gap-1.5 transition-colors font-medium"
        >
          <AgriIcon name="arrowLeft" className="h-3.5 w-3.5 text-forest-600" />
          <span>Cancel & Return</span>
        </Link>
        <span className="font-bold">Phase {step} of 4</span>
      </div>

      {/* Top Plot Setup Banner */}
      <section
        className="agri-hero-banner relative rounded-3xl overflow-hidden shadow-xl border border-forest-800/40 text-white"
        style={{ backgroundImage: `url(${AGRI_HERO_IMAGES.fieldsDashboard})` }}
      >
        <div className="agri-hero-overlay" />

        <div className="relative z-10 p-6 sm:p-10 space-y-3">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-mono font-medium backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            {mode === "cycle" ? "Seasonal Transition" : "New Holding Calibration"}
          </span>

          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white drop-shadow-sm">
            {mode === "cycle" ? t("startCycle") : t("addField")}
          </h1>

          <p className="text-emerald-100/90 text-sm leading-relaxed font-sans max-w-xl">
            Calibrate plot parameters to evaluate regional soil compatibility, determine irrigation infiltration baselines, and verify yield potential.
          </p>
        </div>
      </section>

      {/* Modern Stepper Indicator */}
      <div className="grid grid-cols-4 gap-3 pt-2">
        {steps.map((s) => {
          const isDone = step > s.num;
          const isCurrent = step === s.num;
          return (
            <div key={s.num} className="space-y-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isDone
                    ? "bg-emerald-600"
                    : isCurrent
                    ? "bg-forest-900"
                    : "bg-emerald-100"
                }`}
              />
              <span
                className={`hidden sm:block font-mono text-[10px] uppercase tracking-wider truncate ${
                  isCurrent ? "text-forest-950 font-bold" : isDone ? "text-forest-800 font-medium" : "text-forest-500"
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      <ErrorBanner message={error} />

      {/* STEP 1: Field Name & Crop Selection */}
      {step === 1 && (
        <div className="rounded-3xl border border-emerald-200 bg-white p-6 sm:p-10 space-y-6 shadow-sm">
          <div className="border-b border-emerald-100 pb-4">
            <h3 className="font-display text-xl font-bold text-forest-950 flex items-center gap-2.5">
              <AgriIcon name="leaf" className="h-5 w-5 text-emerald-600" />
              <span>Plot Identification & Target Crop</span>
            </h3>
            <p className="text-xs sm:text-sm text-forest-700 mt-1 leading-relaxed">
              Define the holding identifier and select the intended seasonal crop.
            </p>
          </div>

          {mode === "create" && (
            <Field label="Field Identifier / Name" required>
              <Input
                placeholder="e.g. North Canal Plot, Sector 3B"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Field>
          )}

          <Field label={t("crop")} required hint="Select target crop variety">
            <Select value={cropId} onChange={(e) => setCropId(e.target.value)}>
              <option value="">Select Target Crop Variety</option>
              {cropSearch.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.nameLocal ? `(${c.nameLocal})` : ""}
                </option>
              ))}
            </Select>
          </Field>

          {/* Visual Crop Preview Pill */}
          {selectedCrop && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 flex items-center gap-4 animate-fade-in">
              <div className="h-16 w-16 rounded-xl overflow-hidden shrink-0 border border-emerald-200 relative">
                <img
                  src={getCropImageUrl(selectedCrop.name)}
                  alt={selectedCrop.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-forest-600">
                  Target Variety
                </span>
                <div className="font-display font-bold text-forest-950 text-lg">
                  {selectedCrop.name}
                </div>
                <div className="font-mono text-xs text-forest-700">
                  Category: {selectedCrop.category || "Field Crop"}
                </div>
              </div>
            </div>
          )}

          <div className="pt-3">
            <Button
              size="lg"
              disabled={!cropId || (mode === "create" && name.trim().length < 2)}
              onClick={() => setStep(2)}
              icon="arrowRight"
              className="w-full font-bold shadow-md"
            >
              {t("continue")}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: Soil Classification */}
      {step === 2 && (
        <div className="rounded-3xl border border-emerald-200 bg-white p-6 sm:p-10 space-y-6 shadow-sm">
          <div className="border-b border-emerald-100 pb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-xl font-bold text-forest-950 flex items-center gap-2.5">
                <AgriIcon name="layers" className="h-5 w-5 text-amber-600" />
                <span>Soil Taxonomy & Texture</span>
              </h3>
              <p className="text-xs sm:text-sm text-forest-700 mt-1 leading-relaxed">
                Soil characteristics govern hydrological retention capacity and nutrient availability.
              </p>
            </div>
            {selectedCrop && (
              <span className="font-mono text-xs font-semibold text-forest-900 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                {selectedCrop.name}
              </span>
            )}
          </div>

          <Field label={t("soil")} required hint="Texture profile of your field">
            <Select value={soilTypeId} onChange={(e) => setSoilTypeId(e.target.value)}>
              <option value="">Select Soil Texture</option>
              {(soilsQ.data ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>

          {/* Visual Soil Texture Preview */}
          {selectedSoil && (
            <div className="rounded-2xl border border-amber-200 bg-soil-50/70 p-4 flex items-center gap-4 animate-fade-in">
              <div className="h-16 w-16 rounded-xl overflow-hidden shrink-0 border border-amber-200 relative">
                <img
                  src={getSoilImageUrl(selectedSoil.name)}
                  alt={selectedSoil.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-soil-700">
                  Soil Profile
                </span>
                <div className="font-display font-bold text-forest-950 text-lg">
                  {selectedSoil.name}
                </div>
                <div className="font-mono text-xs text-forest-700">
                  Calibrated for Infiltration
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-3">
            <Button variant="outline" className="w-1/3" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              size="lg"
              className="w-2/3 font-bold shadow-md"
              disabled={!soilTypeId}
              onClick={() => setStep(3)}
              icon="arrowRight"
            >
              {t("continue")}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Agro-Climatic Region & GPS Assist */}
      {step === 3 && (
        <div className="rounded-3xl border border-emerald-200 bg-white p-6 sm:p-10 space-y-6 shadow-sm">
          <div className="border-b border-emerald-100 pb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-xl font-bold text-forest-950 flex items-center gap-2.5">
                <AgriIcon name="mapPin" className="h-5 w-5 text-emerald-600" />
                <span>Agro-Climatic Zone</span>
              </h3>
              <p className="text-xs sm:text-sm text-forest-700 mt-1 leading-relaxed">
                Regional climate zone establishes baseline seasonal temperature and monsoon precipitation.
              </p>
            </div>
            {selectedSoil && (
              <span className="font-mono text-xs font-semibold text-soil-700 bg-soil-50 px-3 py-1 rounded-xl border border-soil-200">
                {selectedSoil.name}
              </span>
            )}
          </div>

          <Field label={t("region")} required>
            <Select value={regionId} onChange={(e) => setRegionId(e.target.value)}>
              <option value="">Select Agro-Climatic Region</option>
              {(regionsQ.data ?? []).map((r: Named) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Select>
          </Field>

          {/* GPS Auto-Detect Strip */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-forest-900 font-semibold flex items-center gap-1.5">
                <AgriIcon name="sun" className="h-4 w-4 text-amber-500" />
                <span>Auto-Locate GPS Station:</span>
              </span>
              {gpsNote ? (
                <p className="font-mono text-xs text-forest-950 font-bold mt-1">{gpsNote}</p>
              ) : (
                <p className="text-xs text-forest-700 mt-0.5">Detect zone via browser coordinates</p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              loading={gpsLoading}
              className="w-auto text-xs shrink-0"
              onClick={() => void suggestGps()}
            >
              📍 {t("gpsSuggest")}
            </Button>
          </div>

          <div className="flex gap-3 pt-3">
            <Button variant="outline" className="w-1/3" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button
              size="lg"
              className="w-2/3 font-bold shadow-md"
              disabled={!regionId || busy}
              loading={busy}
              onClick={() => void runSuitability()}
              icon="arrowRight"
            >
              Run Suitability Analysis
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: Suitability Analysis Report */}
      {step === 4 && suit && (
        <div className="rounded-3xl border border-emerald-200 bg-white p-6 sm:p-10 space-y-6 shadow-sm animate-fade-in">
          {/* Suitability Verdict Banner */}
          <div
            className={`rounded-3xl border p-6 flex flex-col sm:flex-row items-start gap-4 shadow-xs ${
              suit.is_suitable
                ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                : "bg-amber-50 border-amber-200 text-amber-950"
            }`}
          >
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                suit.is_suitable ? "bg-emerald-700 text-white" : "bg-amber-600 text-white"
              }`}
            >
              <AgriIcon name={suit.is_suitable ? "shieldCheck" : "alertTriangle"} className="h-7 w-7" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h3 className="font-display text-2xl font-bold">
                  {suit.is_suitable ? t("suitable") : t("notSuitable")}
                </h3>
                <span className="font-mono text-xs font-semibold px-3 py-1 rounded-full bg-white border border-current/20">
                  Model Confidence: {Math.round(suit.confidence * 100)}%
                </span>
              </div>
              <p className="text-sm leading-relaxed text-forest-900">
                {suit.reasoning}
              </p>
            </div>
          </div>

          {/* Context Recap Strip */}
          <div className="grid grid-cols-3 gap-3 font-mono text-xs text-center">
            <div className="rounded-2xl bg-emerald-50/70 p-3.5 border border-emerald-200 shadow-2xs">
              <div className="text-forest-700 font-mono text-[10px] uppercase tracking-wider font-semibold">Target Crop</div>
              <div className="font-bold text-forest-950 mt-1 truncate text-sm">{selectedCrop?.name}</div>
            </div>
            <div className="rounded-2xl bg-soil-50/70 p-3.5 border border-soil-200 shadow-2xs">
              <div className="text-soil-700 font-mono text-[10px] uppercase tracking-wider font-semibold">Soil Profile</div>
              <div className="font-bold text-stone-900 mt-1 truncate text-sm">{selectedSoil?.name}</div>
            </div>
            <div className="rounded-2xl bg-sky-50/70 p-3.5 border border-sky-200 shadow-2xs">
              <div className="text-sky-800 font-mono text-[10px] uppercase tracking-wider font-semibold">Zone</div>
              <div className="font-bold text-forest-950 mt-1 truncate text-sm">{selectedRegion?.name}</div>
            </div>
          </div>

          {/* Actions based on verdict */}
          {suit.is_suitable ? (
            <div className="space-y-3 pt-3">
              <Button
                size="lg"
                disabled={busy}
                loading={busy}
                onClick={() => void finish()}
                icon="check"
                className="w-full font-bold shadow-md"
              >
                {mode === "cycle" ? "Activate Crop Cycle" : "Confirm & Save Field Holding"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="w-full">
                Change Crop or Soil Selection
              </Button>
            </div>
          ) : (
            <div className="space-y-6 pt-3">
              <div className="border-t border-emerald-100 pt-4">
                <p className="font-mono text-xs font-semibold uppercase tracking-wider text-forest-900 mb-3 flex items-center gap-2">
                  <AgriIcon name="sprout" className="h-4 w-4 text-emerald-600" />
                  <span>{t("chooseAlt")}</span>
                </p>

                <div className="space-y-3">
                  {(suit.alternative_crops ?? []).map((a) => (
                    <button
                      key={a.crop_name}
                      type="button"
                      disabled={busy}
                      className="w-full rounded-2xl border border-emerald-200 bg-white p-4.5 text-left transition-all hover:border-emerald-600 hover:shadow-xs cursor-pointer group"
                      onClick={() => pickAlternative(a.crop_name)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display font-bold text-base text-forest-950 group-hover:text-emerald-700">
                          {a.crop_name}
                        </span>
                        <span className="font-mono text-xs font-semibold text-emerald-700 flex items-center gap-1">
                          Select Alternative →
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-forest-700 leading-relaxed">
                        {a.why_suitable}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="w-1/2">
                  Change crop manually
                </Button>
                <Button variant="ghost" onClick={() => void finish()} className="w-1/2">
                  Proceed anyway
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function NewFieldPage() {
  return <AddFieldPage mode="create" />;
}

export function NewCyclePage({ fieldId }: { fieldId: string }) {
  return <AddFieldPage mode="cycle" fieldId={fieldId} />;
}
