import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.users.upsert({
    create: {
      email: "admin",
      role: "ADMIN",
      name: "test user",
    },
    update: {
      email: "admin",
      role: "ADMIN",
      name: "test user",
    },
    where: { email: "admin" },
  });
  await prisma.accessTokens.upsert({
    create: {
      userId: user.id,
      token: "admin",
    },
    update: { token: "admin" },
    where: { userId: user.id },
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
