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