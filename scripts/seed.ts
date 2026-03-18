import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("johndoe123", 12);

  const user = await prisma.user.upsert({
    where: { email: "john@doe.com" },
    update: {},
    create: {
      email: "john@doe.com",
      password: hashedPassword,
      firstName: "John",
      lastName: "Doe",
      role: "admin",
    },
  });

  console.log("Seeded user:", user.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
