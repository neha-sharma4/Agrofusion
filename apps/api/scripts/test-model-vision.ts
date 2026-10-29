import { env } from '../src/config/env.js';
import fs from 'node:fs';
import path from 'node:path';

async function testModels() {
  const apiKey = env.GEMINI_API_KEY;
  const models = [
    'gemini-2.5-flash',
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-flash-latest',
    'gemini-flash-lite-latest',
    'gemini-2.5-pro',
  ];

  const testImage = path.resolve(process.cwd(), 'uploads/020a1466-7803-4d62-87b4-1c0d527cf961.png');
  const b64 = fs.readFileSync(testImage).toString('base64');

  for (const m of models) {
    console.log(`\nTesting model: ${m}...`);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: 'Identify the plant and any disease symptoms in 1 short sentence.' },
                { inlineData: { mimeType: 'image/png', data: b64 } },
              ],
            },
          ],
        }),
      });
      const data = (await res.json()) as any;
      if (data.error) {
        console.log(`❌ ${m} Error:`, data.error.code, data.error.message?.slice(0, 100));
      } else {
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log(`✅ ${m} Success:`, text?.trim());
      }
    } catch (e: any) {
      console.log(`❌ ${m} Network Exception:`, e.message);
    }
  }
}

testModels();
