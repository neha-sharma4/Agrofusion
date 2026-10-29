import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError, fail } from "../utils/http.js";
import { isProd } from "../config/env.js";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.status).json(fail(err.code, err.message, err.details));
  }
  if (err instanceof ZodError) {
    return res.status(400).json(fail("VALIDATION_ERROR", "Invalid input", err.flatten()));
  }
  console.error(err);
  const message = isProd ? "An unexpected error occurred" : err instanceof Error ? err.message : "Unknown error";
  return res.status(500).json(fail("INTERNAL_ERROR", message));
}

export function asyncHandler<T extends Request>(fn: (req: T, res: Response, next: NextFunction) => Promise<unknown>) {
  return (req: T, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
