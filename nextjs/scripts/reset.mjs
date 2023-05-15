import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Resetting Search...");
  await prisma.$queryRawUnsafe("DELETE FROM Search");
  await prisma.$queryRawUnsafe("DELETE FROM UserSearch");
  console.log("Finished resetting Search.");
}

main();
