import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { ok } from "../utils/http.js";
import { param } from "../utils/params.js";

export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

adminRouter.get(
  "/users",
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isEmailVerified: true,
        accountStatus: true,
        createdAt: true,
      },
    });
    res.json(ok(users));
  }),
);

adminRouter.patch(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const body = z.object({ accountStatus: z.enum(["ACTIVE", "SUSPENDED"]) }).parse(req.body);
    const user = await prisma.user.update({ where: { id: param(req, "id") }, data: { accountStatus: body.accountStatus } });
    res.json(ok({ id: user.id, accountStatus: user.accountStatus }));
  }),
);

adminRouter.get(
  "/llm-logs",
  asyncHandler(async (req, res) => {
    const flagged = req.query.flagged === "true";
    const logs = await prisma.llmLog.findMany({
      where: flagged ? { flaggedForReview: true } : undefined,
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    res.json(ok(logs));
  }),
);

adminRouter.get(
  "/analytics",
  asyncHandler(async (_req, res) => {
    const [farmers, totalAccounts, fields, irrigations, scans, feedback, flagged, failed] = await Promise.all([
      prisma.user.count({ where: { role: "FARMER" } }),
      prisma.user.count(),
      prisma.field.count(),
      prisma.irrigationRecommendation.count(),
      prisma.diseaseScan.count(),
      prisma.feedback.groupBy({ by: ["rating"], _count: true }),
      prisma.llmLog.count({ where: { flaggedForReview: true } }),
      prisma.llmLog.count({ where: { validationStatus: "FAILED" } }),
    ]);
    const crops = await prisma.cropCycle.groupBy({ by: ["cropId"], _count: true });
    const cropNames = await prisma.crop.findMany({ where: { id: { in: crops.map((c) => c.cropId) } } });
    const cropMap = Object.fromEntries(cropNames.map((c) => [c.id, c.name]));
    const diseases = await prisma.diseaseScan.groupBy({
      by: ["diseaseCommonName"],
      _count: true,
      where: { diseaseCommonName: { not: null } },
    });
    res.json(
      ok({
        totalUsers: farmers,
        totalFarmers: farmers,
        totalAccounts,
        fields,
        irrigationRecommendations: irrigations,
        diseaseScans: scans,
        flaggedLlmOutputs: flagged,
        failedLlmRequests: failed,
        feedback,
        mostSelectedCrops: crops
          .map((c) => ({ crop: cropMap[c.cropId] ?? "Unknown", count: c._count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
        mostDetectedDiseases: diseases
          .map((d) => ({ disease: d.diseaseCommonName ?? "Unknown", count: d._count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
      }),
    );
  }),
);

function crud(model: {
  findMany: (args: never) => Promise<unknown>;
  create: (args: never) => Promise<unknown>;
  update: (args: never) => Promise<unknown>;
  delete: (args: never) => Promise<unknown>;
}, createSchema: z.AnyZodObject) {
  const r = Router();
  r.get(
    "/",
    asyncHandler(async (_req, res) => {
      res.json(ok(await model.findMany({ orderBy: { name: "asc" } } as never)));
    }),
  );
  r.post(
    "/",
    asyncHandler(async (req, res) => {
      const data = createSchema.parse(req.body);
      res.status(201).json(ok(await model.create({ data } as never)));
    }),
  );
  r.patch(
    "/:id",
    asyncHandler(async (req, res) => {
      const data = createSchema.partial().parse(req.body);
      res.json(ok(await model.update({ where: { id: param(req, "id") }, data } as never)));
    }),
  );
  r.delete(
    "/:id",
    asyncHandler(async (req, res) => {
      await model.delete({ where: { id: param(req, "id") } } as never);
      res.json(ok({ deleted: true }));
    }),
  );
  return r;
}

adminRouter.use(
  "/crops",
  crud(prisma.crop as never, z.object({ name: z.string(), nameLocal: z.string().optional(), category: z.string(), iconKey: z.string().optional(), isActive: z.boolean().optional() })),
);
adminRouter.use(
  "/soil-types",
  crud(prisma.soilType as never, z.object({ name: z.string(), nameLocal: z.string().optional(), isActive: z.boolean().optional() })),
);
adminRouter.use(
  "/regions",
  crud(
    prisma.agroClimaticRegion as never,
    z.object({ name: z.string(), nameLocal: z.string().optional(), statesCovered: z.string(), isActive: z.boolean().optional() }),
  ),
);

adminRouter.get(
  "/growth-stages",
  asyncHandler(async (_req, res) => {
    res.json(ok(await prisma.growthStage.findMany({ include: { crop: true }, orderBy: [{ cropId: "asc" }, { sortOrder: "asc" }] })));
  }),
);
adminRouter.post(
  "/growth-stages",
  asyncHandler(async (req, res) => {
    const body = z.object({ cropId: z.string().nullable().optional(), name: z.string(), sortOrder: z.number().int() }).parse(req.body);
    res.status(201).json(ok(await prisma.growthStage.create({ data: body })));
  }),
);
adminRouter.patch(
  "/growth-stages/:id",
  asyncHandler(async (req, res) => {
    const body = z.object({ name: z.string().optional(), sortOrder: z.number().int().optional() }).parse(req.body);
    res.json(ok(await prisma.growthStage.update({ where: { id: param(req, "id") }, data: body })));
  }),
);
adminRouter.delete(
  "/growth-stages/:id",
  asyncHandler(async (req, res) => {
    await prisma.growthStage.delete({ where: { id: param(req, "id") } });
    res.json(ok({ deleted: true }));
  }),
);

adminRouter.get(
  "/knowledge",
  asyncHandler(async (_req, res) => {
    res.json(ok(await prisma.knowledgeItem.findMany({ include: { crop: true }, orderBy: { updatedAt: "desc" } })));
  }),
);
adminRouter.post(
  "/knowledge",
  asyncHandler(async (req, res) => {
    const body = knowledgeSchema.parse(req.body);
    res.status(201).json(ok(await prisma.knowledgeItem.create({ data: body })));
  }),
);
adminRouter.patch(
  "/knowledge/:id",
  asyncHandler(async (req, res) => {
    const body = knowledgeSchema.partial().parse(req.body);
    res.json(ok(await prisma.knowledgeItem.update({ where: { id: param(req, "id") }, data: body })));
  }),
);
adminRouter.delete(
  "/knowledge/:id",
  asyncHandler(async (req, res) => {
    await prisma.knowledgeItem.delete({ where: { id: param(req, "id") } });
    res.json(ok({ deleted: true }));
  }),
);

const knowledgeSchema = z.object({
  category: z.enum(["SUITABILITY", "DISEASE", "IRRIGATION", "TREATMENT"]),
  cropId: z.string().nullable().optional(),
  diseaseKey: z.string().nullable().optional(),
  diseaseCommonName: z.string().nullable().optional(),
  diseaseScientificName: z.string().nullable().optional(),
  title: z.string(),
  content: z.string(),
  sourceName: z.string(),
  sourceUrl: z.string().nullable().optional(),
  medicineName: z.string().nullable().optional(),
  dosage: z.string().nullable().optional(),
  applicationMethod: z.string().nullable().optional(),
  timingFrequency: z.string().nullable().optional(),
  consequencesIfUntreated: z.string().nullable().optional(),
  probableCause: z.string().nullable().optional(),
  typicalDepthMm: z.number().nullable().optional(),
  moistureNote: z.string().nullable().optional(),
  isVerified: z.boolean().optional(),
});
