import path from "node:path";
import { config as loadEnv } from "dotenv";
import { prisma } from "../src/config/prisma.js";

loadEnv({ path: path.resolve(process.cwd(), ".env") });
loadEnv({ path: path.resolve(process.cwd(), "../../.env") });

const CROPS: { name: string; nameLocal: string; category: string }[] = [
  { name: "Rice", nameLocal: "धान / चावल", category: "Cereal" },
  { name: "Wheat", nameLocal: "गेहूँ", category: "Cereal" },
  { name: "Maize", nameLocal: "मक्का", category: "Cereal" },
  { name: "Sorghum", nameLocal: "ज्वार", category: "Cereal" },
  { name: "Pearl Millet", nameLocal: "बाजरा", category: "Cereal" },
  { name: "Finger Millet", nameLocal: "रागी", category: "Cereal" },
  { name: "Barley", nameLocal: "जौ", category: "Cereal" },
  { name: "Chickpea", nameLocal: "चना", category: "Pulse" },
  { name: "Pigeon Pea", nameLocal: "अरहर", category: "Pulse" },
  { name: "Green Gram", nameLocal: "मूंग", category: "Pulse" },
  { name: "Black Gram", nameLocal: "उड़द", category: "Pulse" },
  { name: "Lentil", nameLocal: "मसूर", category: "Pulse" },
  { name: "Field Pea", nameLocal: "मटर", category: "Pulse" },
  { name: "Groundnut", nameLocal: "मूंगफली", category: "Oilseed" },
  { name: "Soybean", nameLocal: "सोयाबीन", category: "Oilseed" },
  { name: "Mustard", nameLocal: "सरसों", category: "Oilseed" },
  { name: "Sunflower", nameLocal: "सूरजमुखी", category: "Oilseed" },
  { name: "Sesame", nameLocal: "तिल", category: "Oilseed" },
  { name: "Cotton", nameLocal: "कपास", category: "Fibre" },
  { name: "Sugarcane", nameLocal: "गन्ना", category: "Cash" },
  { name: "Jute", nameLocal: "जूट", category: "Fibre" },
  { name: "Potato", nameLocal: "आलू", category: "Vegetable" },
  { name: "Tomato", nameLocal: "टमाटर", category: "Vegetable" },
  { name: "Onion", nameLocal: "प्याज", category: "Vegetable" },
  { name: "Brinjal", nameLocal: "बैंगन", category: "Vegetable" },
  { name: "Chilli", nameLocal: "मिर्च", category: "Vegetable" },
  { name: "Okra", nameLocal: "भिंडी", category: "Vegetable" },
  { name: "Cabbage", nameLocal: "पत्ता गोभी", category: "Vegetable" },
  { name: "Cauliflower", nameLocal: "फूल गोभी", category: "Vegetable" },
  { name: "Cucumber", nameLocal: "खीरा", category: "Vegetable" },
  { name: "Bottle Gourd", nameLocal: "लौकी", category: "Vegetable" },
  { name: "Pumpkin", nameLocal: "कद्दू", category: "Vegetable" },
  { name: "Watermelon", nameLocal: "तरबूज", category: "Vegetable" },
  { name: "Mango", nameLocal: "आम", category: "Fruit" },
  { name: "Banana", nameLocal: "केला", category: "Fruit" },
  { name: "Guava", nameLocal: "अमरूद", category: "Fruit" },
  { name: "Papaya", nameLocal: "पपीता", category: "Fruit" },
  { name: "Citrus", nameLocal: "नींबू वर्गीय", category: "Fruit" },
  { name: "Apple", nameLocal: "सेब", category: "Fruit" },
  { name: "Grapes", nameLocal: "अंगूर", category: "Fruit" },
  { name: "Coconut", nameLocal: "नारियल", category: "Plantation" },
  { name: "Tea", nameLocal: "चाय", category: "Plantation" },
  { name: "Coffee", nameLocal: "कॉफी", category: "Plantation" },
  { name: "Turmeric", nameLocal: "हल्दी", category: "Spice" },
  { name: "Ginger", nameLocal: "अदरक", category: "Spice" },
  { name: "Cardamom", nameLocal: "इलायची", category: "Spice" },
];

const SOILS = [
  { name: "Alluvial", nameLocal: "जलोढ़" },
  { name: "Black/Regur", nameLocal: "काली / रेगुर" },
  { name: "Red", nameLocal: "लाल" },
  { name: "Laterite", nameLocal: "लेटराइट" },
  { name: "Arid/Desert", nameLocal: "शुष्क / रेगिस्तानी" },
  { name: "Mountain", nameLocal: "पर्वतीय" },
  { name: "Saline/Alkaline", nameLocal: "लवणीय / क्षारीय" },
  { name: "Peaty/Marshy", nameLocal: "पीटी / दलदली" },
];

const REGIONS = [
  { name: "Western Himalayan Region", nameLocal: "पश्चिमी हिमालय", statesCovered: "J&K, HP, Uttarakhand hills" },
  { name: "Eastern Himalayan Region", nameLocal: "पूर्वी हिमालय", statesCovered: "Sikkim, Arunachal, Darjeeling, NE hills" },
  { name: "Lower Gangetic Plains Region", nameLocal: "निचला गंगा मैदान", statesCovered: "West Bengal, parts of Bihar" },
  { name: "Middle Gangetic Plains Region", nameLocal: "मध्य गंगा मैदान", statesCovered: "E UP, Bihar" },
  { name: "Upper Gangetic Plains Region", nameLocal: "ऊपरी गंगा मैदान", statesCovered: "Central/western UP" },
  { name: "Trans-Gangetic Plains Region", nameLocal: "पार-गंगा मैदान", statesCovered: "Punjab, Haryana, Delhi, N Rajasthan" },
  { name: "Eastern Plateau and Hills Region", nameLocal: "पूर्वी पठार एवं पहाड़ियाँ", statesCovered: "Jharkhand, Chhattisgarh, Odisha inland" },
  { name: "Central Plateau and Hills Region", nameLocal: "मध्य पठार एवं पहाड़ियाँ", statesCovered: "MP, Bundelkhand, SE Rajasthan" },
  { name: "Western Plateau and Hills Region", nameLocal: "पश्चिमी पठार एवं पहाड़ियाँ", statesCovered: "Maharashtra plateau" },
  { name: "Southern Plateau and Hills Region", nameLocal: "दक्षिणी पठार एवं पहाड़ियाँ", statesCovered: "Interior TN, Karnataka, AP/Telangana" },
  { name: "East Coast Plains and Hills Region", nameLocal: "पूर्वी तट मैदान एवं पहाड़ियाँ", statesCovered: "Coastal AP, Odisha, TN east" },
  { name: "West Coast Plains and Ghat Region", nameLocal: "पश्चिमी तट मैदान एवं घाट", statesCovered: "Konkan, Kerala, coastal Karnataka" },
  { name: "Gujarat Plains and Hills Region", nameLocal: "गुजरात मैदान एवं पहाड़ियाँ", statesCovered: "Gujarat" },
  { name: "Western Dry Region", nameLocal: "पश्चिमी शुष्क क्षेत्र", statesCovered: "Rajasthan desert" },
  { name: "Island Region", nameLocal: "द्वीप क्षेत्र", statesCovered: "Andaman & Nicobar, Lakshadweep" },
];

const STAGES = ["Germination", "Seedling", "Vegetative Growth", "Flowering/Reproductive", "Maturity/Ripening"];

async function main() {
  for (const s of SOILS) {
    await prisma.soilType.upsert({ where: { name: s.name }, update: { nameLocal: s.nameLocal }, create: s });
  }
  for (const r of REGIONS) {
    await prisma.agroClimaticRegion.upsert({
      where: { name: r.name },
      update: { nameLocal: r.nameLocal, statesCovered: r.statesCovered },
      create: r,
    });
  }
  const cropIds: Record<string, string> = {};
  for (const c of CROPS) {
    const row = await prisma.crop.upsert({
      where: { name: c.name },
      update: { nameLocal: c.nameLocal, category: c.category },
      create: c,
    });
    cropIds[c.name] = row.id;
    for (let i = 0; i < STAGES.length; i++) {
      const name = STAGES[i];
      const existing = await prisma.growthStage.findFirst({
        where: { cropId: row.id, name },
      });
      if (!existing) {
        await prisma.growthStage.create({
          data: { cropId: row.id, name, sortOrder: i + 1 },
        });
      }
    }
  }

  for (let i = 0; i < STAGES.length; i++) {
    const name = STAGES[i];
    const existing = await prisma.growthStage.findFirst({
      where: { cropId: null, name },
    });
    if (!existing) {
      await prisma.growthStage.create({
        data: { cropId: null, name, sortOrder: i + 1 },
      });
    }
  }

  await seedKnowledge(cropIds);
  console.info("Master data and verified knowledge base seeded.");
}

async function seedKnowledge(cropIds: Record<string, string>) {
  const items = [
    {
      category: "SUITABILITY" as const,
      cropId: cropIds.Rice,
      title: "Rice on alluvial soils in Gangetic and coastal plains",
      content:
        "Transplanted rice is widely recommended for alluvial and deltaic soils of the Lower, Middle and Upper Gangetic Plains and East/West Coast plains with assured water. Poorly drained saline patches need gypsum/drainage as per local soil-health cards. Upland rice is less suited to arid western dry region without irrigation.",
      sourceName: "ICAR-NRRI / IIRR rice production guidance",
      sourceUrl: "https://icar-nrri.in/",
      soilTypeName: "Alluvial",
      regionName: "Lower Gangetic Plains Region",
    },
    {
      category: "SUITABILITY" as const,
      cropId: cropIds.Wheat,
      title: "Wheat in Trans-Gangetic and Upper Gangetic plains",
      content:
        "Wheat is a major rabi cereal of the Trans-Gangetic and Upper Gangetic plains on alluvial soils with cool winters. It is less suitable as a principal crop in the Island Region and high-rainfall West Coast without irrigation scheduling. Black soils of central India also support wheat where winter temperatures allow.",
      sourceName: "ICAR-IIWBR wheat production package",
      sourceUrl: "https://iiwbr.icar.gov.in/",
      soilTypeName: "Alluvial",
      regionName: "Trans-Gangetic Plains Region",
    },
    {
      category: "SUITABILITY" as const,
      cropId: cropIds.Cotton,
      title: "Cotton on black (regur) soils of western and central plateaus",
      content:
        "Rainfed and irrigated cotton is traditionally recommended on deep black/regur soils of the Western and Central Plateau and Hills and Gujarat plains. Sandy desert soils of the Western Dry Region are poorly suited without intensive irrigation and soil amendment.",
      sourceName: "ICAR-CICR cotton cultivation guidance",
      sourceUrl: "https://cicr.org.in/",
      soilTypeName: "Black/Regur",
      regionName: "Western Plateau and Hills Region",
    },
    {
      category: "SUITABILITY" as const,
      cropId: cropIds.Tomato,
      title: "Tomato across well-drained soils; avoid waterlogging",
      content:
        "Tomato performs on well-drained alluvial, red and black soils with pH roughly 6.0–7.5 as described in IIVR/TNAU vegetable guides. Waterlogged peaty/marshy soils and strongly saline soils are generally unsuitable without reclamation. Hill regions can grow tomato in appropriate seasons.",
      sourceName: "ICAR-IIVR / TNAU Agritech tomato crop production",
      sourceUrl: "https://agritech.tnau.ac.in/",
      soilTypeName: "Red",
    },
    {
      category: "IRRIGATION" as const,
      cropId: cropIds.Rice,
      title: "Rice irrigation depth reference",
      content:
        "Paddy generally needs standing or saturated soil during critical stages; upland rice uses lighter, more frequent irrigations. Typical supplemental irrigation depths in transplanted rice after drainage are on the order of 3–7 cm depending on soil texture and rainfall, per state PoP. Always adjust to local rainfall forecast.",
      sourceName: "State package of practices / ICAR rice water management summaries",
      sourceUrl: "https://icar-nrri.in/",
      typicalDepthMm: 50,
      moistureNote: "Values below 20% in puddled rice or above 90% in upland rice may be unusual depending on system.",
    },
    {
      category: "IRRIGATION" as const,
      cropId: cropIds.Wheat,
      title: "Wheat irrigation depth reference",
      content:
        "Wheat commonly receives 4–6 irrigations in north-west plains depending on rainfall, with CRI (crown root initiation) as a critical stage. Individual irrigations are often about 5–7 cm (50–70 mm) on alluvial soils. Skip or delay irrigation if substantial rain is forecast.",
      sourceName: "ICAR-IIWBR / state wheat PoP",
      sourceUrl: "https://iiwbr.icar.gov.in/",
      typicalDepthMm: 60,
      moistureNote: "Soil moisture above 80% at sowing or below 15% at CRI may be unusual; confirm measurement method.",
    },
    {
      category: "IRRIGATION" as const,
      cropId: cropIds.Tomato,
      title: "Tomato irrigation depth reference",
      content:
        "Tomato needs regular moisture especially at flowering and fruiting. Drip irrigation with frequent small depths is preferred over heavy flooding. Typical drip applications are often in the 10–25 mm range per event depending on ET and stage; furrow irrigation uses larger depths but risks disease.",
      sourceName: "ICAR-IIVR vegetable production / TNAU tomato irrigation notes",
      sourceUrl: "https://iivr.icar.gov.in/",
      typicalDepthMm: 20,
      moistureNote: "Readings below 15% or above 85% in drip-fertigated beds may indicate a sensor or entry issue.",
    },
    {
      category: "DISEASE" as const,
      cropId: cropIds.Rice,
      diseaseKey: "rice-blast",
      diseaseCommonName: "Rice blast",
      diseaseScientificName: "Pyricularia oryzae (Magnaporthe oryzae)",
      title: "Rice blast — verified extension summary",
      content:
        "Leaf blast shows diamond-shaped grey centres with brown margins; neck blast can girdle the panicle neck. Favourable conditions include prolonged leaf wetness, high humidity and susceptible varieties. Diagnosis from a single photo is preliminary only.",
      sourceName: "IRRI Rice Knowledge Bank / ICAR-NRRI disease management notes",
      sourceUrl: "https://www.rkb.irri.org/",
      medicineName: "Tricyclazole 75% WP (use only if listed in current CIBRC / state PoP for the crop)",
      dosage: "As per current approved label and state package of practices (commonly cited as 0.6 g/L water in older PoP — verify latest label)",
      applicationMethod: "Foliar spray covering both leaf surfaces; follow PPE and pre-harvest interval on the approved label",
      timingFrequency: "At first confirmed symptoms or as preventive spray in endemic areas per local advisory; do not exceed label frequency",
      precautionsJson: [
        "Confirm with local plant protection officer before spraying",
        "Do not mix unapproved chemicals",
        "Observe waiting period before harvest",
      ],
      consequencesIfUntreated:
        "Neck blast can cause severe yield loss by choking grain filling; leaf blast reduces photosynthetic area.",
      probableCause: "Infection by Pyricularia oryzae favoured by wet leaves, dense canopy and susceptible variety.",
    },
    {
      category: "DISEASE" as const,
      cropId: cropIds.Wheat,
      diseaseKey: "wheat-stripe-rust",
      diseaseCommonName: "Stripe rust (yellow rust)",
      diseaseScientificName: "Puccinia striiformis f. sp. tritici",
      title: "Wheat stripe rust — verified extension summary",
      content:
        "Yellow-orange pustules in stripes on leaves. Cool, humid weather favours epidemics in north-west India. Use resistant varieties as primary control. Photo-based ID cannot replace field scouting.",
      sourceName: "ICAR-IIWBR rust advisory / DWR disease management",
      sourceUrl: "https://iiwbr.icar.gov.in/",
      medicineName: "Propiconazole 25% EC (only if currently approved for wheat rusts on CIBRC label)",
      dosage: "Follow the current approved product label (historical PoP often cites 0.1% solution — confirm latest recommendation)",
      applicationMethod: "Foliar spray at first appearance as advised by local rust advisory",
      timingFrequency: "As per rust surveillance bulletins; avoid unnecessary repeat sprays",
      precautionsJson: ["Use resistant varieties", "Monitor IIWBR/state rust alerts", "Follow label PPE"],
      consequencesIfUntreated: "Severe epidemics can cause large yield losses on susceptible cultivars.",
      probableCause: "Airborne rust fungus favoured by cool temperatures and leaf wetness.",
    },
    {
      category: "DISEASE" as const,
      cropId: cropIds.Tomato,
      diseaseKey: "tomato-early-blight",
      diseaseCommonName: "Early blight",
      diseaseScientificName: "Alternaria solani",
      title: "Tomato early blight — verified extension summary",
      content:
        "Concentric ring spots (target spots) on older leaves, often with chlorosis; can progress to stem and fruit. Warm, humid weather and leftover crop debris favour disease. Distinguish carefully from late blight which has different lesions.",
      sourceName: "TNAU Agritech Portal — Tomato diseases / ICAR-IIVR",
      sourceUrl: "https://agritech.tnau.ac.in/crop_protection/crop_prot_crop_insect_veg_tomato.html",
      medicineName: "Mancozeb 75% WP (only if listed for tomato early blight on current approved label)",
      dosage: "As per current CIBRC / state PoP label (commonly published as 2–2.5 g/L in extension literature — verify before use)",
      applicationMethod: "Foliar spray with good coverage of lower canopy; rotate modes of action",
      timingFrequency: "At first symptoms and repeat only as per label and weather",
      precautionsJson: [
        "Remove infected lower leaves",
        "Avoid overhead irrigation in evening",
        "Do not invent mixing partners not on the label",
      ],
      consequencesIfUntreated: "Defoliation reduces fruit size and exposes fruit to sunscald; yield and quality decline.",
      probableCause: "Alternaria solani surviving on debris and spreading in warm humid weather.",
    },
    {
      category: "DISEASE" as const,
      cropId: cropIds.Tomato,
      diseaseKey: "tomato-late-blight",
      diseaseCommonName: "Late blight",
      diseaseScientificName: "Phytophthora infestans",
      title: "Tomato late blight — verified extension summary",
      content:
        "Water-soaked lesions that rapidly enlarge, often with white fungal growth on undersides in moist weather; can destroy foliage and fruit quickly. Cool, wet weather is highly favourable. Immediate expert confirmation is advised because of epidemic risk.",
      sourceName: "ICAR-IIVR / TNAU tomato disease management",
      sourceUrl: "https://iivr.icar.gov.in/",
      medicineName: "Metalaxyl 8% + Mancozeb 64% WP (cymoxanil/mancozeb mixes also appear in PoP — use only currently approved tomato late-blight products)",
      dosage: "Strictly as per the approved label for the chosen product; do not copy historic rates without checking current registration",
      applicationMethod: "Protective/systemic foliar spray with full coverage at first warning or symptoms",
      timingFrequency: "Short intervals in wet weather as per label; stop if harvest interval cannot be met",
      precautionsJson: ["Destroy volunteer plants", "Avoid working in wet fields", "Seek KVK confirmation in outbreaks"],
      consequencesIfUntreated: "Can destroy the crop within days under cool wet conditions.",
      probableCause: "Phytophthora infestans favoured by leaf wetness and moderate temperatures.",
    },
    {
      category: "DISEASE" as const,
      cropId: cropIds.Potato,
      diseaseKey: "potato-late-blight",
      diseaseCommonName: "Late blight",
      diseaseScientificName: "Phytophthora infestans",
      title: "Potato late blight — verified extension summary",
      content:
        "Irregular water-soaked leaf lesions, white growth beneath leaves in humid weather, and tuber rot in storage. National late blight advisories from CPRI should be followed for timing.",
      sourceName: "ICAR-CPRI late blight advisory",
      sourceUrl: "https://cpri.icar.gov.in/",
      medicineName: "Mancozeb 75% WP or Metalaxyl 8% + Mancozeb 64% WP",
      dosage: "2 g/L water (Mancozeb) or 2.5 g/L (Metalaxyl mix) as per label",
      applicationMethod: "Foliar spray starting at disease warning; ensure under-leaf coverage",
      timingFrequency: "As per CPRI/state late blight bulletins",
      precautionsJson: ["Plant healthy seed tubers", "Hill up to protect tubers", "Do not store blighted tubers"],
      consequencesIfUntreated: "Can cause complete haulm death and tuber rot.",
      probableCause: "Phytophthora infestans under cool moist weather.",
    },
    {
      category: "DISEASE" as const,
      cropId: cropIds.Groundnut,
      diseaseKey: "groundnut-tikka-leaf-spot",
      diseaseCommonName: "Tikka Disease (Early & Late Leaf Spot)",
      diseaseScientificName: "Cercospora arachidicola / Phaeoisariopsis personata",
      title: "Groundnut Tikka disease (leaf spot) — verified ICAR package",
      content:
        "Tikka disease is characterized by circular to irregular dark brown/black necrotic spots surrounded by bright yellow halos on upper and lower leaf surfaces. Severe infection leads to extensive chlorosis, leaflet shedding, and premature defoliation.",
      sourceName: "ICAR-Directorate of Groundnut Research (ICAR-DGR) / TNAU Agritech",
      sourceUrl: "https://dgr.icar.gov.in/",
      medicineName: "Carbendazim 12% + Mancozeb 63% WP (SAAF) or Chlorothalonil 75% WP",
      dosage: "1.5 to 2.0 g per litre of water (foliar spray)",
      applicationMethod: "Foliar spray with uniform coverage on both surfaces of the canopy",
      timingFrequency: "First spray at 30–40 days after sowing or at first symptom sighting; repeat after 14–15 days if humid conditions persist",
      precautionsJson: [
        "Practice crop rotation with cereals such as Sorghum or Pearl Millet",
        "Collect and destroy diseased crop debris post-harvest",
        "Avoid overhead sprinkler irrigation during late evenings",
        "Maintain recommended plant density for adequate canopy ventilation",
      ],
      consequencesIfUntreated:
        "Premature defoliation drastically reduces photosynthetic area, resulting in poorly filled pods, kernel shriveling, and up to 50% yield reduction.",
      probableCause:
        "Fungal infection by Cercospora arachidicola and Phaeoisariopsis personata favored by high relative humidity (>85%), leaf wetness, and temperatures between 25–30°C.",
    },
    {
      category: "DISEASE" as const,
      cropId: cropIds.Groundnut,
      diseaseKey: "groundnut-rust",
      diseaseCommonName: "Groundnut Rust",
      diseaseScientificName: "Puccinia arachidis",
      title: "Groundnut rust — verified ICAR package",
      content:
        "Orange-brown to reddish pustules mostly on lower surface of leaves. Often co-occurs with Tikka disease in warm humid conditions.",
      sourceName: "ICAR-DGR Groundnut Crop Protection Guide",
      sourceUrl: "https://dgr.icar.gov.in/",
      medicineName: "Chlorothalonil 75% WP or Hexaconazole 5% EC",
      dosage: "2 g/L water (Chlorothalonil) or 1 ml/L (Hexaconazole)",
      applicationMethod: "Foliar spray with thorough lower-canopy coverage",
      timingFrequency: "Spray at appearance of pustules; repeat in 10–14 days if needed",
      precautionsJson: ["Use tolerant cultivars", "Avoid excess nitrogen", "Scout field regularly after flowering"],
      consequencesIfUntreated: "Causes rapid leaf drying and severe pod yield reduction.",
      probableCause: "Puccinia arachidis spread by airborne urediniospores under humid warm weather.",
    },
    {
      category: "DISEASE" as const,
      cropId: cropIds.Cotton,
      diseaseKey: "cotton-bacterial-blight",
      diseaseCommonName: "Bacterial Blight (Angular Leaf Spot)",
      diseaseScientificName: "Xanthomonas citri pv. malvacearum",
      title: "Cotton bacterial blight — verified CICR package",
      content:
        "Angular water-soaked spots bounded by leaf veinlets, black arm symptom on stems, and boll rot.",
      sourceName: "ICAR-CICR Nagpur Cotton Protection Summary",
      sourceUrl: "https://cicr.org.in/",
      medicineName: "Copper Oxychloride 50% WP + Streptocycline (90:10)",
      dosage: "Copper Oxychloride 2.5 g/L + Streptocycline 0.1 g/L water",
      applicationMethod: "Foliar spray on affected foliage and stems",
      timingFrequency: "At first angular lesion appearance; repeat after 15 days if rainfall continues",
      precautionsJson: ["Acid-delint seed before sowing", "Destroy crop residues", "Avoid field operations when canopy is wet"],
      consequencesIfUntreated: "Stem girdling (black arm) and boll rotting causing severe lint and seed yield loss.",
      probableCause: "Bacterial pathogen Xanthomonas citri pv. malvacearum driven by warm rainy weather.",
    },
    {
      category: "DISEASE" as const,
      cropId: cropIds.Chilli,
      diseaseKey: "chilli-anthracnose",
      diseaseCommonName: "Anthracnose / Die-back (Fruit Rot)",
      diseaseScientificName: "Colletotrichum capsici",
      title: "Chilli anthracnose — verified IIHR guide",
      content:
        "Circular sunken necrotic spots with black concentric rings on ripe fruits; twig die-back from tip downward.",
      sourceName: "ICAR-IIHR Bangalore Chilli Package",
      sourceUrl: "https://iihr.res.in/",
      medicineName: "Azoxystrobin 23% SC or Mancozeb 75% WP",
      dosage: "1 ml/L water (Azoxystrobin) or 2.5 g/L water (Mancozeb)",
      applicationMethod: "Foliar spray covering fruit clusters and foliage",
      timingFrequency: "Start at flowering/fruit set stage; repeat at 10–14 day intervals",
      precautionsJson: ["Collect and burn dried diseased twigs", "Seed treatment with Thiram", "Use balanced potash"],
      consequencesIfUntreated: "Fruit rotting reduces market quality and marketable yield by 30–60%.",
      probableCause: "Fungus Colletotrichum capsici favored by high humidity (80%+) and rain splash.",
    },
    {
      category: "DISEASE" as const,
      cropId: cropIds.Mustard,
      diseaseKey: "mustard-white-rust",
      diseaseCommonName: "White Rust (Blister)",
      diseaseScientificName: "Albugo candida",
      title: "Mustard white rust — verified DRMR summary",
      content:
        "Prominent white or creamy pustules (blisters) on the underside of leaves; floral malformation (staghead symptom).",
      sourceName: "ICAR-DRMR Bharatpur Mustard Guide",
      sourceUrl: "https://drmr.icar.gov.in/",
      medicineName: "Metalaxyl 8% + Mancozeb 64% WP (Ridomil MZ)",
      dosage: "2 g/L water foliar spray",
      applicationMethod: "Foliar spray with uniform canopy coverage",
      timingFrequency: "Apply at 45–50 days after sowing or at first appearance of white blisters",
      precautionsJson: ["Early sowing in October to escape epidemic", "Clean cultivation", "Rotate with non-crucifers"],
      consequencesIfUntreated: "Staghead formation prevents seed setting and causes up to 40% oilseed loss.",
      probableCause: "Albugo candida favored by cool moist nights and warm sunny days.",
    },
    {
      category: "DISEASE" as const,
      cropId: cropIds.Cucumber,
      diseaseKey: "cucumber-angular-leaf-spot",
      diseaseCommonName: "Angular Leaf Spot",
      diseaseScientificName: "Pseudomonas syringae pv. lachrymans",
      title: "Cucumber angular leaf spot — verified ICAR / IIHR management",
      content:
        "Water-soaked angular lesions bounded by leaf veins turning brown and necrotic; dried centers fall out creating a shot-hole appearance. Spreads rapidly under wet foliage.",
      sourceName: "ICAR-Indian Institute of Horticultural Research (IIHR) Bangalore",
      sourceUrl: "https://iihr.res.in/",
      medicineName: "Copper Oxychloride 50% WP + Streptocycline",
      dosage: "Copper Oxychloride 2.5 g/L + Streptocycline 0.1 g/L water",
      applicationMethod: "Foliar spray with thorough coverage on both upper and lower leaf surfaces",
      timingFrequency: "At first angular lesion sighting; repeat after 10–12 days if rains or high humidity persist",
      precautionsJson: [
        "Use disease-free certified seeds or treat seeds with hot water (50°C for 20 min)",
        "Avoid overhead sprinkler irrigation; prefer drip irrigation to keep canopy dry",
        "Practice crop rotation with non-cucurbit crops for 2–3 seasons",
        "Destroy infected crop debris immediately post-harvest",
      ],
      consequencesIfUntreated: "Causes severe defoliation, poor fruit setting, fruit spotting, and up to 40–50% yield loss.",
      probableCause: "Bacterial pathogen Pseudomonas syringae pv. lachrymans spread by splashing water, rain, and wet field operations.",
    },
    {
      category: "DISEASE" as const,
      cropId: cropIds.Cucumber,
      diseaseKey: "cucumber-downy-mildew",
      diseaseCommonName: "Downy Mildew",
      diseaseScientificName: "Pseudoperonospora cubensis",
      title: "Cucumber downy mildew — verified ICAR package",
      content:
        "Angular chlorotic yellow patches on the upper surface bounded by leaf veins; purplish to grayish downy fungal growth on the lower surface.",
      sourceName: "ICAR-IIVR Varanasi Cucurbit Disease Management",
      sourceUrl: "https://iivr.icar.gov.in/",
      medicineName: "Metalaxyl 8% + Mancozeb 64% WP (Ridomil MZ) or Cymoxanil 8% + Mancozeb 64% WP",
      dosage: "2.0 to 2.5 g per litre of water",
      applicationMethod: "Foliar spray with special focus on the lower side of leaves",
      timingFrequency: "Spray immediately on detecting first angular yellow lesions; repeat after 8–10 days in cloudy weather",
      precautionsJson: [
        "Wider plant spacing to promote sunlight and air movement",
        "Avoid late afternoon or evening irrigation",
        "Promptly rogue out severely blighted bottom leaves",
      ],
      consequencesIfUntreated: "Rapid leaf scorching, premature vine senescence, and total crop destruction within two weeks.",
      probableCause: "Oomycete pathogen Pseudoperonospora cubensis driven by high humidity (>90%) and temperatures between 15–22°C.",
    },
    {
      category: "DISEASE" as const,
      cropId: cropIds.Cucumber,
      diseaseKey: "cucumber-powdery-mildew",
      diseaseCommonName: "Powdery Mildew",
      diseaseScientificName: "Podosphaera xanthii / Erysiphe cichoracearum",
      title: "Cucumber powdery mildew — verified ICAR package",
      content:
        "Talcum powder-like white spots developing on leaves and stems, later covering the entire leaf surface causing leaf yellowing and drying.",
      sourceName: "ICAR-IIVR Varanasi / TNAU Agritech",
      sourceUrl: "https://iivr.icar.gov.in/",
      medicineName: "Azoxystrobin 18.2% + Difenoconazole 11.4% SC or Wettable Sulphur 80% WP",
      dosage: "1 ml/L (Azoxystrobin mix) or 2.5–3.0 g/L (Wettable Sulphur)",
      applicationMethod: "Foliar spray covering both foliage surfaces",
      timingFrequency: "Apply when white powdery patches first appear; repeat after 10–14 days if needed",
      precautionsJson: [
        "Maintain clean cultivation and destroy volunteer cucurbit weeds",
        "Avoid excessive nitrogenous fertilizer application",
        "Use resistant or tolerant hybrids where available",
      ],
      consequencesIfUntreated: "Extensive leaf chlorosis and premature defoliation leading to sunscald of fruits and stunted yields.",
      probableCause: "Airborne fungal spores thriving in dry warm conditions with high relative humidity around the plant canopy.",
    },
  ];

  for (const item of items) {
    const exists = await prisma.knowledgeItem.findFirst({ where: { title: item.title } });
    if (exists) continue;
    await prisma.knowledgeItem.create({ data: item });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
