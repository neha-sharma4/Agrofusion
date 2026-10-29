import fs from "node:fs";
import path from "node:path";
import { diseaseAssessmentService } from "../src/services/disease/DiseaseAssessmentService.js";

async function main() {
  console.log("Reading uploads directory...");
  const uploads = fs.readdirSync("./uploads").filter((f) => f.endsWith(".jpg") || f.endsWith(".png"));
  console.log(`Found ${uploads.length} uploaded files.`);
  if (uploads.length === 0) {
    console.log("No uploads found.");
    return;
  }
  const file = uploads[0];
  console.log(`Testing image: ${file}`);
  const imgBuf = fs.readFileSync(path.join("./uploads", file));
  console.log(`Read ${imgBuf.length} bytes. Calling diseaseAssessmentService.assess...`);
  
  const start = Date.now();
  const res = await diseaseAssessmentService.assess({
    userId: "direct-test-user",
    cropCycleId: "direct-test-cycle",
    cropName: "Groundnut",
    soilName: "Alluvial",
    regionName: "Gujarat Plains & Hills Region",
    imageBase64: imgBuf.toString("base64"),
    mimeType: file.endsWith(".png") ? "image/png" : "image/jpeg",
    imageKey: file,
  });
  console.log(`Assessment completed in ${Date.now() - start}ms`);
  console.log("RESULT:", JSON.stringify(res, null, 2));
}

main().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
