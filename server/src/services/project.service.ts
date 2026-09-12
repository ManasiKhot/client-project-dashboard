import { prisma } from "../config/prisma";

export const getProjectsForUser = async (
  userId: string,
  role: "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER"
) => {
  if (role === "ADMIN") {
    return prisma.project.findMany({
      include: {
        client: true,
        manager: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  if (role === "PROJECT_MANAGER") {
    return prisma.project.findMany({
      where: {
        managerId: userId,
      },
      include: {
        client: true,
        manager: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  return prisma.project.findMany({
    where: {
      tasks: {
        some: {
          developerId: userId,
        },
      },
    },
    include: {
      client: true,
      manager: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
export const createProject = async ({
  name,
  description,
  clientId,
  managerId,
}: {
  name: string;
  description?: string;
  clientId: string;
  managerId: string;
}) => {
  const client = await prisma.client.findUnique({
    where: {
      id: clientId,
    },
  });

  if (!client) {
    throw new Error("CLIENT_NOT_FOUND");
  }

  const manager = await prisma.user.findUnique({
    where: {
      id: managerId,
    },
  });

  if (!manager || manager.role !== "PROJECT_MANAGER") {
    throw new Error("INVALID_MANAGER");
  }

  return prisma.project.create({
    data: {
      name,
      description,
      clientId,
      managerId,
    },
    include: {
      client: true,
      manager: true,
    },
  });
};