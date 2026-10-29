import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { ok } from "../utils/http.js";

export const historyRouter = Router();
historyRouter.use(requireAuth);

historyRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const userId = (req as AuthedRequest).user.id;
    const type = typeof req.query.type === "string" ? req.query.type : undefined;
    const from = typeof req.query.from === "string" ? new Date(req.query.from) : undefined;
    const to = typeof req.query.to === "string" ? new Date(req.query.to) : undefined;
    const fieldId = typeof req.query.fieldId === "string" ? req.query.fieldId : undefined;
    const cropCycleId = typeof req.query.cropCycleId === "string" ? req.query.cropCycleId : undefined;

    const cycleFilter = {
      ...(cropCycleId ? { id: cropCycleId } : {}),
      field: { userId, ...(fieldId ? { id: fieldId } : {}) },
    };

    const date = (createdAt: { gte?: Date; lte?: Date }) => {
      if (from && !Number.isNaN(from.getTime())) createdAt.gte = from;
      if (to && !Number.isNaN(to.getTime())) createdAt.lte = to;
      return Object.keys(createdAt).length ? createdAt : undefined;
    };

    const createdAt = date({});
    const items: { type: string; id: string; createdAt: Date; summary: string; extra?: unknown }[] = [];

    if (!type || type === "suitability") {
      const rows = await prisma.suitabilityCheck.findMany({
        where: { cropCycle: cycleFilter, createdAt },
        include: { cropCycle: { include: { crop: true, field: true } } },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
      items.push(
        ...rows.map((r) => ({
          type: "suitability",
          id: r.id,
          createdAt: r.createdAt,
          summary: `${r.cropCycle.field.name} · ${r.cropCycle.crop.name}: ${r.isSuitable ? "Suitable" : "Not suitable"}`,
          extra: { confidence: r.confidence, reasoning: r.reasoning },
        })),
      );
    }
    if (!type || type === "irrigation") {
      const rows = await prisma.irrigationRecommendation.findMany({
        where: { cropCycle: cycleFilter, createdAt },
        include: { cropCycle: { include: { crop: true, field: true } } },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
      items.push(
        ...rows.map((r) => ({
          type: "irrigation",
          id: r.id,
          createdAt: r.createdAt,
          summary: `${r.cropCycle.field.name} · ${r.urgency} · ${r.recommendedVolumeLiters} L`,
          extra: { urgency: r.urgency, mm: r.recommendedAmountMm },
        })),
      );
    }
    if (!type || type === "disease") {
      const rows = await prisma.diseaseScan.findMany({
        where: { cropCycle: cycleFilter, createdAt },
        include: { cropCycle: { include: { crop: true, field: true } } },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
      items.push(
        ...rows.map((r) => ({
          type: "disease",
          id: r.id,
          createdAt: r.createdAt,
          summary: `${r.cropCycle.field.name} · ${r.diseaseCommonName || r.status}`,
          extra: { status: r.status, confidence: r.confidence, isHealthy: r.isHealthy },
        })),
      );
    }

    items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    res.json(ok(items));
  }),
);

export const feedbackRouter = Router();
feedbackRouter.use(requireAuth);

feedbackRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        relatedType: z.enum(["suitability", "irrigation", "disease"]),
        relatedId: z.string(),
        rating: z.enum(["helpful", "not_helpful"]),
        comment: z.string().max(1000).optional(),
      })
      .parse(req.body);
    const row = await prisma.feedback.create({
      data: {
        userId: (req as AuthedRequest).user.id,
        relatedType: body.relatedType,
        relatedId: body.relatedId,
        rating: body.rating,
        comment: body.comment,
      },
    });
    res.status(201).json(ok(row));
  }),
);
