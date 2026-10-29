import { Router } from "express";
import { z } from "zod";
import { authService, loginSchema, signupSchema } from "../services/authService.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { authLimiter, otpLimiter } from "../middleware/rateLimit.js";
import { ok } from "../utils/http.js";
import { env } from "../config/env.js";

export const authRouter = Router();

authRouter.post(
  "/signup",
  authLimiter,
  asyncHandler(async (req, res) => {
    const body = signupSchema.parse(req.body);
    const data = await authService.signup(body);
    res.status(201).json(ok(data, "Account created. Verify the code sent to your email."));
  }),
);

authRouter.post(
  "/verify-otp",
  otpLimiter,
  asyncHandler(async (req, res) => {
    const body = z.object({ email: z.string().email(), otp: z.string().length(6) }).parse(req.body);
    const session = await authService.verifyOtp(body.email, body.otp);
    setRefreshCookie(res, session.refreshToken);
    res.json(ok({ accessToken: session.accessToken }));
  }),
);

authRouter.post(
  "/resend-otp",
  otpLimiter,
  asyncHandler(async (req, res) => {
    const body = z.object({ email: z.string().email() }).parse(req.body);
    const result = await authService.resendOtp(body.email);
    res.json(ok(result, "A new code was sent if the account exists."));
  }),
);

authRouter.post(
  "/login",
  authLimiter,
  asyncHandler(async (req, res) => {
    const body = loginSchema.parse(req.body);
    const result = await authService.login(body.email, body.password);
    setRefreshCookie(res, result.refreshToken);
    res.json(ok({ accessToken: result.accessToken, user: result.user }));
  }),
);

authRouter.post(
  "/forgot-password",
  authLimiter,
  asyncHandler(async (req, res) => {
    const body = z.object({ email: z.string().email() }).parse(req.body);
    await authService.forgotPassword(body.email);
    res.json(ok({ sent: true }, "If an account exists, a reset link was sent."));
  }),
);

authRouter.post(
  "/reset-password",
  authLimiter,
  asyncHandler(async (req, res) => {
    const body = z.object({ token: z.string().min(10), password: z.string().min(8) }).parse(req.body);
    await authService.resetPassword(body.token, body.password);
    res.json(ok({ reset: true }, "Password updated. You can log in now."));
  }),
);

authRouter.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken as string | undefined;
    if (!token) {
      res.status(401).json({ success: false, error: { code: "UNAUTHENTICATED", message: "Please log in again." } });
      return;
    }
    const session = await authService.refresh(token);
    setRefreshCookie(res, session.refreshToken);
    res.json(ok({ accessToken: session.accessToken }));
  }),
);

authRouter.post("/logout", (_req, res) => {
  res.clearCookie("refreshToken", cookieOpts());
  res.json(ok({ loggedOut: true }));
});

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await authService.me((req as AuthedRequest).user.id);
    res.json(ok(user));
  }),
);

authRouter.patch(
  "/language",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = z.object({ preferredLanguage: z.enum(["en", "hi"]) }).parse(req.body);
    const data = await authService.updateLanguage((req as AuthedRequest).user.id, body.preferredLanguage);
    res.json(ok(data));
  }),
);

function cookieOpts() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/api/auth",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

function setRefreshCookie(res: import("express").Response, token: string) {
  res.cookie("refreshToken", token, cookieOpts());
}
