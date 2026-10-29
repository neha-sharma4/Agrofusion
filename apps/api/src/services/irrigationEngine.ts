import type { UrgencyLevel } from "@agrofusion/shared";
import { irrigationVolumeLiters } from "@agrofusion/shared";
import type { ForecastDay } from "../integrations/weatherService.js";

export type IrrigationInputs = {
  soilMoisturePct: number;
  temperatureC: number;
  humidityPct: number;
  plotAreaSqM: number;
  forecast?: ForecastDay[] | null;
  typicalDepthMm?: number | null;
};

export type DeterministicIrrigation = {
  irrigation_required: boolean;
  recommended_amount_mm: number;
  recommended_volume_liters: number;
  urgency: UrgencyLevel;
  reasoning: string;
};

function upcomingRainMm(forecast?: ForecastDay[] | null) {
  if (!forecast?.length) return null;
  return forecast.slice(0, 3).reduce((sum, d) => sum + d.rainfallMm, 0);
}

function upcomingMaxTemp(forecast?: ForecastDay[] | null) {
  if (!forecast?.length) return null;
  return Math.max(...forecast.slice(0, 3).map((d) => d.tempMaxC));
}

/**
 * Deterministic irrigation engine. LLM may suggest depth/reasoning but volume
 * and a conservative baseline always come from this function.
 */
export function computeIrrigation(inputs: IrrigationInputs): DeterministicIrrigation {
  const moisture = inputs.soilMoisturePct;
  const rain = upcomingRainMm(inputs.forecast);
  const maxTemp = upcomingMaxTemp(inputs.forecast);
  const heatNow = inputs.temperatureC >= 36;
  const heatComing = (maxTemp ?? 0) >= 38;
  const rainComing = rain !== null && rain >= 10;
  const heavyRain = rain !== null && rain >= 25;
  const baseDepth = inputs.typicalDepthMm && inputs.typicalDepthMm > 0 ? inputs.typicalDepthMm : 20;

  let urgency: UrgencyLevel;
  if (moisture < 20) urgency = "CRITICAL";
  else if (moisture < 35) urgency = "HIGH";
  else if (moisture < 55) urgency = "MEDIUM";
  else urgency = "LOW";

  if (heavyRain && moisture >= 25 && urgency !== "CRITICAL") {
    urgency = moisture < 35 ? "MEDIUM" : "LOW";
  } else if (rainComing && (urgency === "HIGH" || urgency === "MEDIUM")) {
    urgency = urgency === "HIGH" ? "MEDIUM" : "LOW";
  }

  if ((heatNow || heatComing) && moisture < 50 && urgency === "LOW") urgency = "MEDIUM";
  if ((heatNow || heatComing) && moisture < 30 && urgency === "MEDIUM") urgency = "HIGH";

  const deficitFactor = Math.max(0, (55 - moisture) / 55);
  let depth = Math.round(baseDepth * (0.35 + 0.65 * deficitFactor));
  if (urgency === "LOW") depth = rainComing ? 0 : Math.min(depth, 8);
  if (heavyRain) depth = Math.min(depth, urgency === "CRITICAL" ? 10 : 0);
  if (urgency === "CRITICAL") depth = Math.max(depth, Math.round(baseDepth * 0.8));
  depth = Math.max(0, Math.min(80, depth));

  const required = urgency === "HIGH" || urgency === "CRITICAL" || (urgency === "MEDIUM" && depth >= 10);
  if (!required) depth = urgency === "MEDIUM" ? Math.min(depth, 8) : 0;

  const volume = irrigationVolumeLiters(inputs.plotAreaSqM, depth);
  const forecastNote =
    rain === null
      ? "Short-range rainfall forecast was not available, so upcoming rain was not assumed."
      : `About ${Math.round(rain)} mm rainfall is indicated over the next few days.`;

  const reasoning = [
    `Soil moisture is ${moisture}%.`,
    heatNow || heatComing ? "Warm conditions increase crop water demand." : "Temperature is moderate.",
    forecastNote,
    required
      ? `Irrigation depth of ${depth} mm is recommended from agronomic moisture-deficit rules for this plot.`
      : "Immediate irrigation is not indicated from current moisture and forecast.",
  ].join(" ");

  return {
    irrigation_required: required && depth > 0,
    recommended_amount_mm: depth,
    recommended_volume_liters: volume,
    urgency,
    reasoning,
  };
}

export function volumeMatches(areaSqM: number, depthMm: number, claimedVolume: number, tolerance = 1) {
  const expected = irrigationVolumeLiters(areaSqM, depthMm);
  return Math.abs(expected - claimedVolume) <= tolerance;
}
