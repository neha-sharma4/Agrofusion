import fs from "node:fs";
import path from "node:path";
import { llmClient } from "../src/llm/client.js";

async function identifyImages() {
  const uploads = fs.readdirSync("./uploads").filter((f) => f.endsWith(".jpg") || f.endsWith(".png"));
  console.log(`Checking ${uploads.length} uploaded images...`);

  for (const f of uploads) {
    const buf = fs.readFileSync(path.join("./uploads", f));
    try {
      const res = await llmClient.completeJson({
        system: "You are an agricultural vision AI. Identify the plant/crop and any disease or symptoms shown in the image with high precision. Return JSON with keys: identified_crop, condition_or_disease, is_healthy (boolean), confidence (0-1), description.",
        user: "Identify this plant and its health or disease condition accurately.",
        imageBase64: buf.toString("base64"),
        mimeType: f.endsWith(".png") ? "image/png" : "image/jpeg",
      });
      console.log(`File: ${f} ->`, JSON.stringify(res));
    } catch (e: any) {
      console.error(`File: ${f} failed:`, e?.message || e);
    }
  }
}

identifyImages().catch(console.error);
