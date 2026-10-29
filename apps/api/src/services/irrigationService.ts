import { irrigationVolumeLiters } from "@agrofusion/shared";
import { prisma } from "../config/prisma.js";
import { llmClient, LlmUnavailableError } from "../llm/client.js";
import { IRRIGATION_SYSTEM_PROMPT } from "../llm/prompts.js";
import { knowledgeRetrieval } from "../knowledge/retrieval.js";
import { validateIrrigationLlmJson } from "../validation/llmOutputs.js";
import { computeIrrigation } from "./irrigationEngine.js";
import { logLlm } from "./llmLogger.js";
import type { ForecastDay } from "../integrations/weatherService.js";
import type { IrrigationResult } from "@agrofusion/shared";

export class IrrigationService {
  async recommend(opts: {
    userId: string;
    cropCycleId: string;
    cropName: string;
    soilName: string;
    regionName: string;
    growthStageId: string;
    growthStageName: string;
    soilMoisturePct: number;
    temperatureC: number;
    humidityPct: number;
    plotAreaSqM: number;
    forecast: ForecastDay[] | null;
    weatherAutoFetched: boolean;
  }): Promise<IrrigationResult & { moistureWarning?: string }> {
    const typicalDepthMm = await knowledgeRetrieval.typicalDepth(opts.cropName, opts.soilName);
    const moistureNote = await knowledgeRetrieval.moistureNote(opts.cropName, opts.soilName);
    const baseline = computeIrrigation({
      soilMoisturePct: opts.soilMoisturePct,
      temperatureC: opts.temperatureC,
      humidityPct: opts.humidityPct,
      plotAreaSqM: opts.plotAreaSqM,
      forecast: opts.forecast,
      typicalDepthMm,
    });

    const kb = await knowledgeRetrieval.forIrrigation(opts.cropName, opts.soilName);
    const user = [
      `Crop: ${opts.cropName}`,
      `Soil: ${opts.soilName}`,
      `Region: ${opts.regionName}`,
      `Growth stage: ${opts.growthStageName}`,
      `Soil moisture %: ${opts.soilMoisturePct}`,
      `Temperature C: ${opts.temperatureC}`,
      `Humidity %: ${opts.humidityPct}`,
      `Plot area m2: ${opts.plotAreaSqM}`,
      opts.forecast
        ? `Short-range forecast JSON: ${JSON.stringify(opts.forecast)}`
        : "Short-range forecast: not available (do not invent).",
      `Deterministic baseline (do not ignore safety): ${JSON.stringify(baseline)}`,
      `VERIFIED KNOWLEDGE:\n${knowledgeRetrieval.formatForPrompt(kb)}`,
      "Recommend depth in mm. Backend will compute volume. Keep depth between 0 and 80 mm.",
    ].join("\n");

    let result: IrrigationResult = { ...baseline };
    const started = Date.now();
    try {
      const run = () => llmClient.completeJson({ system: IRRIGATION_SYSTEM_PROMPT, user });
      let raw = await run();
      let validated = validateIrrigationLlmJson(raw, opts.plotAreaSqM);
      if (!validated.ok) {
        raw = await run();
        validated = validateIrrigationLlmJson(raw, opts.plotAreaSqM);
      }
      if (validated.ok) {
        const depth = validated.value.recommended_amount_mm;
        result = {
          ...validated.value,
          recommended_amount_mm: depth,
          recommended_volume_liters: irrigationVolumeLiters(opts.plotAreaSqM, depth),
          irrigation_required: validated.value.irrigation_required && depth > 0,
        };
        await logLlm({
          endpoint: "irrigation.recommend",
          userId: opts.userId,
          input: { cropCycleId: opts.cropCycleId, moisture: opts.soilMoisturePct },
          output: result,
          latencyMs: Date.now() - started,
          validationStatus: "PASSED",
        });
      } else {
        await logLlm({
          endpoint: "irrigation.recommend",
          userId: opts.userId,
          input: { cropCycleId: opts.cropCycleId },
          output: raw,
          latencyMs: Date.now() - started,
          validationStatus: "FAILED",
          flagged: true,
          errorMessage: validated.reason,
        });
      }
    } catch (err) {
      await logLlm({
        endpoint: "irrigation.recommend",
        userId: opts.userId,
        input: { cropCycleId: opts.cropCycleId },
        latencyMs: Date.now() - started,
        validationStatus: err instanceof LlmUnavailableError ? "SKIPPED" : "FAILED",
        flagged: !(err instanceof LlmUnavailableError),
        errorMessage: err instanceof Error ? err.message : "llm",
      });
    }

    await prisma.irrigationRecommendation.create({
      data: {
        cropCycleId: opts.cropCycleId,
        growthStageId: opts.growthStageId,
        soilMoisturePct: opts.soilMoisturePct,
        temperatureC: opts.temperatureC,
        humidityPct: opts.humidityPct,
        forecastJson: opts.forecast ?? undefined,
        plotAreaSqM: opts.plotAreaSqM,
        recommendedAmountMm: result.recommended_amount_mm,
        recommendedVolumeLiters: result.recommended_volume_liters,
        irrigationRequired: result.irrigation_required,
        urgency: result.urgency,
        reasoning: result.reasoning,
        weatherAutoFetched: opts.weatherAutoFetched,
      },
    });

    return {
      ...result,
      moistureWarning: moistureNote ?? undefined,
    };
  }
}

export const irrigationService = new IrrigationService();
