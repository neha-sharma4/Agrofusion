import fs from "node:fs";
import path from "node:path";
import { env } from "../src/config/env.js";

async function inspectAll() {
  const uploads = fs.readdirSync("./uploads").filter((f) => f.endsWith(".jpg") || f.endsWith(".png"));
  console.log(`Analyzing ${uploads.length} uploaded images...`);

  const url = `${env.GEMINI_API_BASE_URL.replace(/\/$/, "")}/models/${encodeURIComponent(env.GEMINI_MODEL)}:generateContent`;

  for (let i = 0; i < uploads.length; i++) {
    const f = uploads[i];
    const buf = fs.readFileSync(path.join("./uploads", f));
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: "You are an agricultural vision AI. Analyze this image. What plant/crop is shown, is it healthy or diseased, what disease or symptoms are present? Return JSON with: crop_name, is_healthy (boolean), disease_name (string or null), description (short string).",
                },
                {
                  inlineData: {
                    mimeType: f.endsWith(".png") ? "image/png" : "image/jpeg",
                    data: buf.toString("base64"),
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
          },
        }),
      });

      if (!res.ok) {
        console.log(`[${i + 1}/${uploads.length}] ${f} -> HTTP ${res.status}`);
        continue;
      }

      const json = await res.json();
      const content = json.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log(`[${i + 1}/${uploads.length}] ${f} -> ${content.replace(/\s+/g, " ")}`);
    } catch (err: any) {
      console.error(`[${i + 1}/${uploads.length}] ${f} error:`, err?.message || err);
    }
  }
}

inspectAll().catch(console.error);
