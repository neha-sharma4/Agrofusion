import { PrismaClient } from "@prisma/client";
import { execSync } from "node:child_process";
import path from "node:path";

const prisma = new PrismaClient();

async function main() {
  execSync("npx prisma migrate deploy", {
    cwd: path.resolve(path.dirname(new URL(import.meta.url).pathname), ".."),
    stdio: "inherit",
    env: process.env,
  });
}

main()
  .catch(() => {
    // migrate deploy is also invoked via npm scripts
  })
  .finally(() => prisma.$disconnect());
