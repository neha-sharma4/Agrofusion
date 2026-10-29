import fs from "node:fs";
import path from "node:path";
import { diseaseAssessmentService } from "../src/services/disease/DiseaseAssessmentService.js";
import { prisma } from "../src/config/prisma.js";

async function testService() {
  console.log("=== Testing DiseaseAssessmentService.assess ===");
  
  // Pick a cotton crop image
  const imgPath = path.resolve("./uploads/020a1466-7803-4d62-87b4-1c0d527cf961.png");
  if (!fs.existsSync(imgPath)) {
    console.error("Test image not found:", imgPath);
    return;
  }

  const base64 = fs.readFileSync(imgPath).toString("base64");
  const result = await diseaseAssessmentService.assess({
    userId: "test-user-id",
    cropCycleId: "test-cycle-id",
    cropName: "Cotton",
    soilName: "Black",
    regionName: "Western Dry Region",
    imageBase64: base64,
    mimeType: "image/png",
    imageKey: "020a1466-7803-4d62-87b4-1c0d527cf961.png",
  });

  console.log("\nAssessment Result:");
  console.log(JSON.stringify(result, null, 2));
}

testService()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
