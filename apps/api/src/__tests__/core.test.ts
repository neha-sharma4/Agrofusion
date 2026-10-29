import { describe, expect, it } from "vitest";
import { areaToSquareMetres, irrigationVolumeLiters } from "@agrofusion/shared";
import { computeIrrigation, volumeMatches } from "../services/irrigationEngine.js";
import { validateIrrigationLlmJson, validateSuitabilityJson } from "../validation/llmOutputs.js";
import { suggestRegionFromGps } from "../utils/regionSuggest.js";
import { validateDiseaseLlmJson } from "../validation/diseaseAssessment.js";

describe("irrigation volume", () => {
  it("uses 1 mm over 1 m2 = 1 litre", () => {
    expect(irrigationVolumeLiters(4046.86, 10)).toBe(40468.6);
    expect(irrigationVolumeLiters(1, 1)).toBe(1);
  });

  it("converts acres to square metres", () => {
    expect(areaToSquareMetres(1, "ACRE")).toBeCloseTo(4046.86);
  });

  it("flags volume mismatch", () => {
    expect(volumeMatches(100, 10, 1000)).toBe(true);
    expect(volumeMatches(100, 10, 50)).toBe(false);
  });
});

describe("deterministic irrigation engine", () => {
  it("marks critical urgency for very low moisture", () => {
    const r = computeIrrigation({
      soilMoisturePct: 10,
      temperatureC: 32,
      humidityPct: 40,
      plotAreaSqM: 1000,
      typicalDepthMm: 20,
    });
    expect(r.urgency).toBe("CRITICAL");
    expect(r.irrigation_required).toBe(true);
    expect(r.recommended_volume_liters).toBe(irrigationVolumeLiters(1000, r.recommended_amount_mm));
  });

  it("does not fabricate rain and reduces urgency when heavy rain is forecast", () => {
    const dry = computeIrrigation({
      soilMoisturePct: 40,
      temperatureC: 30,
      humidityPct: 50,
      plotAreaSqM: 500,
    });
    const wet = computeIrrigation({
      soilMoisturePct: 40,
      temperatureC: 30,
      humidityPct: 50,
      plotAreaSqM: 500,
      forecast: [{ date: "2026-09-04", rainfallMm: 40, tempMaxC: 31, tempMinC: 22 }],
    });
    expect(["LOW", "MEDIUM"]).toContain(wet.urgency);
    expect(wet.recommended_amount_mm).toBeLessThanOrEqual(dry.recommended_amount_mm);
  });
});

describe("LLM JSON validation", () => {
  it("rejects malformed suitability", () => {
    expect(validateSuitabilityJson({ is_suitable: true }).ok).toBe(false);
  });

  it("requires 3-5 alternatives when unsuitable", () => {
    const base = { is_suitable: false, confidence: 0.9, reasoning: "Not a good match for this soil." };
    expect(validateSuitabilityJson({ ...base, alternative_crops: [] }).ok).toBe(false);
    expect(
      validateSuitabilityJson({
        ...base,
        alternative_crops: [
          { crop_name: "Wheat", why_suitable: "Winter cereal on alluvial soils" },
          { crop_name: "Mustard", why_suitable: "Rabi oilseed on similar soils" },
          { crop_name: "Chickpea", why_suitable: "Pulse suited to residual moisture" },
        ],
      }).ok,
    ).toBe(true);
  });

  it("recomputes irrigation volume from area and depth", () => {
    const v = validateIrrigationLlmJson(
      {
        irrigation_required: true,
        recommended_amount_mm: 10,
        urgency: "HIGH",
        reasoning: "Moisture is low and no rain is indicated.",
        recommended_volume_liters: 1,
      },
      4046.86,
    );
    expect(v.ok).toBe(true);
    if (v.ok) expect(v.value.recommended_volume_liters).toBe(40468.6);
  });

  it("rejects invalid urgency", () => {
    expect(
      validateIrrigationLlmJson(
        { irrigation_required: true, recommended_amount_mm: 5, urgency: "SOON", reasoning: "Because I said so." },
        100,
      ).ok,
    ).toBe(false);
  });
});

describe("region suggestion", () => {
  it("suggests trans-gangetic plains for Punjab-like coordinates", () => {
    const hint = suggestRegionFromGps(30.9, 75.8);
    expect(hint?.name).toBe("Trans-Gangetic Plains Region");
  });
});

describe("disease assessment validation", () => {
  it("rejects malformed JSON", async () => {
    const r = await validateDiseaseLlmJson({ status: "NOPE" }, "Tomato");
    expect(r.ok).toBe(false);
  });

  it("maps uncertain without inventing a disease", async () => {
    const r = await validateDiseaseLlmJson(
      { status: "UNCERTAIN", confidence: 0.4, disease_common_name: "should-be-cleared", message: "unclear" },
      "Tomato",
    );
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.status).toBe("UNCERTAIN");
      expect(r.value.disease_common_name).toBeNull();
      expect(r.value.message).toContain("not fully certain");
    }
  });

  it("requires consequences and probable cause for diseased plants", async () => {
    const r = await validateDiseaseLlmJson(
      {
        status: "VALID_ASSESSMENT",
        is_healthy: false,
        disease_common_name: "Early blight",
        confidence: 0.9,
      },
      "Tomato",
    );
    expect(r.ok).toBe(false);
  });
});
