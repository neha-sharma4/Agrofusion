import { prisma } from "../config/prisma.js";
import type { KnowledgeCategory } from "@prisma/client";

export type RetrievedKnowledge = {
  id: string;
  category: KnowledgeCategory;
  title: string;
  content: string;
  sourceName: string;
  sourceUrl: string | null;
  diseaseKey: string | null;
  diseaseCommonName: string | null;
  diseaseScientificName: string | null;
  medicineName: string | null;
  dosage: string | null;
  applicationMethod: string | null;
  timingFrequency: string | null;
  precautionsJson: unknown;
  consequencesIfUntreated: string | null;
  probableCause: string | null;
  typicalDepthMm: number | null;
  moistureNote: string | null;
};

function toRetrieved(item: RetrievedKnowledge) {
  return item;
}

export class KnowledgeRetrievalService {
  async forSuitability(cropName: string, soilName: string, regionName: string) {
    const items = await prisma.knowledgeItem.findMany({
      where: {
        isVerified: true,
        category: { in: ["SUITABILITY", "IRRIGATION"] },
        OR: [
          { crop: { name: cropName } },
          { soilTypeName: { contains: soilName } },
          { regionName: { contains: regionName } },
          { title: { contains: cropName } },
        ],
      },
      take: 12,
    });
    return items.map(toRetrieved);
  }

  async forIrrigation(cropName: string, soilName: string) {
    const items = await prisma.knowledgeItem.findMany({
      where: {
        isVerified: true,
        category: { in: ["IRRIGATION", "SUITABILITY"] },
        OR: [
          { crop: { name: cropName } },
          { soilTypeName: { contains: soilName } },
          { title: { contains: cropName } },
        ],
      },
      take: 10,
    });
    return items.map(toRetrieved);
  }

  async typicalDepth(cropName: string, soilName: string) {
    const item = await prisma.knowledgeItem.findFirst({
      where: {
        isVerified: true,
        category: "IRRIGATION",
        typicalDepthMm: { not: null },
        OR: [
          { crop: { name: cropName } },
          { soilTypeName: { contains: soilName } },
        ],
      },
      orderBy: { updatedAt: "desc" },
    });
    return item?.typicalDepthMm ?? null;
  }

  async moistureNote(cropName: string, soilName: string) {
    const item = await prisma.knowledgeItem.findFirst({
      where: {
        isVerified: true,
        moistureNote: { not: null },
        OR: [
          { crop: { name: cropName } },
          { soilTypeName: { contains: soilName } },
        ],
      },
    });
    return item?.moistureNote ?? null;
  }

  async forDisease(cropName: string, diseaseHint?: string | null) {
    const items = await prisma.knowledgeItem.findMany({
      where: {
        isVerified: true,
        category: { in: ["DISEASE", "TREATMENT"] },
        OR: [
          { crop: { name: cropName } },
          diseaseHint
            ? {
                OR: [
                  { diseaseKey: { contains: diseaseHint } },
                  { diseaseCommonName: { contains: diseaseHint } },
                  { diseaseScientificName: { contains: diseaseHint } },
                  { title: { contains: diseaseHint } },
                ],
              }
            : undefined,
        ].filter(Boolean) as object[],
      },
      take: 20,
    });
    return items.map(toRetrieved);
  }

  async findTreatment(diseaseName: string, cropName?: string) {
    if (!diseaseName) return null;
    const cleanName = diseaseName.trim().toLowerCase();

    // 1. First attempt direct SQL match
    const direct = await prisma.knowledgeItem.findFirst({
      where: {
        isVerified: true,
        category: { in: ["DISEASE", "TREATMENT"] },
        medicineName: { not: null },
        dosage: { not: null },
        AND: [
          {
            OR: [
              { diseaseCommonName: diseaseName },
              { diseaseScientificName: diseaseName },
              { diseaseKey: diseaseName },
              { title: { contains: diseaseName } },
            ],
          },
          cropName
            ? {
                OR: [{ crop: { name: cropName } }, { cropId: null }],
              }
            : {},
        ],
      },
    });
    if (direct) return direct;

    // 2. Fetch all candidates for the crop and perform flexible matching
    const candidates = await prisma.knowledgeItem.findMany({
      where: {
        isVerified: true,
        category: { in: ["DISEASE", "TREATMENT"] },
        medicineName: { not: null },
        dosage: { not: null },
        ...(cropName
          ? {
              OR: [{ crop: { name: cropName } }, { cropId: null }],
            }
          : {}),
      },
    });

    for (const item of candidates) {
      const common = (item.diseaseCommonName ?? "").toLowerCase();
      const scientific = (item.diseaseScientificName ?? "").toLowerCase();
      const key = (item.diseaseKey ?? "").toLowerCase();
      const title = item.title.toLowerCase();

      if (
        (common && (cleanName.includes(common) || common.includes(cleanName))) ||
        (scientific && (cleanName.includes(scientific) || scientific.includes(cleanName))) ||
        (key && cleanName.includes(key)) ||
        title.includes(cleanName)
      ) {
        return item;
      }

      // Token-level match (e.g. "tikka", "cercospora", "blight", "rust", "blast")
      const tokens = cleanName.split(/[\s(),\/-]+/).filter((t) => t.length > 3);
      for (const token of tokens) {
        if (common.includes(token) || scientific.includes(token) || key.includes(token)) {
          return item;
        }
      }
    }

    // 3. Fallback: Search all verified disease knowledge items regardless of crop
    if (cropName) {
      const globalCandidates = await prisma.knowledgeItem.findMany({
        where: {
          isVerified: true,
          category: { in: ["DISEASE", "TREATMENT"] },
          medicineName: { not: null },
          dosage: { not: null },
        },
      });

      for (const item of globalCandidates) {
        const common = (item.diseaseCommonName ?? "").toLowerCase();
        const scientific = (item.diseaseScientificName ?? "").toLowerCase();
        const key = (item.diseaseKey ?? "").toLowerCase();
        const title = item.title.toLowerCase();

        if (
          (common && (cleanName.includes(common) || common.includes(cleanName))) ||
          (scientific && (cleanName.includes(scientific) || scientific.includes(cleanName))) ||
          (key && cleanName.includes(key)) ||
          title.includes(cleanName)
        ) {
          return item;
        }

        const tokens = cleanName.split(/[\s(),\/-]+/).filter((t) => t.length > 3);
        for (const token of tokens) {
          if (common.includes(token) || scientific.includes(token) || key.includes(token)) {
            return item;
          }
        }
      }
    }

    return null;
  }

  formatForPrompt(items: RetrievedKnowledge[]) {
    if (!items.length) return "No verified knowledge-base excerpts were retrieved for this request.";
    return items
      .map((i) => {
        const treatment =
          i.medicineName && i.dosage
            ? `Verified treatment: ${i.medicineName}; dosage: ${i.dosage}; method: ${i.applicationMethod ?? "n/a"}; timing: ${i.timingFrequency ?? "n/a"}`
            : "Verified treatment: not listed in this excerpt.";
        return [
          `SOURCE: ${i.sourceName}${i.sourceUrl ? ` (${i.sourceUrl})` : ""}`,
          `TITLE: ${i.title}`,
          i.diseaseCommonName ? `DISEASE: ${i.diseaseCommonName} / ${i.diseaseScientificName ?? ""}` : "",
          i.content,
          treatment,
          i.probableCause ? `Probable cause (verified): ${i.probableCause}` : "",
          i.consequencesIfUntreated ? `If untreated (verified): ${i.consequencesIfUntreated}` : "",
        ]
          .filter(Boolean)
          .join("\n");
      })
      .join("\n---\n");
  }
}

export const knowledgeRetrieval = new KnowledgeRetrievalService();
