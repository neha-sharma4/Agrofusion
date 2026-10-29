import { z } from "zod";
import { URGENCY_LEVELS, type IrrigationResult, type SuitabilityResult } from "@agrofusion/shared";
import { irrigationVolumeLiters } from "@agrofusion/shared";

export function validateSuitabilityJson(raw: unknown): { ok: true; value: SuitabilityResult } | { ok: false; reason: string } {
  const schema = z.object({
    is_suitable: z.boolean(),
    confidence: z.number().min(0).max(1),
    reasoning: z.string().min(8),
    alternative_crops: z
      .array(z.object({ crop_name: z.string().min(1), why_suitable: z.string().min(4) }))
      .optional(),
  });
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false, reason: "invalid_suitability_json" };
  const value = parsed.data;
  if (!value.is_suitable) {
    const alts = value.alternative_crops ?? [];
    if (alts.length < 3 || alts.length > 5) return { ok: false, reason: "invalid_alternatives_count" };
  }
  return { ok: true, value };
}

export function validateIrrigationLlmJson(
  raw: unknown,
  areaSqM: number,
): { ok: true; value: IrrigationResult } | { ok: false; reason: string } {
  const schema = z.object({
    irrigation_required: z.boolean(),
    recommended_amount_mm: z.number().min(0).max(120),
    urgency: z.enum(URGENCY_LEVELS),
    reasoning: z.string().min(8),
    recommended_volume_liters: z.number().optional(),
  });
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false, reason: "invalid_irrigation_json" };
  const depth = parsed.data.recommended_amount_mm;
  const volume = irrigationVolumeLiters(areaSqM, depth);
  return {
    ok: true,
    value: {
      irrigation_required: parsed.data.irrigation_required,
      recommended_amount_mm: depth,
      recommended_volume_liters: volume,
      urgency: parsed.data.urgency,
      reasoning: parsed.data.reasoning,
    },
  };
}
