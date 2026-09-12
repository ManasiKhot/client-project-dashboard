import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const main = async () => {
  const passwordHash = await bcrypt.hash("Password123!", 10);

  await prisma.user.createMany({
    data: [
      {
        name: "Admin User",
        email: "admin@example.com",
        passwordHash,
        role: "ADMIN",
      },
      {
        name: "Project Manager One",
        email: "pm1@example.com",
        passwordHash,
        role: "PROJECT_MANAGER",
      },
      {
        name: "Project Manager Two",
        email: "pm2@example.com",
        passwordHash,
        role: "PROJECT_MANAGER",
      },
      {
        name: "Developer One",
        email: "dev1@example.com",
        passwordHash,
        role: "DEVELOPER",
      },
      {
        name: "Developer Two",
        email: "dev2@example.com",
        passwordHash,
        role: "DEVELOPER",
      },
      {
        name: "Developer Three",
        email: "dev3@example.com",
        passwordHash,
        role: "DEVELOPER",
      },
      {
        name: "Developer Four",
        email: "dev4@example.com",
        passwordHash,
        role: "DEVELOPER",
      },
    ],
    skipDuplicates: true,
  });

  const client = await prisma.client.create({
    data: {
      name: "TechCorp Client",
      email: "client@techcorp.com",
      company: "TechCorp Solutions",
    },
  });

  console.log("Client created:", client.email);
  console.log("Seed completed successfully.");
};

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });