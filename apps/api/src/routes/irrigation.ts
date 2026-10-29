import { Router } from "express";
import { z } from "zod";
import { AREA_UNITS, MAX_PLOT_AREA_SQ_M, areaToSquareMetres } from "@agrofusion/shared";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { AppError, ok } from "../utils/http.js";
import { assertCycleOwned } from "../services/fieldService.js";
import { irrigationService } from "../services/irrigationService.js";
import { weatherService } from "../integrations/weatherService.js";
import { knowledgeRetrieval } from "../knowledge/retrieval.js";
import { prisma } from "../config/prisma.js";

export const irrigationRouter = Router();
irrigationRouter.use(requireAuth);

irrigationRouter.get(
  "/weather",
  asyncHandler(async (req, res) => {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      throw new AppError(400, "INVALID_LOCATION", "Latitude and longitude are required.");
    }
    const data = await weatherService.fetch(lat, lon);
    if (!data) {
      res.json(
        ok({
          available: false,
          warning: "Weather could not be fetched automatically. Please enter temperature and humidity.",
        }),
      );
      return;
    }
    res.json(ok({ available: true, ...data }));
  }),
);

irrigationRouter.post(
  "/recommend",
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        cropCycleId: z.string(),
        growthStageId: z.string(),
        soilMoisturePct: z.number().min(0).max(100),
        temperatureC: z.number().min(-10).max(55),
        humidityPct: z.number().min(0).max(100),
        plotArea: z.number().positive(),
        plotAreaUnit: z.enum(AREA_UNITS),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        useManualWeather: z.boolean().optional(),
      })
      .parse(req.body);

    const cycle = await assertCycleOwned((req as AuthedRequest).user.id, body.cropCycleId);
    const stage = await prisma.growthStage.findUnique({ where: { id: body.growthStageId } });
    if (!stage) throw new AppError(400, "INVALID_STAGE", "Growth stage is invalid.");

    const plotAreaSqM = areaToSquareMetres(body.plotArea, body.plotAreaUnit);
    if (plotAreaSqM > MAX_PLOT_AREA_SQ_M) {
      throw new AppError(400, "AREA_TOO_LARGE", "Plot area is unusually large. Please check the value and unit.");
    }

    let forecast = null;
    let weatherAutoFetched = false;
    if (!body.useManualWeather && body.latitude != null && body.longitude != null) {
      const weather = await weatherService.fetch(body.latitude, body.longitude);
      if (weather) {
        forecast = weather.forecast;
        weatherAutoFetched = true;
      }
    }

    const moistureNote = await knowledgeRetrieval.moistureNote(cycle.crop.name, cycle.soil.name);
    const result = await irrigationService.recommend({
      userId: (req as AuthedRequest).user.id,
      cropCycleId: cycle.id,
      cropName: cycle.crop.name,
      soilName: cycle.soil.name,
      regionName: cycle.region.name,
      growthStageId: stage.id,
      growthStageName: stage.name,
      soilMoisturePct: body.soilMoisturePct,
      temperatureC: body.temperatureC,
      humidityPct: body.humidityPct,
      plotAreaSqM,
      forecast,
      weatherAutoFetched,
    });

    res.json(
      ok({
        ...result,
        plotAreaSqM,
        forecast,
        weatherAutoFetched,
        moistureWarning: moistureNote
          ? `This value appears unusual for the selected crop and soil. Please confirm the entered value. (${moistureNote})`
          : undefined,
      }),
    );
  }),
);
