import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { prisma } from "../config/prisma.js";
import { AppError, ok } from "../utils/http.js";
import { suitabilityService } from "../services/suitabilityService.js";
import { assertCycleOwned } from "../services/fieldService.js";

export const suitabilityRouter = Router();
suitabilityRouter.use(requireAuth);

suitabilityRouter.post(
  "/check",
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        cropId: z.string(),
        soilTypeId: z.string(),
        regionId: z.string(),
        cropCycleId: z.string().optional(),
      })
      .parse(req.body);
    const [crop, soil, region] = await Promise.all([
      prisma.crop.findUnique({ where: { id: body.cropId } }),
      prisma.soilType.findUnique({ where: { id: body.soilTypeId } }),
      prisma.agroClimaticRegion.findUnique({ where: { id: body.regionId } }),
    ]);
    if (!crop || !soil || !region) throw new AppError(400, "INVALID_MASTER_DATA", "Crop, soil, or region is invalid.");
    let persistToCycleId: string | undefined;
    if (body.cropCycleId) {
      await assertCycleOwned((req as AuthedRequest).user.id, body.cropCycleId);
      persistToCycleId = body.cropCycleId;
    }
    const result = await suitabilityService.check({
      userId: (req as AuthedRequest).user.id,
      cropName: crop.name,
      soilName: soil.name,
      regionName: region.name,
      persistToCycleId,
    });
    res.json(ok(result));
  }),
);
