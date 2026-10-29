import { env } from '../src/config/env.js';

async function listModels() {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('No GEMINI_API_KEY');
    return;
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const res = await fetch(url);
  const data = (await res.json()) as any;
  if (data.error) {
    console.error('Error from Gemini API:', data.error);
    return;
  }
  console.log('Available models:');
  const generateModels = data.models?.filter((m: any) =>
    m.supportedGenerationMethods?.includes('generateContent')
  );
  for (const m of generateModels || []) {
    console.log(`- ${m.name} (${m.displayName})`);
  }
}

listModels();
