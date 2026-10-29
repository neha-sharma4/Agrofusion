// AgroFusion AI — Agronomic Visual & Photographic Asset Registry
// High-resolution, curated agricultural photography & visual textures

export const AGRI_HERO_IMAGES = {
  // Aerial drone view of lush precision-farmed emerald fields
  fieldsDashboard:
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1600&q=80",
  // Sunrise over crop rows with telemetry horizon
  fieldCockpit:
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80",
  // Precision center-pivot irrigation water spray over crops
  irrigationAdvisory:
    "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=1600&q=80",
  // High-resolution macro leaf veins and plant biology
  diseaseScan:
    "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=1600&q=80",
  // Fertile agricultural dark loam soil texture
  soilSurvey:
    "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80",
  // Smart farming / farmer surveying healthy green crops
  authPortal:
    "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1600&q=80",
  // Terraced emerald green rice paddy
  terracedPaddy:
    "https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=1200&q=80",
  // Golden ripe wheat field
  wheatField:
    "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=1200&q=80",
};

// Curated crop photography mapped to crop species
const CROP_IMAGES: Record<string, string> = {
  rice: "https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=900&q=80",
  paddy: "https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=900&q=80",
  wheat: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=900&q=80",
  maize: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=900&q=80",
  corn: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=900&q=80",
  banana: "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=900&q=80",
  cotton: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=900&q=80",
  sugarcane: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=900&q=80",
  potato: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=900&q=80",
  tomato: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=900&q=80",
  onion: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=900&q=80",
  soybean: "https://images.unsplash.com/photo-1594489428504-5c0c480a15fd?auto=format&fit=crop&w=900&q=80",
  mustard: "https://images.unsplash.com/photo-1508873696983-2df57046475a?auto=format&fit=crop&w=900&q=80",
  sunflower: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=900&q=80",
  mango: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=900&q=80",
  chilli: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=900&q=80",
  tea: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=80",
  coffee: "https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?auto=format&fit=crop&w=900&q=80",
  grapes: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=900&q=80",
  apple: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=900&q=80",
  groundnut: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=900&q=80",
  chickpea: "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=900&q=80",
  lentil: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=900&q=80",
  cucumber: "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&w=900&q=80",
};

export function getCropImageUrl(cropName?: string): string {
  if (!cropName) {
    return "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80";
  }
  const normalized = cropName.toLowerCase().trim();
  for (const [key, url] of Object.entries(CROP_IMAGES)) {
    if (normalized.includes(key)) {
      return url;
    }
  }
  // Fallback to high-quality lush crop field
  return "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80";
}

// Curated soil imagery
const SOIL_IMAGES: Record<string, string> = {
  alluvial: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80",
  black: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80",
  regur: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80",
  red: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
  laterite: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
  sandy: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
  arid: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
  mountain: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
};

export function getSoilImageUrl(soilName?: string): string {
  if (!soilName) {
    return "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80";
  }
  const normalized = soilName.toLowerCase().trim();
  for (const [key, url] of Object.entries(SOIL_IMAGES)) {
    if (normalized.includes(key)) {
      return url;
    }
  }
  return "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80";
}
