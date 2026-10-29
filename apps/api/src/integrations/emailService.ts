import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { AppError } from "../utils/http.js";

let cachedTransporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    return null;
  }
  if (cachedTransporter) return cachedTransporter;

  const host = env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(env.SMTP_PORT) || 587;
  const secure = port === 465;
  const cleanPass = env.SMTP_PASS.replace(/\s+/g, "");

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: env.SMTP_USER,
      pass: cleanPass,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });

  return cachedTransporter;
}

export class EmailService {
  async send(to: string, subject: string, text: string, html?: string) {
    const transport = getTransporter();
    if (!transport) {
      console.error("[EmailService] SMTP configuration is missing in environment variables.");
      throw new AppError(500, "EMAIL_SEND_FAILED", "We couldn't send the verification code. Please try again later.");
    }
    try {
      await transport.sendMail({
        from: env.SMTP_FROM || `AgroFusion AI <${env.SMTP_USER}>`,
        to,
        subject,
        text,
        html,
      });
    } catch (err: unknown) {
      const safeMsg = err instanceof Error ? err.message : "Delivery error";
      console.error(`[EmailService] Failed to send email to recipient. Reason: ${safeMsg}`);
      throw new AppError(500, "EMAIL_SEND_FAILED", "We couldn't send the verification code. Please try again later.");
    }
  }

  async sendOtp(to: string, otp: string) {
    const subject = "AgroFusion AI Email Verification Code";
    const text = `Your AgroFusion AI verification code is ${otp}. It expires in 10 minutes.\n\nIf you did not create an account, please ignore this email.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #2b7038; font-size: 24px; margin: 0;">AgroFusion AI</h1>
          <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0 0;">Empowering Farmers with Intelligent Agriculture</p>
        </div>
        <div style="padding: 20px; background-color: #f9fafb; border-radius: 8px; text-align: center;">
          <p style="color: #374151; font-size: 15px; margin: 0 0 16px 0;">Please use the following 6-digit verification code to complete your registration:</p>
          <div style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #166534; padding: 12px 24px; background: #dcfce7; border-radius: 8px; display: inline-block;">
            ${otp}
          </div>
          <p style="color: #6b7280; font-size: 13px; margin: 16px 0 0 0;">This code is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
        </div>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; text-align: center;">
          If you did not request this code, you can safely ignore this email.
        </p>
      </div>
    `;
    await this.send(to, subject, text, html);
  }

  async sendPasswordReset(to: string, link: string) {
    const subject = "Reset your AgroFusion AI password";
    const text = `Use this link to set a new password (valid 24 hours):\n${link}\n\nIf you did not request this, ignore this email.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #2b7038; font-size: 24px; margin: 0;">AgroFusion AI</h1>
        </div>
        <div style="padding: 20px; background-color: #f9fafb; border-radius: 8px; text-align: center;">
          <p style="color: #374151; font-size: 15px; margin: 0 0 16px 0;">Click the button below to reset your password (valid for 24 hours):</p>
          <a href="${link}" style="display: inline-block; padding: 12px 24px; background-color: #166534; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; text-align: center;">
          If you did not request this, ignore this email.
        </p>
      </div>
    `;
    await this.send(to, subject, text, html);
  }
}

export const emailService = new EmailService();
