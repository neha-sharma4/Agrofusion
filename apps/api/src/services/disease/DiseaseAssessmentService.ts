import type { DiseaseAssessment } from "@agrofusion/shared";
import { FARMER_MESSAGES } from "@agrofusion/shared";
import { prisma } from "../../config/prisma.js";
import { llmClient, LlmUnavailableError } from "../../llm/client.js";
import { DISEASE_SYSTEM_PROMPT } from "../../llm/prompts.js";
import { knowledgeRetrieval } from "../../knowledge/retrieval.js";
import { validateDiseaseLlmJson, safeDiseaseFallback } from "../../validation/diseaseAssessment.js";
import { logLlm } from "../llmLogger.js";
import { AppError } from "../../utils/http.js";

export interface DiseaseAssessmentService {
  assess(input: {
    userId: string;
    cropCycleId: string;
    cropName: string;
    soilName: string;
    regionName: string;
    imageBase64: string;
    mimeType: string;
    imageKey: string;
  }): Promise<DiseaseAssessment>;
}

const DISEASE_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    status: {
      type: "STRING",
      enum: [
        "VALID_ASSESSMENT",
        "UNCERTAIN",
        "INVALID_IMAGE",
        "INSUFFICIENT_IMAGE_QUALITY",
        "CROP_MISMATCH",
        "UNSUPPORTED",
        "MISSING_INFORMATION",
      ],
    },
    image_relevant: { type: "BOOLEAN" },
    crop_match: { type: "BOOLEAN" },
    identified_crop: { type: "STRING" },
    image_quality_sufficient: { type: "BOOLEAN" },
    is_healthy: { type: "BOOLEAN" },
    disease_common_name: { type: "STRING" },
    disease_scientific_name: { type: "STRING" },
    confidence: { type: "NUMBER" },
    visible_symptoms: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
    risk_level: {
      type: "STRING",
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
    },
    treatment_available: { type: "BOOLEAN" },
    treatment: {
      type: "OBJECT",
      properties: {
        medicine_name: { type: "STRING" },
        dosage: { type: "STRING" },
        application_method: { type: "STRING" },
        timing_frequency: { type: "STRING" },
      },
    },
    consequences_if_untreated: { type: "STRING" },
    probable_cause: { type: "STRING" },
    precautions: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
    message: { type: "STRING" },
  },
  required: ["status", "confidence"],
};

export class VisionLLMDiseaseService implements DiseaseAssessmentService {
  async assess(input: Parameters<DiseaseAssessmentService["assess"]>[0]): Promise<DiseaseAssessment> {
    const kb = await knowledgeRetrieval.forDisease(input.cropName);
    const kbText = knowledgeRetrieval.formatForPrompt(kb);
    const kbPromptSection = kb.length
      ? `VERIFIED KNOWLEDGE BASE EXCERPTS:\n${kbText}`
      : "VERIFIED KNOWLEDGE BASE EXCERPTS:\nPrioritize standard ICAR and agricultural extension recommendations for active ingredients, dosage, and cultural practices.";

    const userPrompt = [
      `Registered field crop: ${input.cropName}`,
      `Soil type: ${input.soilName}`,
      `Agro-climatic region: ${input.regionName}`,
      kbPromptSection,
      "Analyze the attached plant leaf/crop image. Diagnose any pathology or health state with high diagnostic precision.",
      "If the plant in the photo differs from the registered field crop, set crop_match: false, populate identified_crop, and provide full disease diagnosis for the observed plant.",
      "Return JSON matching the schema.",
    ].join("\n\n");

    const run = async () =>
      llmClient.completeJson({
        system: DISEASE_SYSTEM_PROMPT,
        user: userPrompt,
        imageBase64: input.imageBase64,
        mimeType: input.mimeType,
        responseSchema: DISEASE_RESPONSE_SCHEMA,
      });

    const started = Date.now();
    try {
      let raw = await run();
      let validated = await validateDiseaseLlmJson(raw, input.cropName);
      if (!validated.ok) {
        raw = await run();
        validated = await validateDiseaseLlmJson(raw, input.cropName);
      }
      const latencyMs = Date.now() - started;
      if (!validated.ok) {
        await logLlm({
          endpoint: "disease.scan",
          userId: input.userId,
          input: { crop: input.cropName, cropCycleId: input.cropCycleId },
          output: raw,
          latencyMs,
          validationStatus: "FAILED",
          flagged: true,
          errorMessage: validated.reason,
        });
        return safeDiseaseFallback();
      }
      await logLlm({
        endpoint: "disease.scan",
        userId: input.userId,
        input: { crop: input.cropName, cropCycleId: input.cropCycleId },
        output: validated.value,
        confidence: validated.value.confidence,
        latencyMs,
        validationStatus: "PASSED",
        flagged: validated.flagged,
      });
      return validated.value;
    } catch (err) {
      const latencyMs = Date.now() - started;
      await logLlm({
        endpoint: "disease.scan",
        userId: input.userId,
        input: { crop: input.cropName, cropCycleId: input.cropCycleId },
        latencyMs,
        validationStatus: "FAILED",
        flagged: true,
        errorMessage: err instanceof Error ? err.message : "llm_error",
      });
      if (err instanceof LlmUnavailableError) {
        return {
          status: "MISSING_INFORMATION",
          message:
            "Disease image analysis is not available because GEMINI_API_KEY is not configured. Image was saved. Add your Gemini key to .env to enable assessment.",
        };
      }
      if (err instanceof AppError) {
        const detail = typeof err.details === "string" ? err.details : "";
        if (detail.includes("Unable to process input image") || detail.includes("INVALID_ARGUMENT")) {
          return {
            status: "INSUFFICIENT_IMAGE_QUALITY",
            treatment_available: false,
            treatment: null,
            message: FARMER_MESSAGES.poorImage,
          };
        }
        return { status: "UNSUPPORTED", message: FARMER_MESSAGES.llmFailure };
      }
      return safeDiseaseFallback();
    }
  }
}

/** Future: dedicated classifier. Not used in V1. */
export class CustomMLDiseaseService implements DiseaseAssessmentService {
  async assess(): Promise<DiseaseAssessment> {
    return safeDiseaseFallback();
  }
}

export class HybridDiseaseService implements DiseaseAssessmentService {
  constructor(
    private readonly vision: DiseaseAssessmentService,
    _ml?: DiseaseAssessmentService,
  ) {}
  assess(input: Parameters<DiseaseAssessmentService["assess"]>[0]) {
    return this.vision.assess(input);
  }
}

export const diseaseAssessmentService: DiseaseAssessmentService = new VisionLLMDiseaseService();

export async function persistDiseaseScan(
  cropCycleId: string,
  imageKey: string,
  result: DiseaseAssessment,
) {
  return prisma.diseaseScan.create({
    data: {
      cropCycleId,
      imageKey,
      status: result.status,
      imageRelevant: result.image_relevant,
      cropMatch: result.crop_match,
      imageQualitySufficient: result.image_quality_sufficient,
      isHealthy: result.is_healthy ?? undefined,
      diseaseCommonName: result.disease_common_name,
      diseaseScientificName: result.disease_scientific_name,
      riskLevel: result.risk_level,
      treatmentJson: result.treatment ? JSON.parse(JSON.stringify(result.treatment)) : undefined,
      consequencesIfUntreated: result.consequences_if_untreated,
      precautionsJson: result.precautions ?? [],
      probableCause: result.probable_cause,
      confidence: result.confidence,
      visibleSymptomsJson: result.visible_symptoms ?? [],
      message: result.message,
    },
  });
}
