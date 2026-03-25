"use server"
import { prisma } from "../prisma_client";

export const getTestByClass = async (classId: string) => {
  return prisma.test.findMany({
    where: {
      isPublished: true,
      classes: {
        some: {
          id: classId,
        },
      },
    },
  });
};