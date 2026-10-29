import { prisma } from "../src/config/prisma.js";

async function checkLlmLogs() {
  const logs = await prisma.llmLog.findMany({
    where: { endpoint: "disease.scan" },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  console.log(`Found ${logs.length} disease.scan LLM logs:`);
  for (const l of logs) {
    console.log("-----------------------------------------");
    console.log("ID:", l.id, "Status:", l.validationStatus, "Flagged:", l.flaggedForReview, "Error:", l.errorMessage);
    console.log("Input:", l.inputPayload);
    console.log("Raw output:", JSON.stringify(l.outputPayload, null, 2)?.slice(0, 500));
  }
}

checkLlmLogs().catch(console.error).finally(() => prisma.$disconnect());
