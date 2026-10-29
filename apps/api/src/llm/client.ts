import { env } from "../config/env.js";
import { AppError } from "../utils/http.js";

export class LlmUnavailableError extends Error {
  constructor(message = "LLM is not configured") {
    super(message);
    this.name = "LlmUnavailableError";
  }
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const cleaned = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("no json");
  const jsonSlice = cleaned.slice(start, end + 1);
  try {
    return JSON.parse(jsonSlice);
  } catch {
    // Sanitize trailing commas and stray unescaped control characters
    const sanitized = jsonSlice
      .replace(/,\s*([}\]])/g, "$1")
      .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, " ");
    return JSON.parse(sanitized);
  }
}

type GeminiPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } }
  | { inline_data?: { mime_type: string; data: string } };

export interface CompleteJsonOptions {
  system: string;
  user: string;
  imageBase64?: string;
  mimeType?: string;
  responseSchema?: Record<string, unknown>;
}

export class LlmClient {
  isConfigured() {
    return Boolean(env.GEMINI_API_KEY);
  }

  async completeJson(opts: CompleteJsonOptions): Promise<unknown> {
    if (!env.GEMINI_API_KEY) throw new LlmUnavailableError();

    const parts: GeminiPart[] = [{ text: opts.user }];
    if (opts.imageBase64) {
      parts.push({
        inlineData: {
          mimeType: opts.mimeType || "image/jpeg",
          data: opts.imageBase64,
        },
      });
    }

    const generationConfig: Record<string, unknown> = {
      temperature: env.LLM_TEMPERATURE,
      responseMimeType: "application/json",
    };

    if (opts.responseSchema) {
      generationConfig.responseSchema = opts.responseSchema;
    }

    const candidateModels = Array.from(
      new Set([
        env.GEMINI_MODEL,
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
        "gemini-3.5-flash",
        "gemini-3.5-flash-lite",
        "gemini-flash-latest",
        "gemini-flash-lite-latest",
      ])
    ).filter(Boolean);

    let lastError: Error | null = null;
    for (const model of candidateModels) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const url = `${env.GEMINI_API_BASE_URL.replace(/\/$/, "")}/models/${encodeURIComponent(model)}:generateContent`;
          const res = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": env.GEMINI_API_KEY,
            },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: opts.system }] },
              contents: [{ role: "user", parts }],
              generationConfig,
            }),
            signal: AbortSignal.timeout(25000),
          });

          if (!res.ok) {
            const errText = await res.text().catch(() => "");
            console.warn(`[LLM] Model ${model} (attempt ${attempt + 1}) returned HTTP ${res.status}:`, errText.slice(0, 180));
            lastError = new AppError(
              502,
              "LLM_FAILURE",
              `Advisory model request failed with HTTP ${res.status}.`,
              errText.slice(0, 400)
            );
            if ((res.status === 503 || res.status === 429) && attempt === 0) {
              await new Promise((r) => setTimeout(r, 800));
              continue; // retry same model once
            }
            break; // move to next candidate model
          }

          const json = (await res.json()) as {
            candidates?: { content?: { parts?: { text?: string }[] } }[];
          };
          const content = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
          if (!content) {
            lastError = new AppError(502, "LLM_FAILURE", "The advisory service returned an empty response.");
            break;
          }
          try {
            return extractJson(content);
          } catch {
            lastError = new AppError(502, "LLM_MALFORMED", "The advisory service returned an unreadable response.");
            break;
          }
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));
          console.warn(`[LLM] Model ${model} failed:`, lastError.message);
          break;
        }
      }
    }

    throw lastError || new AppError(502, "LLM_FAILURE", "All candidate model requests failed.");
  }
}

export const llmClient = new LlmClient();
