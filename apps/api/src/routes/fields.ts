import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { createFieldSchema, fieldService, assertCycleOwned } from "../services/fieldService.js";
import { ok } from "../utils/http.js";
import { param } from "../utils/params.js";
import { suggestRegionFromGps } from "../utils/regionSuggest.js";
import { weatherService } from "../integrations/weatherService.js";

export const fieldsRouter = Router();
fieldsRouter.use(requireAuth);

fieldsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const data = await fieldService.list((req as AuthedRequest).user.id);
    res.json(ok(data));
  }),
);

fieldsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const body = createFieldSchema.parse(req.body);
    const data = await fieldService.create((req as AuthedRequest).user.id, body);
    res.status(201).json(ok(data));
  }),
);

fieldsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
        const data = await fieldService.get((req as AuthedRequest).user.id, param(req, "id"));
    res.json(ok(data));
  }),
);

fieldsRouter.post(
  "/:id/new-crop-cycle",
  asyncHandler(async (req, res) => {
    const body = z
      .object({ cropId: z.string(), soilTypeId: z.string(), regionId: z.string() })
      .parse(req.body);
        const data = await fieldService.startNewCropCycle((req as AuthedRequest).user.id, param(req, "id"), body);
    res.status(201).json(ok(data));
  }),
);

fieldsRouter.patch(
  "/:id/archive",
  asyncHandler(async (req, res) => {
        const data = await fieldService.archive((req as AuthedRequest).user.id, param(req, "id"));
    res.json(ok(data));
  }),
);

export const cropCyclesRouter = Router();
cropCyclesRouter.use(requireAuth);

cropCyclesRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
        const cycle = await assertCycleOwned((req as AuthedRequest).user.id, param(req, "id"));
    res.json(ok(cycle));
  }),
);

cropCyclesRouter.get(
  "/:id/history",
  asyncHandler(async (req, res) => {
        const cycle = await assertCycleOwned((req as AuthedRequest).user.id, param(req, "id"));
    const [suitability, irrigation, scans] = await Promise.all([
      prisma.suitabilityCheck.findMany({ where: { cropCycleId: cycle.id }, orderBy: { createdAt: "desc" } }),
      prisma.irrigationRecommendation.findMany({ where: { cropCycleId: cycle.id }, orderBy: { createdAt: "desc" } }),
      prisma.diseaseScan.findMany({
        where: { cropCycleId: cycle.id },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          isHealthy: true,
          diseaseCommonName: true,
          confidence: true,
          riskLevel: true,
          message: true,
          createdAt: true,
        },
      }),
    ]);
    res.json(ok({ cycle, suitability, irrigation, scans }));
  }),
);

export const catalogRouter = Router();
catalogRouter.use(requireAuth);

catalogRouter.get(
  "/crops",
  asyncHandler(async (_req, res) => {
    res.json(ok(await prisma.crop.findMany({ where: { isActive: true }, orderBy: { name: "asc" } })));
  }),
);
catalogRouter.get(
  "/soil-types",
  asyncHandler(async (_req, res) => {
    res.json(ok(await prisma.soilType.findMany({ where: { isActive: true }, orderBy: { name: "asc" } })));
  }),
);
catalogRouter.get(
  "/regions",
  asyncHandler(async (_req, res) => {
    res.json(ok(await prisma.agroClimaticRegion.findMany({ where: { isActive: true }, orderBy: { name: "asc" } })));
  }),
);
catalogRouter.get(
  "/growth-stages",
  asyncHandler(async (req, res) => {
    const cropId = typeof req.query.cropId === "string" && req.query.cropId.trim() ? req.query.cropId.trim() : undefined;
    if (cropId) {
      const cropStages = await prisma.growthStage.findMany({
        where: { cropId },
        orderBy: { sortOrder: "asc" },
      });
      if (cropStages.length > 0) {
        res.json(ok(cropStages));
        return;
      }
    }
    const genericStages = await prisma.growthStage.findMany({
      where: { cropId: null },
      orderBy: { sortOrder: "asc" },
    });
    res.json(ok(genericStages));
  }),
);
catalogRouter.get(
  "/suggest-region",
  asyncHandler(async (req, res) => {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);
    const hint = Number.isFinite(lat) && Number.isFinite(lon) ? suggestRegionFromGps(lat, lon) : null;
    if (!hint) {
      res.json(ok({ suggestion: null }));
      return;
    }
    const region = await prisma.agroClimaticRegion.findFirst({
      where: { name: hint.name },
    });
    res.json(ok({ suggestion: hint, region }));
  }),
);
catalogRouter.get(
  "/reverse-geocode",
  asyncHandler(async (req, res) => {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      res.json(ok({ locationName: null }));
      return;
    }
    const locationName = await weatherService.reverseGeocode(lat, lon);
    res.json(ok({ locationName }));
  }),
);
