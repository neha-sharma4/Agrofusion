import type { Request } from "express";

export function param(req: Request, name: string): string {
  const value = req.params[name];
  const id = Array.isArray(value) ? value[0] : value;
  if (!id) throw new Error(`Missing route param ${name}`);
  return id;
}
