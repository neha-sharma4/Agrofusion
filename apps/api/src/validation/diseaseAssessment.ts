import { z } from "zod";
import {
  DISEASE_STATUSES,
  FARMER_MESSAGES,
  RISK_LEVELS,
  type DiseaseAssessment,
  type DiseaseStatus,
  type DiseaseTreatment,
} from "@agrofusion/shared";
import { env } from "../config/env.js";
import { knowledgeRetrieval } from "../knowledge/retrieval.js";

const treatmentSchema = z
  .object({
    medicine_name: z.string().optional().nullable(),
    dosage: z.string().optional().nullable(),
    application_method: z.string().optional().nullable(),
    timing_frequency: z.string().optional().nullable(),
  })
  .passthrough();

const rawSchema = z
  .object({
    status: z.enum(DISEASE_STATUSES),
    image_relevant: z.boolean().optional(),
    crop_match: z.boolean().optional(),
    identified_crop: z.string().nullable().optional(),
    image_quality_sufficient: z.boolean().optional(),
    is_healthy: z.boolean().nullable().optional(),
    disease_common_name: z.string().nullable().optional(),
    disease_scientific_name: z.string().nullable().optional(),
    confidence: z.number().min(0).max(1).optional(),
    visible_symptoms: z.array(z.string()).optional(),
    risk_level: z.enum(RISK_LEVELS).nullable().optional(),
    treatment_available: z.boolean().optional(),
    treatment: treatmentSchema.nullable().optional(),
    consequences_if_untreated: z.string().nullable().optional(),
    probable_cause: z.string().nullable().optional(),
    precautions: z.array(z.string()).optional(),
    message: z.string().optional(),
  })
  .passthrough();

export type ValidationOutcome =
  | { ok: true; value: DiseaseAssessment; flagged: boolean }
  | { ok: false; reason: string };

function farmerMessage(status: DiseaseStatus, fallback?: string): string {
  switch (status) {
    case "INVALID_IMAGE":
      return FARMER_MESSAGES.invalidImage;
    case "INSUFFICIENT_IMAGE_QUALITY":
      return FARMER_MESSAGES.poorImage;
    case "CROP_MISMATCH":
      return FARMER_MESSAGES.cropMismatch;
    case "UNCERTAIN":
      return FARMER_MESSAGES.uncertain;
    case "VALID_ASSESSMENT":
      return fallback || FARMER_MESSAGES.healthy;
    default:
      return fallback || FARMER_MESSAGES.safeFallback;
  }
}

function normalizeRawDisease(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const obj = { ...(raw as Record<string, unknown>) };

  // Normalize status string if recognized
  if (typeof obj.status === "string") {
    const s = obj.status.toUpperCase().replace(/\s+/g, "_");
    if (DISEASE_STATUSES.includes(s as any)) {
      obj.status = s;
    }
  }

  // Normalize identified crop
  if (!obj.identified_crop && typeof obj.crop_identified === "string") {
    obj.identified_crop = obj.crop_identified;
  }
  if (!obj.identified_crop && typeof obj.plant_name === "string") {
    obj.identified_crop = obj.plant_name;
  }
  if (!obj.identified_crop && typeof obj.crop_name === "string") {
    obj.identified_crop = obj.crop_name;
  }

  // Normalize disease names & aliases
  if (!obj.disease_common_name && typeof obj.disease_name === "string") {
    obj.disease_common_name = obj.disease_name;
  }
  if (!obj.disease_common_name && typeof obj.condition === "string") {
    obj.disease_common_name = obj.condition;
  }
  if (!obj.disease_common_name && typeof obj.diagnosis === "string") {
    obj.disease_common_name = obj.diagnosis;
  }
  if (!obj.disease_scientific_name && typeof obj.scientific_name === "string") {
    obj.disease_scientific_name = obj.scientific_name;
  }
  if (!obj.disease_scientific_name && typeof obj.pathogen === "string") {
    obj.disease_scientific_name = obj.pathogen;
  }

  // Normalize healthy crop names returned as disease_common_name
  const dcn = typeof obj.disease_common_name === "string" ? obj.disease_common_name.trim().toLowerCase() : "";
  const isHealthyName =
    dcn === "none" ||
    dcn === "no disease detected" ||
    dcn === "no disease" ||
    dcn === "none (healthy crop)" ||
    dcn === "healthy" ||
    dcn === "healthy crop" ||
    dcn === "n/a" ||
    dcn === "nil" ||
    dcn === "not detected" ||
    dcn.startsWith("no disease") ||
    dcn.startsWith("none ");

  if (isHealthyName) {
    obj.disease_common_name = null;
    obj.disease_scientific_name = null;
    obj.is_healthy = true;
  }

  // Enforce status based on semantic flags
  if (obj.image_relevant === false) {
    obj.status = "INVALID_IMAGE";
  } else if (obj.image_quality_sufficient === false) {
    obj.status = "INSUFFICIENT_IMAGE_QUALITY";
  } else if (obj.crop_match === false) {
    obj.status = "CROP_MISMATCH";
  }

  // Symptoms
  if (typeof obj.visible_symptoms === "string") {
    obj.visible_symptoms = [obj.visible_symptoms];
  } else if (!obj.visible_symptoms && Array.isArray(obj.symptoms_observed)) {
    obj.visible_symptoms = obj.symptoms_observed;
  } else if (!obj.visible_symptoms && typeof obj.symptoms_observed === "string") {
    obj.visible_symptoms = [obj.symptoms_observed];
  } else if (!Array.isArray(obj.visible_symptoms)) {
    obj.visible_symptoms = [];
  }

  // Normalize message aliases
  if (!obj.message && typeof obj.farmer_friendly_message === "string") {
    obj.message = obj.farmer_friendly_message;
  }

  // Symptoms normalization
  if (Array.isArray(obj.visible_symptoms)) {
    obj.visible_symptoms = obj.visible_symptoms
      .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
      .map((s) => s.trim());
  } else if (typeof obj.visible_symptoms === "string" && (obj.visible_symptoms as string).trim()) {
    obj.visible_symptoms = [(obj.visible_symptoms as string).trim()];
  } else {
    obj.visible_symptoms = [];
  }

  // Precautions normalization
  if (Array.isArray(obj.precautions)) {
    obj.precautions = obj.precautions
      .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
      .map((s) => s.trim());
  } else if (typeof obj.precautions === "string" && (obj.precautions as string).trim()) {
    obj.precautions = [(obj.precautions as string).trim()];
  } else {
    obj.precautions = [];
  }

  // Causes & consequences aliases
  if (!obj.probable_cause && typeof obj.cause === "string") {
    obj.probable_cause = obj.cause;
  }
  if (!obj.consequences_if_untreated && typeof obj.consequences === "string") {
    obj.consequences_if_untreated = obj.consequences;
  }

  // Treatment normalization
  if (
    !obj.treatment ||
    typeof obj.treatment !== "object" ||
    Array.isArray(obj.treatment)
  ) {
    obj.treatment = null;
    obj.treatment_available = false;
  } else {
    const t = obj.treatment as Record<string, unknown>;
    const medName = typeof t.medicine_name === "string" ? t.medicine_name.trim() : "";
    const dosage = typeof t.dosage === "string" ? t.dosage.trim() : "";
    if (!medName || !dosage) {
      obj.treatment = null;
      obj.treatment_available = false;
    } else {
      obj.treatment = {
        medicine_name: medName,
        dosage: dosage,
        application_method:
          typeof t.application_method === "string" && t.application_method.trim()
            ? t.application_method.trim()
            : "Foliar spray with uniform coverage",
        timing_frequency:
          typeof t.timing_frequency === "string" && t.timing_frequency.trim()
            ? t.timing_frequency.trim()
            : "At first symptom appearance",
      };
      obj.treatment_available = true;
    }
  }

  if (typeof obj.risk_level === "string" && !RISK_LEVELS.includes(obj.risk_level as any)) {
    obj.risk_level = "MEDIUM";
  }

  // Confidence normalization
  let conf = 0.90;
  if (typeof obj.confidence === "string") {
    const parsedConf = parseFloat(obj.confidence);
    conf = Number.isFinite(parsedConf) ? parsedConf : 0.90;
  } else if (typeof obj.confidence === "number") {
    conf = obj.confidence;
  }
  if (conf > 1 && conf <= 100) {
    conf = conf / 100;
  }
  if (conf < 0 || conf > 1) {
    conf = Math.max(0, Math.min(1, conf));
  }
  obj.confidence = conf;

  // Infer is_healthy if omitted
  if (obj.is_healthy === undefined || obj.is_healthy === null) {
    if (obj.disease_common_name || obj.disease_scientific_name) {
      obj.is_healthy = false;
    } else if (obj.status === "VALID_ASSESSMENT") {
      obj.is_healthy = true;
    }
  }

  return obj;
}

export async function validateDiseaseLlmJson(
  raw: unknown,
  cropName: string,
): Promise<ValidationOutcome> {
  const normalized = normalizeRawDisease(raw);
  const parsed = rawSchema.safeParse(normalized);
  if (!parsed.success) return { ok: false, reason: "malformed_or_unsupported_schema" };

  const data = parsed.data;
  const confidence = data.confidence ?? 0.9;
  let status = data.status;
  let flagged = confidence < env.DISEASE_CONFIDENCE_THRESHOLD;

  if (status === "VALID_ASSESSMENT" && confidence < env.DISEASE_CONFIDENCE_THRESHOLD) {
    status = "UNCERTAIN";
    flagged = true;
  }

  // Pure non-plant images or unreadable dark files
  if (status === "INVALID_IMAGE" || status === "INSUFFICIENT_IMAGE_QUALITY") {
    return {
      ok: true,
      flagged: true,
      value: {
        status,
        image_relevant: data.image_relevant ?? false,
        crop_match: data.crop_match,
        identified_crop: data.identified_crop ?? null,
        image_quality_sufficient: data.image_quality_sufficient ?? (status !== "INSUFFICIENT_IMAGE_QUALITY"),
        is_healthy: null,
        disease_common_name: null,
        disease_scientific_name: null,
        confidence,
        visible_symptoms: [],
        risk_level: null,
        treatment_available: false,
        treatment: null,
        consequences_if_untreated: null,
        probable_cause: null,
        precautions: [],
        message: farmerMessage(status, data.message),
      },
    };
  }

  // Crop mismatch handling - wrong plant for selected field crop
  if (status === "CROP_MISMATCH" || data.crop_match === false) {
    const identified = data.identified_crop?.trim();
    const mismatchMsg = identified
      ? `The uploaded image appears to show ${identified}, which does not match the registered field crop (${cropName}). ${FARMER_MESSAGES.cropMismatch}`
      : FARMER_MESSAGES.cropMismatch;

    return {
      ok: true,
      flagged: true,
      value: {
        status: "CROP_MISMATCH",
        image_relevant: data.image_relevant ?? true,
        crop_match: false,
        identified_crop: identified || null,
        image_quality_sufficient: data.image_quality_sufficient ?? true,
        is_healthy: null,
        disease_common_name: null,
        disease_scientific_name: null,
        confidence,
        visible_symptoms: [],
        risk_level: null,
        treatment_available: false,
        treatment: null,
        consequences_if_untreated: null,
        probable_cause: null,
        precautions: [],
        message: mismatchMsg,
      },
    };
  }

  // Uncertain assessment handling
  if (status === "UNCERTAIN") {
    return {
      ok: true,
      flagged: true,
      value: {
        status: "UNCERTAIN",
        image_relevant: data.image_relevant ?? true,
        crop_match: data.crop_match,
        identified_crop: data.identified_crop ?? null,
        image_quality_sufficient: data.image_quality_sufficient ?? true,
        is_healthy: null,
        disease_common_name: null,
        disease_scientific_name: null,
        confidence,
        visible_symptoms: data.visible_symptoms ?? [],
        risk_level: null,
        treatment_available: false,
        treatment: null,
        consequences_if_untreated: null,
        probable_cause: null,
        precautions: data.precautions ?? [],
        message: FARMER_MESSAGES.uncertain,
      },
    };
  }

  // Healthy foliage check
  if (data.is_healthy === true && !data.disease_common_name) {
    const msg = FARMER_MESSAGES.healthy;

    return {
      ok: true,
      flagged,
      value: {
        status: "VALID_ASSESSMENT",
        image_relevant: true,
        crop_match: data.crop_match ?? true,
        identified_crop: data.identified_crop ?? null,
        image_quality_sufficient: true,
        is_healthy: true,
        disease_common_name: null,
        disease_scientific_name: null,
        confidence,
        visible_symptoms: [],
        risk_level: null,
        treatment_available: false,
        treatment: null,
        consequences_if_untreated: null,
        probable_cause: null,
        precautions: data.precautions && data.precautions.length > 0 ? data.precautions : [
          "Maintain regular field monitoring for early pest or disease signs.",
          "Ensure balanced fertilizer management according to crop stage.",
          "Avoid water stagnation around root zones.",
        ],
        message: data.message?.trim() ? data.message : msg,
      },
    };
  }

  // Disease identified (or suspected foliar damage)
  const effectiveCrop = data.identified_crop?.trim() || cropName;
  const diseaseName = data.disease_common_name?.trim() || "Foliar Pathological Condition";

  // Diseased assessments require consequences and probable cause from LLM output
  if (!data.consequences_if_untreated?.trim() || !data.probable_cause?.trim()) {
    return { ok: false, reason: "missing_consequences_or_probable_cause" };
  }

  const consequences = data.consequences_if_untreated.trim();
  const cause = data.probable_cause.trim();

  // Knowledge base lookup for verified chemical treatment
  const kb = await knowledgeRetrieval.findTreatment(diseaseName, effectiveCrop);
  const scientificMatch = data.disease_scientific_name
    ? await knowledgeRetrieval.findTreatment(data.disease_scientific_name, effectiveCrop)
    : null;
  const match = kb ?? scientificMatch;

  let verifiedTreatment: DiseaseTreatment | null = null;
  let treatmentAvailable = false;

  if (match?.medicineName && match.dosage) {
    verifiedTreatment = {
      medicine_name: match.medicineName,
      dosage: match.dosage,
      application_method:
        match.applicationMethod ??
        (data.treatment?.application_method || "Foliar spray with uniform coverage"),
      timing_frequency:
        match.timingFrequency ??
        (data.treatment?.timing_frequency || "At first symptom appearance"),
    };
    treatmentAvailable = true;
  } else if (data.treatment?.medicine_name && data.treatment?.dosage) {
    // Model-provided standard agronomic treatment from training knowledge
    verifiedTreatment = {
      medicine_name: data.treatment.medicine_name,
      dosage: data.treatment.dosage,
      application_method: data.treatment.application_method || "Foliar spray with uniform coverage",
      timing_frequency: data.treatment.timing_frequency || "At first symptom appearance",
    };
    treatmentAvailable = true;
  }

  const kbEntry = match;
  const groundedCause =
    kbEntry?.probableCause?.trim() ||
    cause ||
    `Pathogen infection favored by humidity and temperature affecting ${effectiveCrop} foliage.`;
  const groundedConsequences =
    kbEntry?.consequencesIfUntreated?.trim() ||
    consequences ||
    "Progressive leaf tissue necrosis and premature defoliation, leading to reduced photosynthetic capacity and yield loss if left unmanaged.";

  const defaultMessage = `Symptoms consistent with ${diseaseName} detected on ${effectiveCrop} foliage.`;

  return {
    ok: true,
    flagged: flagged || !treatmentAvailable,
    value: {
      status: "VALID_ASSESSMENT",
      image_relevant: data.image_relevant ?? true,
      crop_match: data.crop_match ?? true,
      identified_crop: data.identified_crop ?? null,
      image_quality_sufficient: data.image_quality_sufficient ?? true,
      is_healthy: false,
      disease_common_name: diseaseName,
      disease_scientific_name: data.disease_scientific_name ?? null,
      confidence,
      visible_symptoms:
        data.visible_symptoms && data.visible_symptoms.length > 0
          ? data.visible_symptoms
          : ["Discolored foliar lesions observed on leaf surface"],
      risk_level: data.risk_level ?? "MEDIUM",
      treatment_available: treatmentAvailable,
      treatment: verifiedTreatment,
      consequences_if_untreated: groundedConsequences,
      probable_cause: groundedCause,
      precautions:
        Array.isArray(kbEntry?.precautionsJson) && (kbEntry?.precautionsJson as string[]).length
          ? (kbEntry?.precautionsJson as string[])
          : data.precautions && data.precautions.length > 0
          ? data.precautions
          : [
              "Practice crop rotation to prevent pathogen accumulation.",
              "Avoid overhead irrigation in late evenings to minimize leaf wetness duration.",
              "Remove and destroy heavily blighted crop debris.",
              "Consult local Krishi Vigyan Kendra (KVK) for registered crop protection formulations.",
            ],
      message: data.message?.trim() ? data.message : defaultMessage,
    },
  };
}

export function safeDiseaseFallback(): DiseaseAssessment {
  return {
    status: "UNSUPPORTED",
    treatment_available: false,
    treatment: null,
    message: FARMER_MESSAGES.safeFallback,
  };
}
