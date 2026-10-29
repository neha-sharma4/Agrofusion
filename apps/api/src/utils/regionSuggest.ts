/**
 * Approximate Planning Commission agro-climatic region from GPS.
 * Suggestion only — farmer must confirm or override.
 */
export type RegionHint = { name: string; confidence: "low" | "medium" };

export function suggestRegionFromGps(lat: number, lon: number): RegionHint | null {
  if (lat < 6 || lat > 37 || lon < 68 || lon > 98) return null;

  if (lat >= 32 && lon >= 74 && lon <= 80) return { name: "Western Himalayan Region", confidence: "medium" };
  if (lat >= 26 && lon >= 88) return { name: "Eastern Himalayan Region", confidence: "medium" };
  if (lat >= 6 && lat <= 14 && lon >= 92) return { name: "Island Region", confidence: "medium" };
  if (lat >= 23 && lat <= 32 && lon >= 74 && lon <= 77.5) return { name: "Trans-Gangetic Plains Region", confidence: "medium" };
  if (lat >= 24 && lat <= 30 && lon >= 77.5 && lon <= 82) return { name: "Upper Gangetic Plains Region", confidence: "medium" };
  if (lat >= 24 && lat <= 28 && lon >= 82 && lon <= 88) return { name: "Middle Gangetic Plains Region", confidence: "medium" };
  if (lat >= 21 && lat <= 26.5 && lon >= 86 && lon <= 89.5) return { name: "Lower Gangetic Plains Region", confidence: "medium" };
  if (lat >= 17 && lat <= 25 && lon >= 82 && lon <= 87.5) return { name: "Eastern Plateau and Hills Region", confidence: "medium" };
  if (lat >= 20 && lat <= 25 && lon >= 75 && lon <= 82) return { name: "Central Plateau and Hills Region", confidence: "medium" };
  if (lat >= 16 && lat <= 24 && lon >= 73 && lon <= 78) return { name: "Western Plateau and Hills Region", confidence: "medium" };
  if (lat >= 10 && lat <= 18 && lon >= 76 && lon <= 80.5) return { name: "Southern Plateau and Hills Region", confidence: "medium" };
  if (lat >= 10 && lat <= 20 && lon >= 80) return { name: "East Coast Plains and Hills Region", confidence: "medium" };
  if (lat >= 8 && lat <= 20 && lon >= 72.5 && lon <= 77) return { name: "West Coast Plains and Ghat Region", confidence: "medium" };
  if (lat >= 20 && lat <= 25 && lon >= 68 && lon <= 74.5) return { name: "Gujarat Plains and Hills Region", confidence: "medium" };
  if (lat >= 24 && lat <= 30 && lon >= 69 && lon <= 75) return { name: "Western Dry Region", confidence: "medium" };
  return { name: "Central Plateau and Hills Region", confidence: "low" };
}
