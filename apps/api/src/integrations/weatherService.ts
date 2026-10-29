import { env } from "../config/env.js";

export type WeatherSnapshot = {
  temperatureC: number;
  humidityPct: number;
  source: "api";
};

export type ForecastDay = {
  date: string;
  rainfallMm: number;
  tempMaxC: number;
  tempMinC: number;
};

export type WeatherBundle = {
  current: WeatherSnapshot;
  forecast: ForecastDay[];
  locationName?: string;
};

export class WeatherService {
  isConfigured() {
    return Boolean(env.WEATHER_API_KEY);
  }

  async reverseGeocode(lat: number, lon: number): Promise<string | null> {
    if (!env.WEATHER_API_KEY) return null;
    try {
      const geoUrl = `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${env.WEATHER_API_KEY}`;
      const res = await fetch(geoUrl);
      if (!res.ok) return null;
      const list = (await res.json()) as Array<{ name?: string; state?: string; country?: string }>;
      if (Array.isArray(list) && list.length > 0) {
        const item = list[0];
        const country = item.country === "IN" ? "India" : (item.country ?? "");
        const parts = [item.name, item.state, country].filter(Boolean);
        return parts.length > 0 ? parts.join(", ") : null;
      }
    } catch (err) {
      console.warn("reverse geocode failed", err);
    }
    return null;
  }

  async fetch(lat: number, lon: number): Promise<WeatherBundle | null> {
    if (!env.WEATHER_API_KEY) return null;
    try {
      const currentUrl = `${env.WEATHER_API_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${env.WEATHER_API_KEY}&units=metric`;
      const forecastUrl = `${env.WEATHER_API_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${env.WEATHER_API_KEY}&units=metric`;
      const [currentRes, forecastRes, resolvedLocation] = await Promise.all([
        fetch(currentUrl),
        fetch(forecastUrl),
        this.reverseGeocode(lat, lon),
      ]);
      if (!currentRes.ok) return null;
      const currentJson = (await currentRes.json()) as {
        name?: string;
        sys?: { country?: string };
        main?: { temp?: number; humidity?: number };
      };
      const temp = currentJson.main?.temp;
      const humidity = currentJson.main?.humidity;
      if (typeof temp !== "number" || typeof humidity !== "number") return null;

      let locationName = resolvedLocation ?? undefined;
      if (!locationName && currentJson.name) {
        const country = currentJson.sys?.country === "IN" ? "India" : (currentJson.sys?.country ?? "");
        locationName = [currentJson.name, country].filter(Boolean).join(", ");
      }

      const forecast: ForecastDay[] = [];
      if (forecastRes.ok) {
        const forecastJson = (await forecastRes.json()) as {
          list?: { dt_txt?: string; main?: { temp_max?: number; temp_min?: number }; rain?: { "3h"?: number } }[];
        };
        const byDay = new Map<string, ForecastDay>();
        for (const item of forecastJson.list ?? []) {
          const date = (item.dt_txt ?? "").slice(0, 10);
          if (!date) continue;
          const existing = byDay.get(date) ?? { date, rainfallMm: 0, tempMaxC: -Infinity, tempMinC: Infinity };
          existing.rainfallMm += item.rain?.["3h"] ?? 0;
          existing.tempMaxC = Math.max(existing.tempMaxC, item.main?.temp_max ?? existing.tempMaxC);
          existing.tempMinC = Math.min(existing.tempMinC, item.main?.temp_min ?? existing.tempMinC);
          byDay.set(date, existing);
        }
        forecast.push(...[...byDay.values()].slice(0, 5).map((d) => ({
          ...d,
          rainfallMm: Math.round(d.rainfallMm * 10) / 10,
          tempMaxC: Number.isFinite(d.tempMaxC) ? Math.round(d.tempMaxC * 10) / 10 : 0,
          tempMinC: Number.isFinite(d.tempMinC) ? Math.round(d.tempMinC * 10) / 10 : 0,
        })));
      }

      return {
        current: { temperatureC: Math.round(temp * 10) / 10, humidityPct: humidity, source: "api" },
        forecast,
        locationName,
      };
    } catch (err) {
      console.error("weather fetch failed", err);
      return null;
    }
  }
}

export const weatherService = new WeatherService();
