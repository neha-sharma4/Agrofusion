export class AppError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export function ok<T>(data: T, message?: string) {
  return { success: true as const, message, data };
}

export function fail(code: string, message: string, details?: unknown) {
  return { success: false as const, error: { code, message, details } };
}
