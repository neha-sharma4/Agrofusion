export const ROLES = ["FARMER", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const CROP_CYCLE_STATUSES = ["ACTIVE", "COMPLETED", "ARCHIVED"] as const;
export type CropCycleStatus = (typeof CROP_CYCLE_STATUSES)[number];

export const FIELD_STATUSES = ["ACTIVE", "ARCHIVED"] as const;
export type FieldStatus = (typeof FIELD_STATUSES)[number];

export const URGENCY_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type UrgencyLevel = (typeof URGENCY_LEVELS)[number];

export const URGENCY_FARMER_LABELS: Record<UrgencyLevel, { en: string; hi: string }> = {
  LOW: { en: "Irrigation not urgently required", hi: "सिंचाई की तत्काल आवश्यकता नहीं" },
  MEDIUM: { en: "Monitor soil moisture", hi: "मिट्टी की नमी पर नज़र रखें" },
  HIGH: { en: "Irrigation recommended", hi: "सिंचाई की सलाह दी जाती है" },
  CRITICAL: { en: "Irrigation needed urgently", hi: "तुरंत सिंचाई आवश्यक है" },
};

export const DISEASE_STATUSES = [
  "VALID_ASSESSMENT",
  "UNCERTAIN",
  "INVALID_IMAGE",
  "INSUFFICIENT_IMAGE_QUALITY",
  "CROP_MISMATCH",
  "UNSUPPORTED",
  "MISSING_INFORMATION",
] as const;
export type DiseaseStatus = (typeof DISEASE_STATUSES)[number];

export const RISK_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export const AREA_UNITS = ["SQ_M", "ACRE", "HECTARE", "BIGHA"] as const;
export type AreaUnit = (typeof AREA_UNITS)[number];

/** Convert farmer-entered area to square metres. 1 acre = 4046.86 m²; 1 hectare = 10000 m²; 1 bigha (standardised V1) = 2508.38 m² */
export function areaToSquareMetres(value: number, unit: AreaUnit): number {
  switch (unit) {
    case "SQ_M":
      return value;
    case "ACRE":
      return value * 4046.86;
    case "HECTARE":
      return value * 10000;
    case "BIGHA":
      return value * 2508.38;
  }
}

/** 1 mm of water over 1 m² = 1 litre */
export function irrigationVolumeLiters(areaSqM: number, depthMm: number): number {
  return Math.round(areaSqM * depthMm * 10) / 10;
}

export const MAX_PLOT_AREA_SQ_M = 10_000_000;
export const OTP_LENGTH = 6;
export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_MS = 30 * 1000;
export const PASSWORD_RESET_TTL_MS = 24 * 60 * 60 * 1000;

export type SuitabilityResult = {
  is_suitable: boolean;
  confidence: number;
  reasoning: string;
  alternative_crops?: { crop_name: string; why_suitable: string }[];
};

export type IrrigationLlmDepth = {
  irrigation_required: boolean;
  recommended_amount_mm: number;
  urgency: UrgencyLevel;
  reasoning: string;
};

export type IrrigationResult = IrrigationLlmDepth & {
  recommended_volume_liters: number;
};

export type DiseaseTreatment = {
  medicine_name: string;
  dosage: string;
  application_method: string;
  timing_frequency: string;
};

export type DiseaseAssessment = {
  status: DiseaseStatus;
  image_relevant?: boolean;
  crop_match?: boolean;
  identified_crop?: string | null;
  image_quality_sufficient?: boolean;
  is_healthy?: boolean | null;
  disease_common_name?: string | null;
  disease_scientific_name?: string | null;
  confidence?: number;
  visible_symptoms?: string[];
  risk_level?: RiskLevel | null;
  treatment_available?: boolean;
  treatment?: DiseaseTreatment | null;
  consequences_if_untreated?: string | null;
  probable_cause?: string | null;
  precautions?: string[];
  message: string;
};

export const FARMER_MESSAGES = {
  invalidImage:
    "This image does not appear to show the selected crop. Please upload a clear photo of the affected plant or leaf.",
  poorImage:
    "The image is not clear enough for a reliable assessment. Please take another photo in good lighting and focus on the affected leaf.",
  cropMismatch:
    "The uploaded image may not match the crop selected for this field. Please check the selected crop or upload the correct plant image.",
  uncertain:
    "We're not fully certain about this assessment. Please upload a clearer image or consult a local agricultural expert for confirmation.",
  treatmentUnavailable: "Verified treatment information is not currently available for this condition.",
  healthy: "Your crop appears healthy based on the uploaded image.",
  llmFailure: "We couldn't generate a reliable assessment right now. Please try again later.",
  safeFallback:
    "We were unable to generate a reliable assessment at this time. Please try again or consult a local agricultural expert.",
} as const;
