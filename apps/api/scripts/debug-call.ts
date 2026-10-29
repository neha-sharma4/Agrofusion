import fs from "node:fs";
import path from "node:path";
import { env } from "../src/config/env.js";

async function debugCall() {
  const uploads = fs.readdirSync("./uploads").filter((f) => f.endsWith(".png") || f.endsWith(".jpg"));
  const testFile = path.join("./uploads", uploads[0]);
  const buf = fs.readFileSync(testFile);
  console.log("File:", uploads[0], "Size:", buf.length);

  const url = `${env.GEMINI_API_BASE_URL.replace(/\/$/, "")}/models/${encodeURIComponent(env.GEMINI_MODEL)}:generateContent`;
  
  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { text: "Identify this plant and its health or disease condition accurately in JSON format." },
          {
            inlineData: {
              mimeType: "image/png",
              data: buf.toString("base64"),
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": env.GEMINI_API_KEY,
    },
    body: JSON.stringify(body),
  });

  console.log("HTTP status:", res.status, res.statusText);
  const text = await res.text();
  console.log("Response body:", text.slice(0, 500));
}

debugCall().catch(console.error);
