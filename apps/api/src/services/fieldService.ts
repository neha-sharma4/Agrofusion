import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/http.js";

export const createFieldSchema = z.object({
  name: z.string().min(2).max(80),
  cropId: z.string().min(1),
  soilTypeId: z.string().min(1),
  regionId: z.string().min(1),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

function cycleInclude() {
  return {
    crop: true,
    soil: true,
    region: true,
    suitabilityChecks: { orderBy: { createdAt: "desc" as const }, take: 1 },
    irrigationRecommendations: { orderBy: { createdAt: "desc" as const }, take: 1 },
    diseaseScans: { orderBy: { createdAt: "desc" as const }, take: 1 },
  };
}

export class FieldService {
  async list(userId: string) {
    const fields = await prisma.field.findMany({
      where: { userId, status: "ACTIVE" },
      include: {
        cropCycles: {
          include: cycleInclude(),
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    return fields.map((field) => {
      const active = field.cropCycles.find((c) => c.status === "ACTIVE") ?? field.cropCycles[0];
      return { ...field, activeCycle: active, advisoryBadge: badge(active) };
    });
  }

  async get(userId: string, fieldId: string) {
    const field = await prisma.field.findFirst({
      where: { id: fieldId, userId },
      include: {
        cropCycles: { include: cycleInclude(), orderBy: { createdAt: "desc" } },
      },
    });
    if (!field) throw new AppError(404, "NOT_FOUND", "Field not found.");
    const active = field.cropCycles.find((c) => c.status === "ACTIVE") ?? null;
    return { ...field, activeCycle: active };
  }

  async create(userId: string, input: z.infer<typeof createFieldSchema>) {
    await assertMaster(input.cropId, input.soilTypeId, input.regionId);
    return prisma.field.create({
      data: {
        userId,
        name: input.name,
        latitude: input.latitude,
        longitude: input.longitude,
        cropCycles: {
          create: {
            cropId: input.cropId,
            soilTypeId: input.soilTypeId,
            regionId: input.regionId,
            startDate: new Date(),
            status: "ACTIVE",
          },
        },
      },
      include: { cropCycles: { include: cycleInclude() } },
    });
  }

  async startNewCropCycle(
    userId: string,
    fieldId: string,
    input: { cropId: string; soilTypeId: string; regionId: string },
  ) {
    const field = await prisma.field.findFirst({ where: { id: fieldId, userId } });
    if (!field) throw new AppError(404, "NOT_FOUND", "Field not found.");
    await assertMaster(input.cropId, input.soilTypeId, input.regionId);
    await prisma.cropCycle.updateMany({
      where: { fieldId, status: "ACTIVE" },
      data: { status: "COMPLETED", endDate: new Date() },
    });
    return prisma.cropCycle.create({
      data: {
        fieldId,
        cropId: input.cropId,
        soilTypeId: input.soilTypeId,
        regionId: input.regionId,
        startDate: new Date(),
        status: "ACTIVE",
      },
      include: cycleInclude(),
    });
  }

  async archive(userId: string, fieldId: string) {
    const field = await prisma.field.findFirst({ where: { id: fieldId, userId } });
    if (!field) throw new AppError(404, "NOT_FOUND", "Field not found.");
    return prisma.field.update({ where: { id: fieldId }, data: { status: "ARCHIVED" } });
  }
}

async function assertMaster(cropId: string, soilTypeId: string, regionId: string) {
  const [crop, soil, region] = await Promise.all([
    prisma.crop.findUnique({ where: { id: cropId } }),
    prisma.soilType.findUnique({ where: { id: soilTypeId } }),
    prisma.agroClimaticRegion.findUnique({ where: { id: regionId } }),
  ]);
  if (!crop || !soil || !region) throw new AppError(400, "INVALID_MASTER_DATA", "Crop, soil, or region is invalid.");
}

function badge(cycle: { irrigationRecommendations: { urgency: string; createdAt: Date }[]; diseaseScans: { status: string; isHealthy: boolean | null; createdAt: Date }[] } | undefined) {
  if (!cycle) return "No recent activity";
  const lastIrr = cycle.irrigationRecommendations[0];
  const lastScan = cycle.diseaseScans[0];
  const recentIrr = lastIrr && Date.now() - lastIrr.createdAt.getTime() < 3 * 24 * 60 * 60 * 1000;
  if (recentIrr && (lastIrr.urgency === "HIGH" || lastIrr.urgency === "CRITICAL")) return "Irrigation due";
  if (lastScan) {
    if (lastScan.status === "UNCERTAIN" || lastScan.status === "UNSUPPORTED") return "Disease scan needs review";
    if (lastScan.isHealthy) return "Last scan: Healthy";
    if (lastScan.status === "VALID_ASSESSMENT") return "Last scan: Needs attention";
  }
  if (!lastIrr && !lastScan) return "No recent activity";
  return "Active";
}

export const fieldService = new FieldService();

export async function assertCycleOwned(userId: string, cropCycleId: string) {
  const cycle = await prisma.cropCycle.findFirst({
    where: { id: cropCycleId, field: { userId } },
    include: { crop: true, soil: true, region: true, field: true },
  });
  if (!cycle) throw new AppError(404, "NOT_FOUND", "Crop cycle not found.");
  return cycle;
}
