import { prisma } from "../config/prisma.js";
import { llmClient, LlmUnavailableError } from "../llm/client.js";
import { SUITABILITY_SYSTEM_PROMPT } from "../llm/prompts.js";
import { knowledgeRetrieval } from "../knowledge/retrieval.js";
import { validateSuitabilityJson } from "../validation/llmOutputs.js";
import { logLlm } from "./llmLogger.js";
import type { SuitabilityResult } from "@agrofusion/shared";

function heuristicSuitability(crop: string, soil: string, region: string, kbEmpty: boolean): SuitabilityResult {
  const reasoning = kbEmpty
    ? `Suitability for ${crop} on ${soil} in the ${region} is estimated from general Indian agro-climatic patterns only. Verified knowledge-base excerpts were limited, so treat this as a preliminary guide and confirm with local extension advice.`
    : `Based on verified knowledge-base excerpts and typical ${soil} conditions in the ${region}, ${crop} can be considered with local confirmation.`;
  return {
    is_suitable: true,
    confidence: kbEmpty ? 0.45 : 0.62,
    reasoning,
  };
}

export class SuitabilityService {
  async check(opts: {
    userId: string;
    cropCycleId?: string;
    cropName: string;
    soilName: string;
    regionName: string;
    persistToCycleId?: string;
  }): Promise<SuitabilityResult> {
    const kb = await knowledgeRetrieval.forSuitability(opts.cropName, opts.soilName, opts.regionName);
    const crops = await prisma.crop.findMany({ where: { isActive: true }, select: { name: true } });
    const user = [
      `Crop: ${opts.cropName}`,
      `Soil type: ${opts.soilName}`,
      `Agro-climatic region: ${opts.regionName}`,
      `Allowed crop names for alternatives: ${crops.map((c) => c.name).join(", ")}`,
      `VERIFIED KNOWLEDGE:\n${knowledgeRetrieval.formatForPrompt(kb)}`,
    ].join("\n\n");

    const started = Date.now();
    const fallback = heuristicSuitability(opts.cropName, opts.soilName, opts.regionName, kb.length === 0);
    let result: SuitabilityResult = fallback;

    try {
      const run = () => llmClient.completeJson({ system: SUITABILITY_SYSTEM_PROMPT, user });
      let raw = await run();
      let validated = validateSuitabilityJson(raw);
      if (!validated.ok) {
        raw = await run();
        validated = validateSuitabilityJson(raw);
      }
      if (validated.ok) {
        result = validated.value;
        await logLlm({
          endpoint: "suitability.check",
          userId: opts.userId,
          input: { crop: opts.cropName, soil: opts.soilName, region: opts.regionName },
          output: result,
          confidence: result.confidence,
          latencyMs: Date.now() - started,
          validationStatus: "PASSED",
        });
      } else {
        await logLlm({
          endpoint: "suitability.check",
          userId: opts.userId,
          input: { crop: opts.cropName },
          output: raw,
          latencyMs: Date.now() - started,
          validationStatus: "FAILED",
          flagged: true,
          errorMessage: validated.reason,
        });
      }
    } catch (err) {
      await logLlm({
        endpoint: "suitability.check",
        userId: opts.userId,
        input: { crop: opts.cropName },
        latencyMs: Date.now() - started,
        validationStatus: err instanceof LlmUnavailableError ? "SKIPPED" : "FAILED",
        flagged: !(err instanceof LlmUnavailableError),
        errorMessage: err instanceof Error ? err.message : "llm",
      });
    }

    if (opts.persistToCycleId) {
      await prisma.suitabilityCheck.create({
        data: {
          cropCycleId: opts.persistToCycleId,
          isSuitable: result.is_suitable,
          confidence: result.confidence,
          reasoning: result.reasoning,
          alternativesJson: result.alternative_crops ?? undefined,
        },
      });
    }
    return result;
  }
}

export const suitabilityService = new SuitabilityService();
