import { useMemo, useRef, useState, type DragEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DiseaseApi, FeedbackApi, FieldsApi } from "../../lib/api";
import {
  AgriIcon,
  Button,
  Card,
  EditorialBadge,
  ErrorBanner,
  Select,
  SkeletonCard,
  StatusBadge,
} from "../../components/ui";
import { AGRI_HERO_IMAGES, getCropImageUrl } from "../../lib/agronomyAssets";

export function ScanPage({ fieldIdFromRoute }: { fieldIdFromRoute?: string }) {
  const { t } = useTranslation();
  const params = useParams();
  const nav = useNavigate();
  const fieldId = fieldIdFromRoute || params.id;
  const fieldsQ = useQuery({ queryKey: ["fields"], queryFn: FieldsApi.list });
  const selected = fieldsQ.data?.find((f) => f.id === fieldId) ?? fieldsQ.data?.[0];
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const qualityWarning = useMemo(() => {
    if (!file) return null;
    if (file.size < 8_000) return "This file looks unusually small. Please take a clearer, closer photo of the leaf.";
    return null;
  }, [file]);

  async function compressIfNeeded(input: File) {
    if (input.size < 900_000) return input;
    const bitmap = await createImageBitmap(input);
    const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return input;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.72));
    if (!blob) return input;
    return new File([blob], input.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" });
  }

  async function onFile(f: File) {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError(null);
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type.startsWith("image/")) {
      void onFile(dropped);
    }
  }

  async function scan() {
    if (!file || !selected?.activeCycle) {
      setError("Select a field with an active crop cycle, then upload a plant photo.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const prepared = await compressIfNeeded(file);
      const data = await DiseaseApi.scan(selected.activeCycle.id, prepared);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pathology analysis failed. Please verify image and connectivity.");
    } finally {
      setBusy(false);
    }
  }

  if (fieldsQ.isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 py-8">
        <div className="h-48 rounded-3xl bg-emerald-950/20 animate-shimmer" />
        <SkeletonCard />
      </div>
    );
  }

  const activeCropName = selected?.activeCycle?.crop.name;
  const cropThumbnailUrl = getCropImageUrl(activeCropName);

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-2 animate-fade-in">
      {/* Top Banner with Leaf Pathology Macro Imagery */}
      <section
        className="agri-hero-banner relative rounded-3xl overflow-hidden shadow-xl border border-forest-800/40 text-white"
        style={{ backgroundImage: `url(${AGRI_HERO_IMAGES.diseaseScan})` }}
      >
        <div className="agri-hero-overlay" />

        <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-mono font-medium backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Computer Vision Pathology
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-100 text-xs font-mono backdrop-blur-md">
                <AgriIcon name="sparkles" className="h-3 w-3 text-emerald-300" />
                Gemini 2.5 Flash Vision
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white drop-shadow-sm">
              AI Leaf Pathology Diagnostics
            </h1>

            <p className="text-emerald-100/90 text-sm leading-relaxed font-sans">
              Capture or upload high-resolution leaf photographs. Multimodal vision models inspect foliar symptoms and generate ICAR/CIBRC-certified treatment regimens.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2 bg-black/40 border border-white/10 px-4 py-3 rounded-2xl backdrop-blur-md font-mono text-xs text-emerald-200">
            <AgriIcon name="shieldCheck" className="h-5 w-5 text-emerald-400" />
            <span>ICAR Standardized Diagnostic Model</span>
          </div>
        </div>
      </section>

      {/* Target Holding Selection Card */}
      <div className="rounded-3xl border border-emerald-200 bg-white p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl overflow-hidden shrink-0 border border-emerald-200 relative">
            <img
              src={cropThumbnailUrl}
              alt="Crop target"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-forest-700">
              Target Field Holding
            </div>
            <div className="font-display font-bold text-forest-950 text-base truncate mt-0.5">
              {selected ? (
                <span>
                  {selected.name} · <span className="text-emerald-700 font-semibold">{activeCropName || "No active crop"}</span>
                </span>
              ) : (
                "No field selected"
              )}
            </div>
          </div>
        </div>

        {!fieldId && (fieldsQ.data ?? []).length > 1 && (
          <div className="sm:w-64">
            <Select
              value={selected?.id ?? ""}
              onChange={(e) => nav(`/fields/${e.target.value}/scan`)}
            >
              {(fieldsQ.data ?? []).map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} {f.activeCycle ? `· ${f.activeCycle.crop.name}` : ""}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void onFile(f);
        }}
      />

      {/* Interactive Photo Upload Dropzone with Optical Reticle Viewfinder */}
      {!preview ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`relative rounded-3xl border-2 border-dashed p-10 sm:p-16 text-center transition-all cursor-pointer overflow-hidden ${
            isDragging
              ? "border-emerald-600 bg-emerald-100/70 scale-[1.01]"
              : "border-emerald-300 bg-white/90 hover:border-emerald-600 hover:bg-emerald-50/70 shadow-sm"
          }`}
        >
          {/* High-tech Viewfinder HUD Reticle Corners */}
          <div className="agri-reticle-corner agri-reticle-tl" />
          <div className="agri-reticle-corner agri-reticle-tr" />
          <div className="agri-reticle-corner agri-reticle-bl" />
          <div className="agri-reticle-corner agri-reticle-br" />

          <div className="relative z-10 max-w-md mx-auto space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-forest-900 border border-emerald-300 shadow-sm group-hover:scale-105 transition-transform">
              <AgriIcon name="camera" className="h-10 w-10 text-emerald-700" />
            </div>

            <div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-forest-950 tracking-tight">
                Upload or Drag & Drop Crop Photography
              </h3>
              <p className="mt-2 text-sm text-forest-700 leading-relaxed">
                Take a sharp daylight photo targeting affected leaf surfaces, discoloration, or lesions. Formats: JPG, PNG, WebP up to 10MB.
              </p>
            </div>

            <div className="pt-2 flex justify-center">
              <Button size="lg" icon="camera" className="w-auto shadow-md font-bold">
                {t("takePhoto")}
              </Button>
            </div>

            {/* Quality advice */}
            <div className="pt-3 flex items-center justify-center gap-3 text-xs font-mono text-forest-600">
              <span className="flex items-center gap-1">
                <AgriIcon name="check" className="h-3.5 w-3.5 text-emerald-600" />
                Natural daylight
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <AgriIcon name="check" className="h-3.5 w-3.5 text-emerald-600" />
                15–20cm distance
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <AgriIcon name="check" className="h-3.5 w-3.5 text-emerald-600" />
                Sharp focal lock
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Image Preview Card with Animated Laser Radar State */
        <div className="rounded-3xl bg-white border border-emerald-200 p-6 sm:p-8 space-y-6 shadow-md">
          <div className="relative rounded-2xl overflow-hidden bg-forest-950 max-h-[420px] flex items-center justify-center border border-forest-900">
            <img
              src={preview}
              alt="Selected plant leaf"
              className="max-h-[420px] w-full object-contain"
            />

            {/* High-tech Viewfinder HUD Reticle Corners on Preview */}
            <div className="agri-reticle-corner agri-reticle-tl" />
            <div className="agri-reticle-corner agri-reticle-tr" />
            <div className="agri-reticle-corner agri-reticle-bl" />
            <div className="agri-reticle-corner agri-reticle-br" />

            {/* Animated Emerald Radar Scanning Beam */}
            {busy && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="h-2 w-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_24px_#34d399] animate-radar" />
                <div className="absolute inset-0 bg-emerald-500/10 backdrop-contrast-125" />
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/80 text-emerald-300 font-mono text-xs border border-emerald-400/40 backdrop-blur-md">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    AI Pathology Analysis In Progress...
                  </span>
                </div>
              </div>
            )}

            {/* Top Preview Controls */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => fileRef.current?.click()}
                className="rounded-xl bg-black/75 backdrop-blur-md px-3.5 py-2 font-mono text-xs font-semibold text-white hover:bg-black/90 transition-colors cursor-pointer border border-white/20 shadow-xs"
              >
                Change Photo
              </button>
            </div>
          </div>

          {qualityWarning && (
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs sm:text-sm text-amber-950 flex items-center gap-3">
              <AgriIcon name="alertTriangle" className="h-5 w-5 shrink-0 text-amber-700" />
              <span>{qualityWarning}</span>
            </div>
          )}

          {/* Polished Error UI */}
          {error && (
            <div className="rounded-2xl bg-rose-50 border border-rose-300 p-4 sm:p-5 text-rose-950 space-y-2">
              <div className="flex items-center gap-2.5 font-bold text-sm text-rose-900">
                <AgriIcon name="alertTriangle" className="h-5 w-5 text-rose-600 shrink-0" />
                <span>Diagnostic Notice / Action Required</span>
              </div>
              <p className="text-xs sm:text-sm text-rose-800 pl-7 leading-relaxed">
                {error}
              </p>
              <div className="pt-2 pl-7 flex items-center gap-2 text-xs font-mono text-rose-700">
                <span>Tip: Verify internet connection, crop selection, and ensure clear leaf visibility.</span>
              </div>
            </div>
          )}

          <Button
            size="lg"
            disabled={!file || busy || !selected?.activeCycle}
            loading={busy}
            onClick={() => void scan()}
            icon="scan"
            className="w-full shadow-lg bg-emerald-600 hover:bg-emerald-500 font-bold"
          >
            {busy ? t("scanning") : "Analyze Crop Photo with AI Vision"}
          </Button>
        </div>
      )}

      {/* Diagnosis Report State */}
      {result && <ScanResult result={result} registeredCropName={selected?.activeCycle?.crop.name} />}
    </div>
  );
}

// ==========================================
// STRUCTURED DIAGNOSIS & TREATMENT REPORT
// ==========================================
function ScanResult({
  result,
  registeredCropName,
}: {
  result: Record<string, unknown>;
  registeredCropName?: string;
}) {
  const { t } = useTranslation();
  const [feedbackSent, setFeedbackSent] = useState<"helpful" | "not_helpful" | null>(null);
  const status = String(result.status ?? "");
  const isHealthy = result.is_healthy === true;
  const identifiedCrop = result.identified_crop ? String(result.identified_crop) : null;
  const isCropMismatch = result.crop_match === false && Boolean(identifiedCrop);

  return (
    <div className="rounded-3xl bg-white border border-emerald-200 p-6 sm:p-10 space-y-8 shadow-lg animate-fade-in">
      {/* Report Header */}
      <div className="border-b border-emerald-100 pb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <EditorialBadge>Diagnostic Assessment</EditorialBadge>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-forest-950 tracking-tight mt-2 text-balance">
            {String(result.message)}
          </h2>
          {isCropMismatch && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-950 border border-amber-300 font-mono text-xs font-semibold mt-2.5">
              <AgriIcon name="sprout" className="h-4 w-4 text-amber-800" />
              <span>Plant identified in photo: <strong className="font-bold">{identifiedCrop}</strong> (Holding crop: {registeredCropName || "different"})</span>
            </div>
          )}
        </div>
        <StatusBadge
          label={status.replace(/_/g, " ")}
          variant={
            isHealthy
              ? "healthy"
              : status === "VALID_ASSESSMENT"
              ? "critical"
              : "attention"
          }
          size="md"
        />
      </div>

      {/* HEALTHY RESULT STATE */}
      {status === "VALID_ASSESSMENT" && isHealthy && (
        <div className="rounded-3xl border border-emerald-300 bg-gradient-to-br from-emerald-50 to-leaf-50 p-6 sm:p-8 flex items-start gap-5 shadow-sm">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-md">
            <AgriIcon name="shieldCheck" className="h-8 w-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-display text-2xl font-bold text-emerald-950">Crop In Healthy Condition</h3>
            <p className="text-sm text-emerald-900 leading-relaxed">
              {t("healthyNote") || "No visible symptoms of infectious foliar pathogen, fungal blight, or pest damage were detected in the supplied leaf sample. Continue standard seasonal nutrition and irrigation."}
            </p>
            <div className="pt-2 flex items-center gap-2 font-mono text-xs text-emerald-800 font-semibold">
              <AgriIcon name="check" className="h-4 w-4 text-emerald-600" />
              <span>Optimal Foliar Vigor Confirmed</span>
            </div>
          </div>
        </div>
      )}

      {/* DISEASE DETECTED RESULT STATE */}
      {Boolean(result.disease_common_name) && !isHealthy && (
        <div className="space-y-6">
          {/* Disease Banner & Metrics */}
          <div className="rounded-3xl bg-rose-50 border border-rose-200 p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-rose-800 font-semibold block mb-1">
                  Detected Condition
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-rose-950">
                  {String(result.disease_common_name)}
                </h3>
                {Boolean(result.disease_scientific_name) && (
                  <p className="text-sm italic text-rose-800 font-serif mt-0.5">
                    {String(result.disease_scientific_name)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <StatusBadge
                  label={`Risk: ${String(result.risk_level ?? "Medium")}`}
                  variant="critical"
                  size="sm"
                />
                <span className="font-mono text-xs font-bold bg-white text-rose-900 border border-rose-200 px-3 py-1 rounded-full shadow-xs">
                  {Math.round(Number(result.confidence ?? 0) * 100)}% Confidence
                </span>
              </div>
            </div>

            {/* Symptoms Tags */}
            {Array.isArray(result.visible_symptoms) && result.visible_symptoms.length > 0 && (
              <div className="pt-3 border-t border-rose-200">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-rose-900 block mb-2">
                  Observed Foliar Symptoms:
                </span>
                <div className="flex flex-wrap gap-2">
                  {(result.visible_symptoms as string[]).map((sym, idx) => (
                    <span
                      key={idx}
                      className="rounded-xl bg-white border border-rose-200 px-3 py-1 font-mono text-xs font-medium text-rose-900 shadow-xs"
                    >
                      {sym}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pathology Analysis Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {Boolean(result.probable_cause) && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-xs">
                <div className="font-mono font-bold text-amber-900 uppercase tracking-wider text-xs mb-2 flex items-center gap-1.5">
                  <AgriIcon name="info" className="h-4 w-4 text-amber-700" />
                  <span>Probable Etiology / Cause</span>
                </div>
                <p className="text-stone-800 text-sm leading-relaxed">{String(result.probable_cause)}</p>
              </div>
            )}
            {Boolean(result.consequences_if_untreated) && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-5 shadow-xs">
                <div className="font-mono font-bold text-rose-900 uppercase tracking-wider text-xs mb-2 flex items-center gap-1.5">
                  <AgriIcon name="alertTriangle" className="h-4 w-4 text-rose-700" />
                  <span>Yield Risk If Untreated</span>
                </div>
                <p className="text-stone-800 text-sm leading-relaxed">{String(result.consequences_if_untreated)}</p>
              </div>
            )}
          </div>

          {/* Structured Treatment Protocol Card */}
          {result.treatment_available && result.treatment && typeof result.treatment === "object" ? (
            <div className="rounded-3xl border border-emerald-300 bg-emerald-50/60 p-6 sm:p-8 space-y-5 shadow-sm">
              <div className="flex items-center gap-3 border-b border-emerald-200 pb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-forest-900 text-white shadow-xs">
                  <AgriIcon name="shieldCheck" className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="font-display font-bold text-base text-forest-950">
                    Recommended Agronomic Treatment Protocol
                  </h4>
                  <p className="font-mono text-xs text-forest-700">
                    Standardized against ICAR & Central Insecticides Board (CIBRC) guidelines
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white border border-emerald-200 p-4 shadow-xs">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-forest-700">
                    Active Ingredient / Formulation
                  </span>
                  <div className="mt-1 font-display font-bold text-forest-950 text-base">
                    {String((result.treatment as Record<string, unknown>).medicine_name ?? "Standard formulation")}
                  </div>
                </div>

                <div className="rounded-2xl bg-white border border-emerald-200 p-4 shadow-xs">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-forest-700">
                    Prescribed Dosage
                  </span>
                  <div className="mt-1 font-display font-bold text-forest-950 text-base">
                    {String((result.treatment as Record<string, unknown>).dosage ?? "As indicated on product label")}
                  </div>
                </div>

                {Boolean((result.treatment as Record<string, unknown>).application_method) && (
                  <div className="rounded-2xl bg-white border border-emerald-200 p-4 shadow-xs">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-forest-700">
                      Application Method
                    </span>
                    <div className="mt-1 font-medium text-forest-950 text-sm">
                      {String((result.treatment as Record<string, unknown>).application_method)}
                    </div>
                  </div>
                )}

                {Boolean((result.treatment as Record<string, unknown>).timing_frequency) && (
                  <div className="rounded-2xl bg-white border border-emerald-200 p-4 shadow-xs">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-forest-700">
                      Timing & Reapplication Window
                    </span>
                    <div className="mt-1 font-medium text-forest-950 text-sm">
                      {String((result.treatment as Record<string, unknown>).timing_frequency)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5 text-xs sm:text-sm text-stone-600 text-center">
              Verified chemical protocol not currently indexed for this specific pathogen. Please consult your regional Krishi Vigyan Kendra (KVK).
            </div>
          )}

          {/* Precautions List */}
          {Array.isArray(result.precautions) && (result.precautions as string[]).length > 0 && (
            <div className="rounded-2xl border border-emerald-200 bg-white p-5 space-y-2.5 shadow-xs">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-forest-950 flex items-center gap-2">
                <AgriIcon name="check" className="h-4 w-4 text-emerald-600" />
                <span>Field Precautions & Safety Best Practices:</span>
              </span>
              <ul className="space-y-2 text-xs sm:text-sm text-forest-800 pl-2">
                {(result.precautions as string[]).map((p, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* UNCERTAIN / LOW CONFIDENCE OR INVALID RESULT STATE */}
      {status !== "VALID_ASSESSMENT" && !result.disease_common_name && !isHealthy && (
        <div className="rounded-3xl border border-amber-300 bg-amber-50 p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-600 text-white shadow-xs">
              <AgriIcon name="alertTriangle" className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-xl font-bold text-amber-950">
                {status === "UNSUPPORTED"
                  ? "AI Vision Service Temporarily Busy"
                  : status === "INVALID_IMAGE"
                  ? "Image Does Not Show Plant Foliage"
                  : status === "INSUFFICIENT_IMAGE_QUALITY"
                  ? "Image Quality Too Low for Diagnosis"
                  : status === "CROP_MISMATCH"
                  ? "Crop Mismatch Detected"
                  : "Diagnostic Confidence Under Safety Threshold"}
              </h3>
              <p className="text-sm leading-relaxed text-amber-900">
                {String(result.message)}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-amber-200 p-5 text-xs sm:text-sm text-stone-700 space-y-2">
            <div className="font-bold text-stone-900">Guidelines for Higher Accuracy Retake:</div>
            <ul className="list-disc list-inside space-y-1.5 text-stone-600">
              <li>Take photo under bright, indirect morning daylight (avoid glare or dark shadows)</li>
              <li>Keep camera 15–20 cm away from the leaf surface for razor-sharp optical focus</li>
              <li>Ensure the affected leaf area occupies at least 50% of the camera view</li>
              <li>Ensure camera lens is steady to eliminate motion blur</li>
            </ul>
          </div>
        </div>
      )}

      {/* Feedback Widget */}
      <div className="border-t border-emerald-100 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <span className="font-mono text-xs font-semibold text-forest-800">
          Was this agronomic diagnostic helpful for your farm?
        </span>
        {feedbackSent ? (
          <span className="font-mono text-xs font-bold text-emerald-800 flex items-center gap-1.5">
            <AgriIcon name="check" className="h-4 w-4 text-emerald-600" />
            <span>Thank you for validating this diagnosis.</span>
          </span>
        ) : (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon="thumbsUp"
              className="w-auto text-xs"
              onClick={() => {
                void FeedbackApi.send({
                  relatedType: "disease",
                  relatedId: String(result.id ?? "scan"),
                  rating: "helpful",
                });
                setFeedbackSent("helpful");
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
                void FeedbackApi.send({
                  relatedType: "disease",
                  relatedId: String(result.id ?? "scan"),
                  rating: "not_helpful",
                });
                setFeedbackSent("not_helpful");
              }}
            >
              {t("notHelpful")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function GlobalScanPage() {
  return <ScanPage />;
}
