import { Router } from "express";
import multer from "multer";
import sharp from "sharp";
import { z } from "zod";
import { env } from "../config/env.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { AppError, ok } from "../utils/http.js";
import { assertCycleOwned } from "../services/fieldService.js";
import { diseaseAssessmentService, persistDiseaseScan } from "../services/disease/DiseaseAssessmentService.js";
import { saveUpload, resolveUpload } from "../utils/storage.js";
import { param } from "../utils/params.js";
import { scanLimiter } from "../middleware/rateLimit.js";
import { prisma } from "../config/prisma.js";
import fs from "node:fs";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_UPLOAD_BYTES },
});

export const diseaseRouter = Router();
diseaseRouter.use(requireAuth);

diseaseRouter.post(
  "/validate-image",
  upload.single("image"),
  asyncHandler(async (req, res) => {
    const file = req.file;
    if (!file) throw new AppError(400, "MISSING_IMAGE", "Please upload a plant or leaf photo.");
    const quality = await inspectImageQuality(file.buffer);
    res.json(ok(quality));
  }),
);

diseaseRouter.post(
  "/scan",
  scanLimiter,
  upload.single("image"),
  asyncHandler(async (req, res) => {
    const file = req.file;
    if (!file) throw new AppError(400, "MISSING_IMAGE", "Please upload a plant or leaf photo.");
    const body = z.object({ cropCycleId: z.string() }).parse(req.body);
    const cycle = await assertCycleOwned((req as AuthedRequest).user.id, body.cropCycleId);
    const quality = await inspectImageQuality(file.buffer);
    if (!quality.ok) {
      const key = await saveUpload(file.buffer, file.originalname);
      const result = {
        status: quality.status,
        image_quality_sufficient: false,
        message: quality.message,
      } as const;
      const saved = await persistDiseaseScan(cycle.id, key, {
        status: quality.status,
        message: quality.message,
      });
      res.json(ok({ ...result, id: saved.id, imageId: saved.id }));
      return;
    }
    const key = await saveUpload(file.buffer, file.originalname);
    const compressed = await sharp(file.buffer).rotate().jpeg({ quality: 72 }).resize(1280, 1280, { fit: "inside" }).toBuffer();
    const assessment = await diseaseAssessmentService.assess({
      userId: (req as AuthedRequest).user.id,
      cropCycleId: cycle.id,
      cropName: cycle.crop.name,
      soilName: cycle.soil.name,
      regionName: cycle.region.name,
      imageBase64: compressed.toString("base64"),
      mimeType: "image/jpeg",
      imageKey: key,
    });
    const saved = await persistDiseaseScan(cycle.id, key, assessment);
    res.json(ok({ ...assessment, id: saved.id, imageId: saved.id }));
  }),
);

diseaseRouter.get(
  "/images/:scanId",
  asyncHandler(async (req, res) => {
    const scan = await prisma.diseaseScan.findFirst({
      where: { id: param(req, "scanId"), cropCycle: { field: { userId: (req as AuthedRequest).user.id } } },
    });
    if (!scan) throw new AppError(404, "NOT_FOUND", "Image not found.");
    const full = resolveUpload(scan.imageKey);
    if (!fs.existsSync(full)) throw new AppError(404, "NOT_FOUND", "Image file is missing.");
    res.sendFile(full);
  }),
);

async function inspectImageQuality(buffer: Buffer) {
  try {
    const image = sharp(buffer);
    const meta = await image.metadata();
    const stats = await image.stats();
    const width = meta.width ?? 0;
    const height = meta.height ?? 0;
    if (width < 80 || height < 80) {
      return {
        ok: false as const,
        status: "INSUFFICIENT_IMAGE_QUALITY" as const,
        message: "The image is not clear enough for a reliable assessment. Please take another photo in good lighting and focus on the affected leaf.",
      };
    }
    const channels = stats.channels ?? [];
    const mean = channels.reduce((s, c) => s + c.mean, 0) / Math.max(channels.length, 1);
    const stdev = channels.reduce((s, c) => s + c.stdev, 0) / Math.max(channels.length, 1);
    if (mean < 18) {
      return {
        ok: false as const,
        status: "INSUFFICIENT_IMAGE_QUALITY" as const,
        message: "The image is not clear enough for a reliable assessment. Please take another photo in good lighting and focus on the affected leaf.",
      };
    }
    if (stdev < 8) {
      return {
        ok: false as const,
        status: "INSUFFICIENT_IMAGE_QUALITY" as const,
        message: "The image is not clear enough for a reliable assessment. Please take another photo in good lighting and focus on the affected leaf.",
      };
    }
    return { ok: true as const, width, height };
  } catch {
    return {
      ok: false as const,
      status: "INVALID_IMAGE" as const,
      message: "This image does not appear to show the selected crop. Please upload a clear photo of the affected plant or leaf.",
    };
  }
}
