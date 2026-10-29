import { prisma } from "../src/config/prisma.js";

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      isEmailVerified: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
  console.log("ALL USERS IN DATABASE:");
  console.log(JSON.stringify(users, null, 2));
}

main().finally(() => prisma.$disconnect());
