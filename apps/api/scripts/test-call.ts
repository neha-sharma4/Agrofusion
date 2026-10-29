import { env } from "../src/config/env.js";

async function testCall() {
  const url = `${env.GEMINI_API_BASE_URL.replace(/\/$/, "")}/models/${encodeURIComponent(env.GEMINI_MODEL)}:generateContent`;
  console.log("Calling URL:", url);
  console.log("Using API key:", env.GEMINI_API_KEY ? `${env.GEMINI_API_KEY.slice(0, 8)}...` : "NONE");

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
          parts: [{ text: "Hello! Reply in JSON: {\"status\": \"ok\"}" }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    }),
  });

  console.log("HTTP status:", res.status, res.statusText);
  const text = await res.text();
  console.log("Response body:", text.slice(0, 1000));
}

testCall().catch(console.error);
