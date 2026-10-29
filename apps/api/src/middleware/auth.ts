import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/http.js";
import { verifyAccessToken } from "../utils/crypto.js";

export type AuthedRequest = Request & {
  user: { id: string; role: "FARMER" | "ADMIN" };
};

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) throw new AppError(401, "UNAUTHENTICATED", "Please log in to continue.");
  try {
    const payload = verifyAccessToken(token);
    (req as AuthedRequest).user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    throw new AppError(401, "UNAUTHENTICATED", "Your session expired. Please log in again.");
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const user = (req as AuthedRequest).user;
  if (!user || user.role !== "ADMIN") {
    throw new AppError(403, "FORBIDDEN", "Admin access required.");
  }
  next();
}
