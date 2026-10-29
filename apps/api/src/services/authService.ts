import { z } from "zod";
import {
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_MS,
  OTP_TTL_MS,
  PASSWORD_RESET_TTL_MS,
} from "@agrofusion/shared";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/http.js";
import { hashSecret, randomOtp, randomToken, sha256, signAccessToken, verifySecret } from "../utils/crypto.js";
import { emailService } from "../integrations/emailService.js";

export const signupSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().min(8).max(20),
  password: z.string().min(8).max(100),
  preferredLanguage: z.enum(["en", "hi"]).default("en"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export class AuthService {
  async signup(input: z.infer<typeof signupSchema>) {
    const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (existing) {
      if (!existing.isEmailVerified) {
        throw new AppError(409, "EMAIL_UNVERIFIED", "An account with this email already exists but is not verified.");
      }
      throw new AppError(409, "EMAIL_IN_USE", "An account with this email already exists.");
    }
    const passwordHash = await hashSecret(input.password);
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        phone: input.phone,
        passwordHash,
        role: "FARMER",
        preferredLanguage: input.preferredLanguage,
      },
    });

    try {
      await this.sendOtp(user.id, user.email);
    } catch (err) {
      await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
      throw err;
    }

    return { id: user.id, email: user.email, requiresVerification: true };
  }

  async sendOtp(userId: string, email: string, force = false) {
    const latest = await prisma.otpVerification.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    if (latest && Date.now() - latest.lastSentAt.getTime() < OTP_RESEND_COOLDOWN_MS && !force) {
      const waitSec = Math.ceil((OTP_RESEND_COOLDOWN_MS - (Date.now() - latest.lastSentAt.getTime())) / 1000);
      throw new AppError(429, "OTP_COOLDOWN", `Please wait ${waitSec} seconds before requesting another code.`);
    }

    // Invalidate any previous active OTPs so they cannot be used
    await prisma.otpVerification.updateMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      data: {
        expiresAt: new Date(),
      },
    });

    const otp = randomOtp();
    const otpCodeHash = await hashSecret(otp);
    await prisma.otpVerification.create({
      data: {
        userId,
        otpCodeHash,
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
    });
    await emailService.sendOtp(email, otp);
    return { sent: true };
  }

  async resendOtp(email: string) {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) throw new AppError(404, "NOT_FOUND", "No account found for this email.");
    if (user.isEmailVerified) throw new AppError(400, "ALREADY_VERIFIED", "This account is already verified.");
    await this.sendOtp(user.id, user.email);
    return { sent: true };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) throw new AppError(404, "NOT_FOUND", "No account found for this email.");
    const record = await prisma.otpVerification.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    if (!record) throw new AppError(400, "OTP_MISSING", "No verification code found. Please request a new one.");
    if (record.expiresAt.getTime() < Date.now()) {
      throw new AppError(400, "OTP_EXPIRED", "This code has expired. Please request a new one.");
    }
    if (record.attemptCount >= OTP_MAX_ATTEMPTS) {
      throw new AppError(400, "OTP_LOCKED", "Too many incorrect attempts. Request a new code.");
    }
    const match = await verifySecret(otp, record.otpCodeHash);
    await prisma.otpVerification.update({
      where: { id: record.id },
      data: { attemptCount: { increment: 1 } },
    });
    if (!match) throw new AppError(400, "OTP_INVALID", "That code is incorrect.");
    await prisma.user.update({ where: { id: user.id }, data: { isEmailVerified: true } });
    return this.issueSession(user.id, user.role);
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) throw new AppError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
    if (user.accountStatus !== "ACTIVE") {
      throw new AppError(403, "ACCOUNT_SUSPENDED", "This account is not active. Contact support.");
    }
    const ok = await verifySecret(password, user.passwordHash);
    if (!ok) throw new AppError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
    if (!user.isEmailVerified) {
      throw new AppError(403, "UNVERIFIED", "Please verify your email before logging in.");
    }
    const session = await this.issueSession(user.id, user.role);
    return {
      ...session,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
      },
    };
  }

  async issueSession(userId: string, role: "FARMER" | "ADMIN") {
    const accessToken = signAccessToken(userId, role);
    const refresh = randomToken();
    await prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: sha256(refresh),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    return { accessToken, refreshToken: refresh };
  }

  async refresh(refreshToken: string) {
    const tokenHash = sha256(refreshToken);
    const record = await prisma.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null },
    });
    if (!record || record.expiresAt.getTime() < Date.now()) {
      throw new AppError(401, "INVALID_REFRESH", "Please log in again.");
    }
    await prisma.refreshToken.update({ where: { id: record.id }, data: { revokedAt: new Date() } });
    const user = await prisma.user.findUnique({ where: { id: record.userId } });
    if (!user || user.accountStatus !== "ACTIVE") throw new AppError(401, "INVALID_REFRESH", "Please log in again.");
    return this.issueSession(user.id, user.role);
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return;
    const token = randomToken();
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        tokenHash: sha256(token),
        expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
      },
    });
    const link = `${env.FRONTEND_URL}/reset-password?token=${token}`;
    await emailService.sendPasswordReset(user.email, link);
  }

  async resetPassword(token: string, password: string) {
    const tokenHash = sha256(token);
    const record = await prisma.passwordReset.findFirst({ where: { tokenHash } });
    if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
      throw new AppError(400, "INVALID_RESET", "This reset link is invalid or expired.");
    }
    const passwordHash = await hashSecret(password);
    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      prisma.passwordReset.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      prisma.refreshToken.updateMany({ where: { userId: record.userId, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);
  }

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true, role: true, preferredLanguage: true, isEmailVerified: true },
    });
    if (!user) throw new AppError(404, "NOT_FOUND", "User not found.");
    return user;
  }

  async updateLanguage(userId: string, preferredLanguage: "en" | "hi") {
    return prisma.user.update({
      where: { id: userId },
      data: { preferredLanguage },
      select: { id: true, preferredLanguage: true },
    });
  }
}

export const authService = new AuthService();
