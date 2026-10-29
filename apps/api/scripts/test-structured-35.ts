import { llmClient } from '../src/llm/client.js';
import { DISEASE_SYSTEM_PROMPT } from '../src/llm/prompts.js';
import fs from 'node:fs';
import path from 'node:path';

async function testStructured() {
  const testImage = path.resolve(process.cwd(), 'uploads/020a1466-7803-4d62-87b4-1c0d527cf961.png');
  const b64 = fs.readFileSync(testImage).toString('base64');

  const schema = {
    type: "OBJECT",
    properties: {
      status: {
        type: "STRING",
        enum: [
          "VALID_ASSESSMENT",
          "UNCERTAIN",
          "INVALID_IMAGE",
          "INSUFFICIENT_IMAGE_QUALITY",
          "CROP_MISMATCH",
          "UNSUPPORTED",
          "MISSING_INFORMATION",
        ],
      },
      image_relevant: { type: "BOOLEAN" },
      crop_match: { type: "BOOLEAN" },
      identified_crop: { type: "STRING" },
      image_quality_sufficient: { type: "BOOLEAN" },
      is_healthy: { type: "BOOLEAN" },
      disease_common_name: { type: "STRING" },
      disease_scientific_name: { type: "STRING" },
      confidence: { type: "NUMBER" },
      risk_level: { type: "STRING", enum: ["LOW", "MEDIUM", "HIGH"] },
      visible_symptoms: { type: "ARRAY", items: { type: "STRING" } },
      probable_cause: { type: "STRING" },
      consequences_if_untreated: { type: "STRING" },
      precautions: { type: "ARRAY", items: { type: "STRING" } },
      farmer_friendly_message: { type: "STRING" },
    },
    required: [
      "status",
      "image_relevant",
      "crop_match",
      "image_quality_sufficient",
      "confidence",
      "visible_symptoms",
      "precautions",
      "farmer_friendly_message",
    ],
  };

  try {
    const raw = await llmClient.completeJson({
      user: "Assess this crop sample for foliar diseases. Selected Crop: Cotton, Soil: Black, Region: Central",
      system: DISEASE_SYSTEM_PROMPT,
      responseSchema: schema,
      imageBase64: b64,
      mimeType: "image/png",
    });
    console.log("Raw Response:", JSON.stringify(raw, null, 2));
  } catch (err) {
    console.error("Test failed:", err);
  }
}

testStructured();
