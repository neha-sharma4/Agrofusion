import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./routes/auth.js";
import { catalogRouter, cropCyclesRouter, fieldsRouter } from "./routes/fields.js";
import { suitabilityRouter } from "./routes/suitability.js";
import { irrigationRouter } from "./routes/irrigation.js";
import { diseaseRouter } from "./routes/disease.js";
import { feedbackRouter, historyRouter } from "./routes/history.js";
import { adminRouter } from "./routes/admin.js";

export function createApp() {
  const app = express();
  app.set("trust proxy", 1);
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.use(express.json({ limit: "2mb" }));
  app.use(apiLimiter);

  app.get("/api/health", (_req, res) => {
    res.json({
      success: true,
      data: {
        status: "ok",
        llmConfigured: Boolean(env.GEMINI_API_KEY),
        weatherConfigured: Boolean(env.WEATHER_API_KEY),
      },
    });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/fields", fieldsRouter);
  app.use("/api/crop-cycles", cropCyclesRouter);
  app.use("/api/catalog", catalogRouter);
  app.use("/api/suitability", suitabilityRouter);
  app.use("/api/irrigation", irrigationRouter);
  app.use("/api/disease", diseaseRouter);
  app.use("/api/history", historyRouter);
  app.use("/api/feedback", feedbackRouter);
  app.use("/api/admin", adminRouter);

  app.use(errorHandler);
  return app;
}
